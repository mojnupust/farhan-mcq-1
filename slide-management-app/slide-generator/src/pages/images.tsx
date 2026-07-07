import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useLogin,
  useListExamCategories,
  useListQuestionSets,
  useListQuestions,
  getListQuestionSetsQueryKey,
  getListQuestionsQueryKey,
} from "@workspace/api-client-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import { loginSchema, LoginFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { renderSlide, SlideSettings, defaultSettings } from "@/lib/slide-renderer";
import { Download, Edit2, Loader2, LogOut, ArrowRight, Settings2, Image as ImageIcon } from "lucide-react";

export function Login() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      mobile: "",
      password: "",
    },
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (result) => {
        const token = result?.data?.token;
        if (token) {
          localStorage.setItem("mcq_token", token);
          toast({ title: "Logged in successfully" });
          setLocation("/images");
        } else {
          toast({ title: "Login failed", description: "No token received", variant: "destructive" });
        }
      },
      onError: () => {
        toast({ title: "Login failed", description: "Invalid email or password", variant: "destructive" });
      },
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setIsLoggingIn(true);
    loginMutation.mutate(
      { data: { mobile: data.mobile, password: data.password } },
      { onSettled: () => setIsLoggingIn(false) }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <ImageIcon className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Login to access the Slide Generator</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="01XXXXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export function Images() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedQuestionSetId, setSelectedQuestionSetId] = useState<string>("");
  
  const [settings, setSettings] = useState<SlideSettings>(defaultSettings);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState<string[]>([]);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("mcq_token");
    if (!token) {
      setLocation("/login");
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("mcq_token");
    setLocation("/login");
  };

  // Queries
  const { data: examsData, isLoading: examsLoading } = useListExamCategories();

  // Load all question sets once an exam is selected (authenticated call to /question-sets/live)
  const { data: questionSetsData, isLoading: questionSetsLoading } = useListQuestionSets(
    { query: { enabled: !!selectedExamId, queryKey: getListQuestionSetsQueryKey() } }
  );

  const { data: _questionsData, refetch: refetchQuestions, isFetching: questionsLoading } = useListQuestions(
    selectedQuestionSetId,
    { query: { enabled: false, queryKey: getListQuestionsQueryKey(selectedQuestionSetId) } }
  );

  // Derive filtered list: show all sets (backend already scopes to authed user)
  const allSets = questionSetsData?.data ?? [];
  const selectedExam = examsData?.data?.find(e => e.id === selectedExamId);

  // Helper to chunk array
  const chunkArray = <T,>(arr: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const handleGenerate = async () => {
    if (!selectedQuestionSetId) {
      toast({ title: "Select a question set", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGeneratedSlides([]);

    try {
      // Fetch questions for the selected question set
      const fetchResult = await refetchQuestions();
      const qs = fetchResult.data?.data;
      if (!qs || qs.length === 0) {
        toast({ title: "No questions found", description: "This question set has no questions", variant: "destructive" });
        setIsGenerating(false);
        return;
      }

      const qChunks = settings.mode === "single" 
        ? chunkArray(qs, 1) 
        : chunkArray(qs, settings.questionsPerSlide);

      const totalSlides = qChunks.length;
      const slides: string[] = [];

      for (let i = 0; i < qChunks.length; i++) {
        const slideUrl = await renderSlide(qChunks[i], settings, i, totalSlides);
        slides.push(slideUrl);
      }

      setGeneratedSlides(slides);
      sessionStorage.setItem("mcq_slides", JSON.stringify(slides));
      
      toast({ title: `Generated ${slides.length} slides successfully` });
      
      // Scroll to results
      document.getElementById('results-area')?.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
      console.error(error);
      toast({ title: "Failed to generate slides", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAllZip = async () => {
    if (generatedSlides.length === 0) return;
    
    const zip = new JSZip();
    const folder = zip.folder("mcq_slides");
    if (!folder) return;

    generatedSlides.forEach((dataUrl, i) => {
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      folder.file(`slide_${(i + 1).toString().padStart(3, '0')}.png`, base64Data, { base64: true });
    });

    try {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "mcq_slides.zip");
    } catch (error) {
      toast({ title: "Failed to create ZIP", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">Slide Studio</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8 space-y-8">
        
        {/* Step 1 + 2: Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1: Exam Category */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Step 1</CardTitle>
              <CardDescription className="text-base text-foreground font-medium">Select Exam</CardDescription>
            </CardHeader>
            <CardContent>
              {examsLoading ? (
                <div className="h-10 flex items-center justify-center bg-muted/50 rounded-md"><Loader2 className="w-4 h-4 animate-spin" /></div>
              ) : (
                <Select value={selectedExamId} onValueChange={(val) => {
                  setSelectedExamId(val);
                  setSelectedQuestionSetId("");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Exam..." />
                  </SelectTrigger>
                  <SelectContent>
                    {examsData?.data?.map(ex => (
                      <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Question Set */}
          <Card className={!selectedExamId ? "opacity-50 pointer-events-none" : ""}>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Step 2</CardTitle>
              <CardDescription className="text-base text-foreground font-medium">Select Question Set</CardDescription>
            </CardHeader>
            <CardContent>
              {questionSetsLoading ? (
                <div className="h-10 flex items-center justify-center bg-muted/50 rounded-md"><Loader2 className="w-4 h-4 animate-spin" /></div>
              ) : (
                <Select value={selectedQuestionSetId} onValueChange={setSelectedQuestionSetId} disabled={!selectedExamId}>
                  <SelectTrigger>
                    <SelectValue placeholder={allSets.length === 0 && selectedExamId ? "No question sets found" : "Select Question Set..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {allSets.map(qs => (
                      <SelectItem key={qs.id} value={qs.id}>
                        {qs.title}{qs.totalQuestions ? ` (${qs.totalQuestions} Qs)` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedExamId && !questionSetsLoading && allSets.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">{allSets.length} question set{allSets.length !== 1 ? "s" : ""} available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Step 2: Settings */}
        {selectedQuestionSetId && (
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" />
                <CardTitle>Slide Customization</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
              
              <div className="space-y-4 lg:col-span-2 grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={settings.bgColor} className="w-12 h-10 p-1"
                           onChange={e => setSettings({...settings, bgColor: e.target.value})} />
                    <Input type="text" value={settings.bgColor} className="flex-1 font-mono uppercase"
                           onChange={e => setSettings({...settings, bgColor: e.target.value})} />
                  </div>
                </div>
                
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Correct Answer Highlight</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={settings.correctColor} className="w-12 h-10 p-1"
                           onChange={e => setSettings({...settings, correctColor: e.target.value})} />
                    <Input type="text" value={settings.correctColor} className="flex-1 font-mono uppercase"
                           onChange={e => setSettings({...settings, correctColor: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Question Text Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={settings.questionTextColor} className="w-12 h-10 p-1"
                           onChange={e => setSettings({...settings, questionTextColor: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Option Text Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={settings.optionTextColor} className="w-12 h-10 p-1"
                           onChange={e => setSettings({...settings, optionTextColor: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Question Text Size</Label>
                    <span className="text-xs text-muted-foreground font-mono">{settings.questionTextSize}px</span>
                  </div>
                  <Slider 
                    value={[settings.questionTextSize]} 
                    min={12} max={32} step={1}
                    onValueChange={([val]) => setSettings({...settings, questionTextSize: val})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Slide Width</Label>
                  <Select value={settings.slideWidth.toString()} onValueChange={(val) => setSettings({...settings, slideWidth: parseInt(val)})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="800">800px (Standard)</SelectItem>
                      <SelectItem value="1080">1080px (HD)</SelectItem>
                      <SelectItem value="1200">1200px (Widescreen)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Layout Mode</Label>
                  <Select value={settings.mode} onValueChange={(val: "single" | "multi") => setSettings({...settings, mode: val})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multi">Multiple Questions per Slide</SelectItem>
                      <SelectItem value="single">Single Question (Large)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.mode === "multi" && (
                  <div className="space-y-2">
                    <Label>Questions per Slide</Label>
                    <Input type="number" min={1} max={10} value={settings.questionsPerSlide}
                           onChange={e => setSettings({...settings, questionsPerSlide: parseInt(e.target.value) || 5})} />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label>Include Explanations</Label>
                    <p className="text-xs text-muted-foreground">Show detailed answers</p>
                  </div>
                  <Switch 
                    checked={settings.showExplanation} 
                    onCheckedChange={(val) => setSettings({...settings, showExplanation: val})} 
                  />
                </div>
              </div>

            </CardContent>
            <CardFooter className="border-t bg-muted/10 pt-6 flex justify-end">
              <Button size="lg" onClick={handleGenerate} disabled={isGenerating} className="min-w-[200px] text-base">
                {isGenerating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <ImageIcon className="w-5 h-5 mr-2" />}
                Generate Slides
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Results Area */}
        <div id="results-area" className="pt-8">
          {generatedSlides.length > 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
                <div>
                  <h2 className="text-xl font-bold">Generated Slides</h2>
                  <p className="text-sm text-muted-foreground">{generatedSlides.length} slides ready for download</p>
                </div>
                <Button variant="default" onClick={downloadAllZip}>
                  <Download className="w-4 h-4 mr-2" />
                  Download All as ZIP
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedSlides.map((src, idx) => (
                  <Card key={idx} className="overflow-hidden group flex flex-col">
                    <div className="aspect-video bg-muted relative overflow-hidden flex-1 border-b">
                      <img src={src} alt={`Slide ${idx + 1}`} className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                        <Button variant="secondary" size="sm" asChild>
                          <a href={src} download={`slide_${idx + 1}.png`}>
                            <Download className="w-4 h-4 mr-2" />
                            Save
                          </a>
                        </Button>
                        <Button variant="default" size="sm" asChild>
                          <Link href={`/images/editor/${idx}`}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 flex justify-between items-center text-sm font-medium text-muted-foreground bg-muted/10">
                      <span>Slide {idx + 1}</span>
                      <span className="text-xs">{settings.slideWidth}px wide</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
