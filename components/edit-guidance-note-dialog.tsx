"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { BookOpenIcon, CalendarIcon, EyeIcon, LockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { format, parse } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { GuidanceNote } from "@/hooks/use-guidance-notes";

const SUGGESTED_CATEGORIES = [
  "Akademik",
  "Kişisel",
  "Kariyer",
  "Aile",
  "Rehberlik Notu",
  "Diğer",
];

interface EditGuidanceNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  note: GuidanceNote;
}

export function EditGuidanceNoteDialog({
  open,
  onOpenChange,
  onSuccess,
  note,
}: EditGuidanceNoteDialogProps) {
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [content, setContent] = useState("");
  const [meetingDate, setMeetingDate] = useState<Date>(new Date());
  const [meetingDateInput, setMeetingDateInput] = useState(
    format(new Date(), "dd.MM.yyyy"),
  );
  const [isPrivate, setIsPrivate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && note) {
      const isSuggested = SUGGESTED_CATEGORIES.includes(note.category);
      setCategory(isSuggested ? note.category : "Diğer");
      setCustomCategory(isSuggested ? "" : note.category);
      setContent(note.content);

      // note.meeting_date "yyyy-MM-dd" formatında geliyor
      const parsed = parse(note.meeting_date, "yyyy-MM-dd", new Date());
      setMeetingDate(parsed);
      setMeetingDateInput(format(parsed, "dd.MM.yyyy"));

      setIsPrivate(note.is_private);
      setErrors({});
    }
  }, [open, note]);

  const finalCategory = category === "Diğer" ? customCategory : category;

  function handleDateInputChange(value: string) {
    setMeetingDateInput(value);
    if (value.length === 10) {
      const [day, month, year] = value.split(".");
      const parsed = new Date(`${year}-${month}-${day}`);
      if (!isNaN(parsed.getTime())) {
        setMeetingDate(parsed);
        setErrors((p) => ({ ...p, meetingDate: "" }));
      } else {
        setErrors((p) => ({ ...p, meetingDate: "Geçersiz tarih." }));
      }
    }
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    let valid = true;
    if (!finalCategory.trim()) {
      newErrors.category = "Kategori zorunludur.";
      valid = false;
    }
    if (!content.trim()) {
      newErrors.content = "Not içeriği zorunludur.";
      valid = false;
    }
    if (!meetingDate) {
      newErrors.meetingDate = "Görüşme tarihi zorunludur.";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/guidance-notes/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note_id: note.id,
          category: finalCategory.trim(),
          content: content.trim(),
          meeting_date: format(meetingDate, "yyyy-MM-dd"),
          is_private: isPrivate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");
      toast.success("Not güncellendi.");
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 pb-2 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-lg font-bold">Notu Düzenle</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Rehberlik notunu güncelleyin.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-6 space-y-5">
          {/* Kategori */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpenIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <Label className="text-sm font-semibold">
                Kategori <span className="text-destructive">*</span>
              </Label>
            </div>
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v);
                setErrors((p) => ({ ...p, category: "" }));
              }}
              disabled={loading}
            >
              <SelectTrigger
                className={`h-10 w-full hover:cursor-pointer ${errors.category ? "border-destructive" : ""}`}
              >
                <SelectValue placeholder="Kategori seçin..." />
              </SelectTrigger>
              <SelectContent className="p-1">
                {SUGGESTED_CATEGORIES.map((cat) => (
                  <SelectItem
                    key={cat}
                    value={cat}
                    className="rounded-lg cursor-pointer py-1 px-3"
                  >
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category}</p>
            )}
            <Separator />
            {category === "Diğer" && (
              <Input
                value={customCategory}
                onChange={(e) => {
                  setCustomCategory(e.target.value);
                  setErrors((p) => ({ ...p, category: "" }));
                }}
                placeholder="Kategori adı girin..."
                className="h-9"
                disabled={loading}
              />
            )}
          </div>

          {/* Görüşme Tarihi */}
          <div className="space-y-2">
            <Label>
              Görüşme Tarihi <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="GG.AA.YYYY"
                value={meetingDateInput}
                onChange={(e) => handleDateInputChange(e.target.value)}
                className={cn(
                  "h-10",
                  errors.meetingDate && "border-destructive",
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
                    selected={meetingDate}
                    onSelect={(d) => {
                      if (d) {
                        setMeetingDate(d);
                        setMeetingDateInput(format(d, "dd.MM.yyyy"));
                        setErrors((p) => ({ ...p, meetingDate: "" }));
                      }
                    }}
                    locale={tr}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {errors.meetingDate && (
              <p className="text-xs text-destructive">{errors.meetingDate}</p>
            )}
          </div>

          {/* Not İçeriği */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Not <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setErrors((p) => ({ ...p, content: "" }));
              }}
              placeholder="Görüşme notlarını buraya yazın..."
              className={`min-h-[120px] resize-none ${errors.content ? "border-destructive" : ""}`}
              disabled={loading}
            />
            {errors.content && (
              <p className="text-xs text-destructive">{errors.content}</p>
            )}
          </div>

          {/* Gizlilik */}
          <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              {isPrivate ? (
                <LockIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <EyeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <p className="text-xs text-foreground">
                {isPrivate
                  ? "Sadece siz görebilirsiniz."
                  : "Öğrenci de görebilir."}
              </p>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              disabled={loading}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/30 hover:cursor-pointer"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-card shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
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
            {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
