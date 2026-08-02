"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  slideService,
  type Scene,
  type SceneNode,
  type Slide,
} from "@/features/slides";
import { normalizeSceneFonts } from "@/features/slides/normalize-scene";
import { decodeSceneTextForDisplay } from "@/features/slides/utils/slide-text";
import {
  toastErrorAfterCommit,
  toastSuccessAfterCommit,
} from "@/lib/safe-toast";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface SlideEditDialogProps {
  slide: Slide | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (slideId: string, version: number) => void;
}

function isEditableTextNode(node: SceneNode): boolean {
  if (node.type !== "text" || !node.text?.trim()) return false;
  if (node.id.startsWith("header") || node.id.startsWith("footer"))
    return false;
  return true;
}

function nodeLabel(node: SceneNode): string {
  if (node.id.startsWith("q-")) return "প্রশ্ন";
  if (node.id.includes("option") || node.id.startsWith("opt-")) return "অপশন";
  if (node.id.startsWith("exp-text")) return "ব্যাখ্যা";
  return node.id;
}

export function SlideEditDialog({
  slide,
  open,
  onOpenChange,
  onSaved,
}: SlideEditDialogProps) {
  const [draft, setDraft] = useState<Scene | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slide && open) {
      setDraft(decodeSceneTextForDisplay(structuredClone(slide.sceneJson)));
    }
  }, [slide, open]);

  const editableNodes = useMemo(
    () => draft?.nodes.filter(isEditableTextNode) ?? [],
    [draft],
  );

  function updateNodeText(nodeId: string, text: string) {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        nodes: prev.nodes.map((node) =>
          node.id === nodeId ? { ...node, text } : node,
        ),
      };
    });
  }

  async function handleSave() {
    if (!slide || !draft) return;
    setSaving(true);
    try {
      const normalized = normalizeSceneFonts(draft);
      const updated = await slideService.saveAndReRender(slide.id, normalized);
      const version = new Date(updated.updatedAt).getTime();
      onSaved(slide.id, version);
      onOpenChange(false);
      toastSuccessAfterCommit(`স্লাইড #${slide.order} আপডেট হয়েছে`);
    } catch {
      toastErrorAfterCommit("স্লাইড সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 font-slide-mixed sm:max-w-lg">
        <DialogHeader className="shrink-0 space-y-1 border-b px-5 py-4 text-left">
          <DialogTitle>স্লাইড #{slide?.order ?? ""} এডিট করুন</DialogTitle>
          <DialogDescription>
            টেক্সট পরিবর্তন করুন — সংরক্ষণ করলে ছবি আবার তৈরি হবে।
          </DialogDescription>
        </DialogHeader>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4"
          aria-label="স্লাইড টেক্সট সম্পাদনা"
        >
          {editableNodes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              এডিটযোগ্য টেক্সট পাওয়া যায়নি।
            </p>
          ) : (
            <div className="space-y-5">
              {editableNodes.map((node) => (
                <div key={node.id} className="space-y-2">
                  <Label htmlFor={node.id}>{nodeLabel(node)}</Label>
                  <Textarea
                    id={node.id}
                    value={node.text ?? ""}
                    onChange={(e) => updateNodeText(node.id, e.target.value)}
                    rows={Math.min(
                      8,
                      Math.max(3, node.text?.split("\n").length ?? 3),
                    )}
                    className="max-h-48 min-h-[4.5rem] resize-y font-slide-mixed text-sm leading-relaxed"
                    lang="bn"
                    spellCheck={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t bg-background px-5 py-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            বাতিল
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !draft || editableNodes.length === 0}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                সংরক্ষণ ও রেন্ডার...
              </>
            ) : (
              "সংরক্ষণ ও পুনরায় তৈরি"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
