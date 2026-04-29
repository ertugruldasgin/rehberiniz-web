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
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CheckIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { useExamTemplates } from "@/hooks/use-exam-templates";
import { useSubjects } from "@/hooks/use-subjects";
import { useStudents } from "@/hooks/use-students";
import { useTeachers } from "@/hooks/use-teachers";
import { cn } from "@/lib/utils";
import Image from "next/image";

type ExamType = "general" | "custom" | "branch";
type TargetType = "all" | "teacher" | "individual";
type Step = "info" | "target";

interface AddExamDialogProps {
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

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps = [
    { key: "info", label: "Sınav Bilgileri" },
    { key: "target", label: "Hedef Kitle" },
  ];
  return (
    <div className="flex items-center gap-2 px-6 py-3 bg-muted/30">
      <div className="flex items-center justify-center gap-4 px-6 py-3">
        {steps.map((step, i) => {
          const isDone = currentStep === "target" && step.key === "info";
          const isActive = currentStep === step.key;
          return (
            <div key={step.key} className="flex items-center gap-2">
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-all",
                  isDone && "bg-primary text-primary-foreground",
                  isActive &&
                    "bg-primary/10 text-primary border border-primary/30",
                  !isDone && !isActive && "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : isDone
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 h-px ml-2 transition-colors",
                    isDone ? "bg-primary/30" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AddExamDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddExamDialogProps) {
  const { templates, loading: templatesLoading } = useExamTemplates();
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { students } = useStudents();
  const { teachers } = useTeachers();

  const generalTemplates = templates.filter((t) => !t.organization_id);
  const customTemplates = templates.filter((t) => !!t.organization_id);

  const [step, setStep] = useState<Step>("info");
  const [examType, setExamType] = useState<ExamType>("general");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [dateInput, setDateInput] = useState(format(new Date(), "dd.MM.yyyy"));
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [...new Set(subjects.map((s) => s.category))].sort();
  const filteredSubjects = subjects.filter(
    (s) => s.category === selectedCategory,
  );

  function handleExamTypeChange(type: ExamType) {
    setExamType(type);
    setSelectedTemplateId("");
    setSelectedSubjectId("");
    setSelectedCategory("");
    setErrors({});
  }

  function handleCategoryChange(category: string) {
    setSelectedCategory(category);
    setSelectedSubjectId("");
    setErrors((p) => ({ ...p, subject: "" }));
  }

  function handleDateInputChange(value: string) {
    setDateInput(value);
    if (value.length === 10) {
      const [day, month, year] = value.split(".");
      const parsed = new Date(`${year}-${month}-${day}`);
      if (!isNaN(parsed.getTime())) {
        setDate(parsed);
        setErrors((p) => ({ ...p, date: "" }));
      } else {
        setErrors((p) => ({ ...p, date: "Geçersiz tarih." }));
      }
    }
  }

  function validateInfo() {
    const newErrors: Record<string, string> = {};
    let valid = true;
    if (!title.trim()) {
      newErrors.title = "Sınav adı zorunludur.";
      valid = false;
    }
    if (!date) {
      newErrors.date = "Tarih zorunludur.";
      valid = false;
    }
    if (
      (examType === "general" || examType === "custom") &&
      !selectedTemplateId
    ) {
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

  function validateTarget() {
    const newErrors: Record<string, string> = {};
    let valid = true;
    if (targetType === "teacher" && !selectedTeacherId) {
      newErrors.teacher = "Öğretmen seçiniz.";
      valid = false;
    }
    if (targetType === "individual" && selectedStudentIds.length === 0) {
      newErrors.students = "En az bir öğrenci seçiniz.";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  }

  function toggleStudent(id: string) {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  async function handleSubmit() {
    if (!validateTarget()) return;

    const finalStudentIds =
      targetType === "all"
        ? students.map((s) => s.id)
        : targetType === "teacher"
          ? students
              .filter((s) => s.teacher_id === selectedTeacherId)
              .map((s) => s.id)
          : selectedStudentIds;

    if (finalStudentIds.length === 0) {
      toast.error("Atanacak öğrenci bulunamadı.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/exams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date: format(date, "yyyy-MM-dd"),
          template_id: examType !== "branch" ? selectedTemplateId : null,
          subject_id: examType === "branch" ? selectedSubjectId : null,
          student_ids: finalStudentIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");
      toast.success("Sınav oluşturuldu ve öğrencilere atandı.");
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
    setDate(new Date());
    setDateInput(format(new Date(), "dd.MM.yyyy"));
    setSelectedTemplateId("");
    setSelectedSubjectId("");
    setSelectedCategory("");
    setTargetType("all");
    setSelectedTeacherId("");
    setSelectedStudentIds([]);
    setErrors({});
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 pb-2 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-lg font-bold">Sınav Oluştur</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {step === "info"
              ? "Sınav türünü seçin ve bilgileri girin."
              : "Sınavın atanacağı öğrencileri seçin."}
          </DialogDescription>
        </DialogHeader>

        <StepIndicator currentStep={step} />

        <ScrollArea className="max-h-[65vh]">
          <div className="px-6 py-6 space-y-7 flex flex-col items-center">
            {step === "info" && (
              <>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted w-fit">
                  {(
                    [
                      { key: "general", label: "Genel" },
                      { key: "branch", label: "Branş" },
                      { key: "custom", label: "Kurum" },
                    ] as { key: ExamType; label: string }[]
                  ).map((type) => (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => handleExamTypeChange(type.key)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                        examType === type.key
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 w-full">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">Sınav Bilgileri</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
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
                        placeholder="Sınav Adı"
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
                      <Label>
                        Tarih <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="GG.AA.YYYY"
                          value={dateInput}
                          onChange={(e) =>
                            handleDateInputChange(e.target.value)
                          }
                          className={cn(
                            "h-10",
                            errors.date && "border-destructive",
                          )}
                          disabled={loading}
                          maxLength={10}
                        />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-10 w-10 bg-muted hover:bg-muted shrink-0 px-0 cursor-pointer"
                              disabled={loading}
                            >
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={(d) => {
                                if (d) {
                                  setDate(d);
                                  setDateInput(format(d, "dd.MM.yyyy"));
                                  setErrors((p) => ({ ...p, date: "" }));
                                }
                              }}
                              locale={tr}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      {errors.date && (
                        <p className="text-xs text-destructive">
                          {errors.date}
                        </p>
                      )}
                    </div>

                    {examType === "general" && (
                      <SelectField
                        label="Şablon"
                        placeholder="Şablon seçin..."
                        value={selectedTemplateId}
                        onValueChange={(v) => {
                          setSelectedTemplateId(v);
                          setErrors((p) => ({ ...p, template: "" }));
                        }}
                        disabled={templatesLoading || loading}
                        error={errors.template}
                        items={generalTemplates.map((t) => ({
                          id: t.id,
                          name: t.name,
                          subtitle: t.category,
                        }))}
                      />
                    )}

                    {examType === "custom" && (
                      <SelectField
                        label="Kurum Şablonu"
                        placeholder="Şablon seçin..."
                        value={selectedTemplateId}
                        onValueChange={(v) => {
                          setSelectedTemplateId(v);
                          setErrors((p) => ({ ...p, template: "" }));
                        }}
                        disabled={templatesLoading || loading}
                        error={errors.template}
                        items={customTemplates.map((t) => ({
                          id: t.id,
                          name: t.name,
                          subtitle: t.category,
                        }))}
                      />
                    )}

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

                    {examType === "branch" && selectedCategory && (
                      <div className="col-span-2">
                        <SelectField
                          label="Ders"
                          placeholder="Ders seçin..."
                          value={selectedSubjectId}
                          onValueChange={(v) => {
                            setSelectedSubjectId(v);
                            setErrors((p) => ({ ...p, subject: "" }));
                          }}
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

            {step === "target" && (
              <>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted w-fit">
                  {(
                    [
                      { key: "all", label: "Tüm Kurum" },
                      { key: "teacher", label: "Öğretmen" },
                      { key: "individual", label: "Tek Tek" },
                    ] as { key: TargetType; label: string }[]
                  ).map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => {
                        setTargetType(t.key);
                        setErrors({});
                      }}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                        targetType === t.key
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {targetType === "all" && (
                  <div className="w-full rounded-xl border bg-card p-4 flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        Tüm öğrencilere atanacak
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Kurumunuzdaki{" "}
                        <span className="text-foreground font-bold">
                          {students.length}
                        </span>{" "}
                        öğrenciye bu sınav atanacak.
                      </p>
                    </div>
                  </div>
                )}

                {targetType === "teacher" && (
                  <div className="space-y-4 w-full">
                    <Separator />
                    <div className="space-y-2">
                      <Label>
                        Öğretmen <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={selectedTeacherId}
                        onValueChange={(v) => {
                          setSelectedTeacherId(v);
                          setErrors({});
                        }}
                        disabled={loading}
                      >
                        <SelectTrigger
                          className={`h-10! w-full ${errors.teacher ? "border-destructive" : ""}`}
                        >
                          <SelectValue placeholder="Öğretmen seçin..." />
                        </SelectTrigger>
                        <SelectContent className="p-1">
                          {teachers.map((t) => {
                            const count = students.filter(
                              (s) => s.teacher_id === t.id,
                            ).length;
                            return (
                              <SelectItem
                                key={t.id}
                                value={t.id}
                                className="rounded-lg cursor-pointer py-1 px-3"
                              >
                                <div className="flex flex-col items-start gap-0.5">
                                  <span className="text-sm font-medium">
                                    {t.full_name}{" "}
                                    <span className="text-xs text-muted-foreground">
                                      {t.title} ({count})
                                    </span>
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {errors.teacher && (
                        <p className="text-xs text-destructive">
                          {errors.teacher}
                        </p>
                      )}
                    </div>
                    {selectedTeacherId &&
                      (() => {
                        const count = students.filter(
                          (s) => s.teacher_id === selectedTeacherId,
                        ).length;
                        return (
                          <p className="text-xs text-muted-foreground">
                            Bu öğretmene bağlı{" "}
                            <span className="text-foreground font-bold">
                              {count}
                            </span>{" "}
                            öğrenciye bu sınav atanacak.
                          </p>
                        );
                      })()}
                  </div>
                )}

                {targetType === "individual" && (
                  <div className="space-y-3 w-full">
                    <Separator />
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">
                        Öğrenciler <span className="text-destructive">*</span>
                      </Label>
                      {selectedStudentIds.length > 0 && (
                        <Badge variant="outline">
                          {selectedStudentIds.length} seçili
                        </Badge>
                      )}
                    </div>
                    {errors.students && (
                      <p className="text-xs text-destructive">
                        {errors.students}
                      </p>
                    )}
                    <div className="rounded-xl border border-muted border-dashed overflow-hidden">
                      {students.map((s, i) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleStudent(s.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer",
                            i < students.length - 1 && "border-b",
                            selectedStudentIds.includes(s.id)
                              ? "bg-primary/5"
                              : "hover:bg-muted/40",
                          )}
                        >
                          <div
                            className={cn(
                              "h-4 w-4 rounded border shrink-0 flex items-center justify-center transition-all",
                              selectedStudentIds.includes(s.id)
                                ? "bg-primary border-primary"
                                : "border-border",
                            )}
                          >
                            {selectedStudentIds.includes(s.id) && (
                              <CheckIcon className="h-2.5 w-2.5 text-primary-foreground" />
                            )}
                          </div>
                          {s.avatar_url ? (
                            <Image
                              src={s.avatar_url}
                              alt={`${s.first_name} ${s.last_name}`}
                              className="h-7 w-7 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                              {s.first_name[0]}
                              {s.last_name[0]}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {s.first_name} {s.last_name}
                            </p>
                            {s.grade && (
                              <p className="text-xs text-muted-foreground">
                                {s.grade}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                onClick={() => {
                  if (validateInfo()) setStep("target");
                }}
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
                {loading ? "Oluşturuluyor..." : "Sınavı Oluştur"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
