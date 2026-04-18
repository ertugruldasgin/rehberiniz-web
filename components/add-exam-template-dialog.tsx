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
  SlidersHorizontalIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Section {
  key: string;
  label: string;
  questions: number;
  coefficient: number;
}

interface AddExamTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CATEGORIES = ["TYT", "AYT", "YDT", "LGS"];

const EMPTY_SECTION: Section = {
  key: "",
  label: "",
  questions: 0,
  coefficient: 1.0,
};

export function AddExamTemplateDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddExamTemplateDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [baseScore, setBaseScore] = useState<number>(100);
  const [maxScore, setMaxScore] = useState<number>(500);
  const [wrongPenalty, setWrongPenalty] = useState<number>(0.25);
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
        if (field === "coefficient")
          return { ...s, coefficient: Math.max(0, parseFloat(value) || 0) };
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
      if (!s.coefficient || s.coefficient <= 0) {
        newErrors[`section_${i}_coefficient`] = "0'dan büyük olmalı.";
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
        body: JSON.stringify({
          name,
          category,
          sections,
          base_score: baseScore,
          max_score: maxScore,
          wrong_penalty: wrongPenalty,
        }),
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
    setBaseScore(100);
    setMaxScore(500);
    setWrongPenalty(0.25);
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
                    placeholder="Ad"
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
                      className={`h-10! w-full ${errors.category ? "border-destructive" : ""}`}
                    >
                      <SelectValue placeholder="Kategori seçin..." />
                    </SelectTrigger>
                    <SelectContent className="p-1">
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

            {/* Puanlama Ayarları */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontalIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-semibold">Puanlama Ayarları</p>
              </div>
              <Separator />
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_score">Taban Puan</Label>
                  <Input
                    id="base_score"
                    type="number"
                    min={0}
                    value={baseScore}
                    onChange={(e) =>
                      setBaseScore(parseFloat(e.target.value) || 0)
                    }
                    className="h-10 text-center tabular-nums"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    0 net = {baseScore} puan
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_score">Maksimum Puan</Label>
                  <Input
                    id="max_score"
                    type="number"
                    min={1}
                    value={maxScore}
                    onChange={(e) =>
                      setMaxScore(parseFloat(e.target.value) || 500)
                    }
                    className="h-10 text-center tabular-nums"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tam doğru = {maxScore} puan
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wrong_penalty">Yanlış Cezası</Label>
                  <Select
                    value={String(wrongPenalty)}
                    onValueChange={(v) => setWrongPenalty(parseFloat(v))}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-10! w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="p-1">
                      <SelectItem
                        value="0.25"
                        className="rounded-lg cursor-pointer py-1 px-3"
                      >
                        4'te 1
                      </SelectItem>
                      <SelectItem
                        value="0.333"
                        className="rounded-lg cursor-pointer py-1 px-3"
                      >
                        3'te 1
                      </SelectItem>
                      <SelectItem
                        value="0"
                        className="rounded-lg cursor-pointer py-1 px-3"
                      >
                        Ceza yok
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                <div className="grid grid-cols-[1fr_1fr_52px_52px_20px] gap-2 px-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    Bölüm Adı
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Anahtar
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Soru
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Katsayı
                  </p>
                  <div />
                </div>

                {sections.map((s, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_1fr_52px_52px_20px] gap-2 items-start"
                  >
                    <div className="space-y-1">
                      <Input
                        value={s.label}
                        onChange={(e) =>
                          handleSectionChange(i, "label", e.target.value)
                        }
                        placeholder="Ad"
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
                      placeholder="ad"
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
                        className={`h-9 text-center tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors[`section_${i}_questions`] ? "border-destructive" : ""}`}
                        disabled={loading}
                      />
                      {errors[`section_${i}_questions`] && (
                        <p className="text-xs text-destructive">
                          {errors[`section_${i}_questions`]}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={s.coefficient || ""}
                        onChange={(e) =>
                          handleSectionChange(i, "coefficient", e.target.value)
                        }
                        placeholder="1.0"
                        className={`h-9 text-center tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors[`section_${i}_coefficient`] ? "border-destructive" : ""}`}
                        disabled={loading}
                      />
                      {errors[`section_${i}_coefficient`] && (
                        <p className="text-xs text-destructive">
                          {errors[`section_${i}_coefficient`]}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSection(i)}
                      disabled={loading || sections.length === 1}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
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
