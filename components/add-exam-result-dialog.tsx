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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardListIcon, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useExamTemplates, ExamSection } from "@/hooks/use-exam-templates";
import { cn } from "@/lib/utils";
import { useSubjects } from "@/hooks/use-subjects";

type ExamType = "general" | "branch";

interface SectionResult {
  key: string;
  label: string;
  questions: number;
  correct: number;
  incorrect: number;
  empty: number;
  net: number;
}

interface AddExamResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface SelectFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  items: { id: string; name: string; subtitle: string }[];
}

function SelectField({
  label,
  placeholder,
  value,
  onValueChange,
  disabled,
  error,
  items,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label} <span className="text-destructive">*</span>
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={`h-10! w-full ${error ? "border-destructive" : ""}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="p-1">
          {items.map((item) => (
            <SelectItem
              key={item.id}
              value={item.id}
              className="rounded-lg cursor-pointer py-1 px-3"
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  {item.subtitle}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function calcNet(correct: number, incorrect: number) {
  return Math.round((correct - incorrect * 0.25) * 100) / 100;
}

function initSections(sections: ExamSection[]): SectionResult[] {
  return sections.map((s) => ({
    key: s.key,
    label: s.label,
    questions: s.questions,
    correct: 0,
    incorrect: 0,
    empty: s.questions,
    net: 0,
  }));
}

function initBranchSection(subject: {
  slug: string;
  name: string;
  default_questions: number;
}): SectionResult[] {
  return [
    {
      key: subject.slug,
      label: subject.name,
      questions: subject.default_questions,
      correct: 0,
      incorrect: 0,
      empty: subject.default_questions,
      net: 0,
    },
  ];
}

export function AddExamResultDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddExamResultDialogProps) {
  const { templates, loading: templatesLoading } = useExamTemplates();
  const { subjects, loading: subjectsLoading } = useSubjects();

  const [examType, setExamType] = useState<ExamType>("general");
  const [step, setStep] = useState<"info" | "sections">("info");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sections, setSections] = useState<SectionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    date: "",
    template: "",
    subject: "",
  });

  const categories = [...new Set(subjects.map((s) => s.category))].sort();
  const filteredSubjects = subjects.filter(
    (s) => s.category === selectedCategory,
  );

  function handleExamTypeChange(type: ExamType) {
    setExamType(type);
    setSelectedTemplateId("");
    setSelectedSubjectId("");
    setSelectedCategory("");
    setSections([]);
    setErrors({ title: "", date: "", template: "", subject: "" });
  }

  function handleTemplateChange(templateId: string) {
    setSelectedTemplateId(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) setSections(initSections(template.sections));
    setErrors((p) => ({ ...p, template: "" }));
  }

  function handleSubjectChange(subjectId: string) {
    setSelectedSubjectId(subjectId);
    const subject = subjects.find((s) => s.id === subjectId);
    if (subject) setSections(initBranchSection(subject));
    setErrors((p) => ({ ...p, subject: "" }));
  }

  function handleCategoryChange(category: string) {
    setSelectedCategory(category);
    setSelectedSubjectId("");
    setSections([]);
    setErrors((p) => ({ ...p, subject: "" }));
  }

  function handleSectionChange(
    key: string,
    field: "correct" | "incorrect",
    value: string,
  ) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.key !== key) return s;
        const val = Math.max(0, Math.min(s.questions, parseInt(value) || 0));
        const correct = field === "correct" ? val : s.correct;
        const incorrect = field === "incorrect" ? val : s.incorrect;
        const empty = Math.max(0, s.questions - correct - incorrect);
        const net = calcNet(correct, incorrect);
        return { ...s, correct, incorrect, empty, net };
      }),
    );
  }

  function validateInfo() {
    const newErrors = { title: "", date: "", template: "", subject: "" };
    let valid = true;
    if (!title.trim()) {
      newErrors.title = "Sınav adı zorunludur.";
      valid = false;
    }
    if (!date) {
      newErrors.date = "Tarih zorunludur.";
      valid = false;
    }
    if (examType === "general" && !selectedTemplateId) {
      newErrors.template = "Şablon seçiniz.";
      valid = false;
    }
    if (examType === "branch" && !selectedSubjectId) {
      newErrors.subject = !selectedCategory
        ? "Önce alan seçiniz."
        : "Ders seçiniz.";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  }

  function handleNext() {
    if (validateInfo()) setStep("sections");
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/exam-results/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date,
          template_id: examType === "general" ? selectedTemplateId : null,
          subject_id: examType === "branch" ? selectedSubjectId : null,
          is_standalone: true,
          sections,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");

      toast.success("Sınav sonucu eklendi.");
      handleClose();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setStep("info");
    setExamType("general");
    setTitle("");
    setDate(new Date().toISOString().split("T")[0]);
    setSelectedTemplateId("");
    setSelectedSubjectId("");
    setSelectedCategory("");
    setSections([]);
    setErrors({ title: "", date: "", template: "", subject: "" });
    onOpenChange(false);
  }

  const totalNet = sections.reduce((s, r) => s + r.net, 0);
  const totalCorrect = sections.reduce((s, r) => s + r.correct, 0);
  const totalIncorrect = sections.reduce((s, r) => s + r.incorrect, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 pb-2 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 border-b shrink-0">
          <DialogTitle className="text-lg font-bold">
            Sınav Sonucu Ekle
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {step === "info"
              ? "Deneme türünü seçin ve bilgileri girin."
              : "Her ders için doğru ve yanlış sayısını girin."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="px-6 py-6 space-y-7 flex flex-col items-center">
            {step === "info" && (
              <>
                {/* Deneme Türü Seçici */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted w-fit">
                  {(["general", "branch"] as ExamType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleExamTypeChange(type)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                        examType === type
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {type === "general" ? "Genel Deneme" : "Branş Denemesi"}
                    </button>
                  ))}
                </div>

                {/* Sınav Bilgileri */}
                <div className="space-y-4 w-full">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm font-semibold">Sınav Bilgileri</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    {/* Sınav Adı — tam genişlik */}
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="title">
                        Sınav Adı <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setErrors((p) => ({ ...p, title: "" }));
                        }}
                        placeholder={
                          examType === "general"
                            ? "Genel Deneme"
                            : "Branş Deneme"
                        }
                        className={`h-10 ${errors.title ? "border-destructive focus-visible:ring-destructive/50" : ""}`}
                        disabled={loading}
                      />
                      {errors.title && (
                        <p className="text-xs text-destructive">
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Tarih */}
                    <div className="space-y-2">
                      <Label htmlFor="date">
                        Tarih <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => {
                          setDate(e.target.value);
                          setErrors((p) => ({ ...p, date: "" }));
                        }}
                        className={`h-10 ${errors.date ? "border-destructive focus-visible:ring-destructive/50" : ""}`}
                        disabled={loading}
                      />
                      {errors.date && (
                        <p className="text-xs text-destructive">
                          {errors.date}
                        </p>
                      )}
                    </div>

                    {/* Genel — Şablon */}
                    {examType === "general" && (
                      <SelectField
                        label="Şablon"
                        placeholder="Şablon seçin..."
                        value={selectedTemplateId}
                        onValueChange={handleTemplateChange}
                        disabled={templatesLoading || loading}
                        error={errors.template}
                        items={templates.map((t) => ({
                          id: t.id,
                          name: t.name,
                          subtitle: t.category,
                        }))}
                      />
                    )}

                    {/* Branş — Alan */}
                    {examType === "branch" && (
                      <SelectField
                        label="Alan"
                        placeholder="Alan seçin..."
                        value={selectedCategory}
                        onValueChange={handleCategoryChange}
                        disabled={subjectsLoading || loading}
                        error={
                          !selectedCategory && errors.subject
                            ? errors.subject
                            : ""
                        }
                        items={categories.map((cat) => ({
                          id: cat,
                          name: cat,
                          subtitle: `${subjects.filter((s) => s.category === cat).length} ders`,
                        }))}
                      />
                    )}

                    {/* Branş — Ders */}
                    {examType === "branch" && selectedCategory && (
                      <div className="col-span-2">
                        <SelectField
                          label="Ders"
                          placeholder="Ders seçin..."
                          value={selectedSubjectId}
                          onValueChange={handleSubjectChange}
                          disabled={subjectsLoading || loading}
                          error={selectedCategory ? errors.subject : ""}
                          items={filteredSubjects.map((s) => ({
                            id: s.id,
                            name: s.name,
                            subtitle: `${s.default_questions} soru`,
                          }))}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {step === "sections" && (
              <>
                {/* Özet */}
                <div className="grid grid-cols-3 gap-3 w-full">
                  <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Toplam Doğru
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {totalCorrect}
                    </p>
                  </div>
                  <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Toplam Yanlış
                    </p>
                    <p className="text-2xl font-bold text-red-500">
                      {totalIncorrect}
                    </p>
                  </div>
                  <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Toplam Net
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {totalNet.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Dersler */}
                <div className="space-y-2 w-full">
                  {sections.map((s) => (
                    <div key={s.key} className="rounded-xl border bg-card p-3">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {s.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.questions} soru · Boş: {s.empty}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "text-lg font-bold tabular-nums shrink-0",
                            s.net > 0
                              ? "text-primary"
                              : s.net < 0
                                ? "text-destructive"
                                : "text-muted-foreground",
                          )}
                        >
                          {s.net.toFixed(2)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-green-600 dark:text-green-400 font-medium block mb-1">
                            Doğru
                          </label>
                          <Input
                            type="number"
                            min={0}
                            max={s.questions}
                            value={s.correct || ""}
                            onChange={(e) =>
                              handleSectionChange(
                                s.key,
                                "correct",
                                e.target.value,
                              )
                            }
                            className="h-9 text-center tabular-nums"
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-red-500 font-medium block mb-1">
                            Yanlış
                          </label>
                          <Input
                            type="number"
                            min={0}
                            max={s.questions}
                            value={s.incorrect || ""}
                            onChange={(e) =>
                              handleSectionChange(
                                s.key,
                                "incorrect",
                                e.target.value,
                              )
                            }
                            className="h-9 text-center tabular-nums"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t bg-card shrink-0">
          {step === "info" ? (
            <>
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
                onClick={handleNext}
                disabled={loading}
                className="cursor-pointer"
              >
                Devam Et
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("info")}
                disabled={loading}
                className="cursor-pointer"
              >
                Geri
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="cursor-pointer"
              >
                {loading ? "Kaydediliyor..." : "Sonucu Kaydet"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
