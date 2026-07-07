import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Type, Image as ImageIcon, Trash2, Palette, Undo, Redo } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Editor() {
  const [, params] = useRoute("/images/editor/:slideIndex");
  const [, setLocation] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [bgColor, setBgColor] = useState("#ffffff");
  
  // History state
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isHistoryUpdate = useRef(false);

  useEffect(() => {
    // Auth guard
    if (!localStorage.getItem("mcq_token")) {
      setLocation("/login");
      return;
    }
  }, [setLocation]);

  useEffect(() => {
    if (!canvasRef.current || !params?.slideIndex) return;

    const slidesStr = sessionStorage.getItem("mcq_slides");
    if (!slidesStr) {
      setLocation("/images");
      return;
    }

    const slides = JSON.parse(slidesStr);
    const slideDataUrl = slides[parseInt(params.slideIndex)];
    if (!slideDataUrl) {
      setLocation("/images");
      return;
    }

    // Initialize Fabric
    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#f1f5f9", // subtle gray outside the slide
      preserveObjectStacking: true,
    });
    setFabricCanvas(canvas);

    // Load background image
    fabric.Image.fromURL(slideDataUrl).then((img) => {
      // Resize canvas to fit image
      const w = img.width || 800;
      const h = img.height || 600;
      
      canvas.setDimensions({ width: w, height: h });
      
      // Set as actual background
      canvas.backgroundImage = img;
      setBgColor("#ffffff");
      
      canvas.renderAll();
      saveHistory(canvas);
    });

    // History tracking
    canvas.on('object:modified', () => saveHistory(canvas));
    canvas.on('object:added', (e) => {
      if (e.target && !isHistoryUpdate.current) saveHistory(canvas);
    });
    canvas.on('object:removed', () => {
      if (!isHistoryUpdate.current) saveHistory(canvas);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace" || e.key === "Delete") {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
          // Don't delete if actively editing text
          if (canvas.getActiveObject() instanceof fabric.IText && (canvas.getActiveObject() as fabric.IText).isEditing) {
            return;
          }
          activeObjects.forEach((obj) => canvas.remove(obj));
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      canvas.dispose();
    };
  }, [params?.slideIndex, setLocation]);

  const saveHistory = (canvas: fabric.Canvas) => {
    if (isHistoryUpdate.current) return;
    const json = JSON.stringify(canvas.toJSON());
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(json);
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0 && fabricCanvas) {
      isHistoryUpdate.current = true;
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      fabricCanvas.loadFromJSON(history[newIdx], () => {
        fabricCanvas.renderAll();
        isHistoryUpdate.current = false;
      });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && fabricCanvas) {
      isHistoryUpdate.current = true;
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      fabricCanvas.loadFromJSON(history[newIdx], () => {
        fabricCanvas.renderAll();
        isHistoryUpdate.current = false;
      });
    }
  };

  const addText = () => {
    if (!fabricCanvas) return;
    const text = new fabric.IText("Click to edit", {
      left: fabricCanvas.width ? fabricCanvas.width / 2 : 100,
      top: fabricCanvas.height ? fabricCanvas.height / 2 : 100,
      originX: "center",
      originY: "center",
      fontFamily: "Outfit",
      fontSize: 32,
      fill: "#1e293b",
      fontWeight: 600,
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
  };

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!fabricCanvas || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result;
      if (typeof data === "string") {
        fabric.Image.fromURL(data).then((img) => {
          img.scaleToWidth(200);
          img.set({
            left: fabricCanvas.width ? fabricCanvas.width / 2 : 100,
            top: fabricCanvas.height ? fabricCanvas.height / 2 : 100,
            originX: "center",
            originY: "center",
          });
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.renderAll();
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // reset
  };

  const updateBgColor = (color: string) => {
    setBgColor(color);
    if (!fabricCanvas || !fabricCanvas.backgroundImage) return;
    
    // We can't tint an image background easily without filters, 
    // but we can apply a background color to the canvas itself 
    // and reduce image opacity if needed, OR just change canvas background.
    // For this app, the background IS the generated image. 
    // If they want to change color, we add a rect behind everything.
    
    const rects = fabricCanvas.getObjects().filter(o => (o as fabric.FabricObject & { name?: string }).name === 'custom_bg');
    rects.forEach(r => fabricCanvas.remove(r));

    const bgRect = new fabric.Rect({
      left: 0, top: 0,
      width: fabricCanvas.width,
      height: fabricCanvas.height,
      fill: color,
      selectable: false,
      evented: false,
    });
    (bgRect as unknown as { name: string }).name = 'custom_bg';
    
    fabricCanvas.insertAt(0, bgRect);
    fabricCanvas.renderAll();
    saveHistory(fabricCanvas);
  };

  const deleteSelected = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach((obj) => fabricCanvas.remove(obj));
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
    }
  };

  const downloadCanvas = () => {
    if (!fabricCanvas) return;
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1 // can increase for higher res export
    });
    
    const link = document.createElement('a');
    link.download = `slide_edited_${params?.slideIndex}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen flex flex-col bg-muted/30">
      <header className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/images">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="h-4 w-px bg-border"></div>
          <h1 className="font-semibold text-sm">Slide Editor</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleUndo} disabled={historyIndex <= 0}>
            <Undo className="w-4 h-4 mr-2" /> Undo
          </Button>
          <Button variant="outline" size="sm" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
            <Redo className="w-4 h-4 mr-2" /> Redo
          </Button>
          <div className="h-6 w-px bg-border mx-2"></div>
          <Button variant="default" size="sm" onClick={downloadCanvas} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <aside className="w-16 bg-white border-r flex flex-col items-center py-4 gap-4 shrink-0 z-10">
          <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl" onClick={addText} title="Add Text">
            <Type className="w-5 h-5" />
          </Button>
          
          <div className="relative">
            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl" title="Add Image">
              <ImageIcon className="w-5 h-5" />
            </Button>
            <input 
              type="file" 
              accept="image/*" 
              onChange={addImage} 
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          <div className="relative w-12 h-12 group" title="Change Background">
            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl">
              <Palette className="w-5 h-5" />
            </Button>
            <Input 
              type="color" 
              value={bgColor}
              onChange={(e) => updateBgColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full p-0 border-0"
            />
          </div>

          <div className="flex-1"></div>

          <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10" onClick={deleteSelected} title="Delete Selected (Del)">
            <Trash2 className="w-5 h-5" />
          </Button>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 overflow-auto bg-[#e2e8f0] relative">
          <div className="absolute inset-0 flex items-center justify-center p-8 min-w-max min-h-max">
            <div className="shadow-2xl ring-1 ring-black/5 rounded-sm overflow-hidden bg-white" style={{ width: fabricCanvas?.width || 'auto', height: fabricCanvas?.height || 'auto' }}>
              <canvas ref={canvasRef} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
