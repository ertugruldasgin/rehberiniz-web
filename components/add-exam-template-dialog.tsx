"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardListIcon,
  PlusIcon,
  Trash2Icon,
  InfoIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Section {
  key: string;
  label: string;
  questions: number;
}

interface AddExamTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CATEGORIES = ["TYT", "AYT", "YDT", "LGS"];

const EMPTY_SECTION: Section = { key: "", label: "", questions: 0 };

export function AddExamTemplateDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddExamTemplateDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [sections, setSections] = useState<Section[]>([{ ...EMPTY_SECTION }]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSectionChange(
    index: number,
    field: keyof Section,
    value: string,
  ) {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        if (field === "questions")
          return { ...s, questions: Math.max(0, parseInt(value) || 0) };
        if (field === "label") {
          const key = value
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
          return { ...s, label: value, key };
        }
        return { ...s, [field]: value };
      }),
    );
    setErrors((p) => ({ ...p, [`section_${index}_${field}`]: "" }));
  }

  function addSection() {
    setSections((prev) => [...prev, { ...EMPTY_SECTION }]);
  }

  function removeSection(index: number) {
    if (sections.length === 1) return;
    setSections((prev) => prev.filter((_, i) => i !== index));
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    let valid = true;

    if (!name.trim()) {
      newErrors.name = "Şablon adı zorunludur.";
      valid = false;
    }
    if (!category) {
      newErrors.category = "Kategori zorunludur.";
      valid = false;
    }

    sections.forEach((s, i) => {
      if (!s.label.trim()) {
        newErrors[`section_${i}_label`] = "Bölüm adı zorunludur.";
        valid = false;
      }
      if (!s.questions || s.questions < 1) {
        newErrors[`section_${i}_questions`] = "En az 1 soru.";
        valid = false;
      }
    });

    setErrors(newErrors);
    return valid;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/exam-templates/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, sections }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");
      toast.success("Şablon oluşturuldu.");
      handleClose();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setName("");
    setCategory("");
    setSections([{ ...EMPTY_SECTION }]);
    setErrors({});
    onOpenChange(false);
  }

  const totalQuestions = sections.reduce((s, r) => s + (r.questions || 0), 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 pb-2 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-lg font-bold">
            Sınav Şablonu Oluştur
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Şablon adı, kategorisi ve bölümlerini tanımlayın.{" "}
            <span className="text-destructive">*</span> ile işaretli alanlar
            zorunludur.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="px-6 py-6 space-y-7">
            {/* Temel Bilgiler */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <InfoIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-semibold">Temel Bilgiler</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="name">
                    Şablon Adı <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((p) => ({ ...p, name: "" }));
                    }}
                    placeholder="TYT Deneme"
                    className={`h-10 ${errors.name ? "border-destructive" : ""}`}
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>
                    Kategori <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={category}
                    onValueChange={(v) => {
                      setCategory(v);
                      setErrors((p) => ({ ...p, category: "" }));
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger
                      className={`h-10! ${errors.category ? "border-destructive" : ""}`}
                    >
                      <SelectValue placeholder="Kategori seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem
                          key={c}
                          value={c}
                          className="rounded-lg cursor-pointer py-1 px-3"
                        >
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-destructive">
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bölümler */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardListIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-sm font-semibold">Bölümler</p>
                </div>
                <div className="flex items-center gap-3">
                  {totalQuestions > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Toplam:{" "}
                      <span className="font-semibold text-foreground">
                        {totalQuestions}
                      </span>{" "}
                      soru
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSection}
                    disabled={loading}
                    className="gap-1.5 cursor-pointer h-8"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    Bölüm Ekle
                  </Button>
                </div>
              </div>
              <Separator />

              <div className="space-y-3">
                {/* Tablo başlığı */}
                <div className="grid grid-cols-[1fr_1fr_80px_32px] gap-3 px-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    Bölüm Adı
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Anahtar (otomatik)
                  </p>
                  <p className="text-xs text-muted-foreground font-medium text-center">
                    Soru
                  </p>
                  <div />
                </div>

                {sections.map((s, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_1fr_80px_32px] gap-3 items-start"
                  >
                    <div className="space-y-1">
                      <Input
                        value={s.label}
                        onChange={(e) =>
                          handleSectionChange(i, "label", e.target.value)
                        }
                        placeholder="TYT Türkçe"
                        className={`h-9 ${errors[`section_${i}_label`] ? "border-destructive" : ""}`}
                        disabled={loading}
                      />
                      {errors[`section_${i}_label`] && (
                        <p className="text-xs text-destructive">
                          {errors[`section_${i}_label`]}
                        </p>
                      )}
                    </div>
                    <Input
                      value={s.key}
                      readOnly
                      placeholder="tyt-turkce"
                      className="h-9 bg-muted/50 text-muted-foreground text-xs"
                    />
                    <div className="space-y-1">
                      <Input
                        type="number"
                        min={1}
                        value={s.questions || ""}
                        onChange={(e) =>
                          handleSectionChange(i, "questions", e.target.value)
                        }
                        placeholder="40"
                        className={`h-9 text-center ${errors[`section_${i}_questions`] ? "border-destructive" : ""}`}
                        disabled={loading}
                      />
                      {errors[`section_${i}_questions`] && (
                        <p className="text-xs text-destructive">
                          {errors[`section_${i}_questions`]}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSection(i)}
                      disabled={loading || sections.length === 1}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t bg-card shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="cursor-pointer"
          >
            İptal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="cursor-pointer"
          >
            {loading ? "Oluşturuluyor..." : "Şablon Oluştur"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
