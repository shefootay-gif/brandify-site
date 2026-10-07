"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Localized, PublicMedia } from "@/server/db/schema/types";
import { deleteMediaAction, listMediaAction, updateMediaAction } from "@/app/admin/(dashboard)/media/actions";
import { Button } from "@/components/ui/button";
import { CheckIcon, ImageIcon, PlayIcon, SearchIcon, TrashIcon, UploadIcon, VideoIcon } from "@/components/ui/icons";
import { cn, formatBytes } from "@/lib/utils";
import { Dialog, useConfirm } from "./dialog";
import { LocalizedField, TextField, inputClass } from "./fields";
import { useToast } from "./toast";

export type LibraryItem = PublicMedia & { filename: string; size: number; folder: string; createdAt?: string };

const uploadErrors: Record<string, string> = {
  type: "نوع الملف غير مدعوم. المسموح: JPG, PNG, WebP, AVIF, GIF, MP4, WebM, MOV.",
  size: "الملف أكبر من المسموح (الصور 15MB، الفيديو 120MB).",
  corrupt: "تعذرت قراءة الملف. ربما يكون تالفًا.",
  rate: "رفعت ملفات كثيرة خلال وقت قصير. انتظر قليلًا.",
  unauthorized: "انتهت الجلسة. سجّل الدخول مرة أخرى.",
  server: "حدث خطأ أثناء الرفع.",
  network: "انقطع الاتصال أثناء الرفع.",
};

/** Upload one file with progress (XHR gives upload progress; fetch doesn't). */
export function uploadFile(file: File, folder: string, onProgress?: (pct: number) => void): Promise<LibraryItem> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append("file", file);
    body.append("folder", folder);
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (res.ok) resolve(res.media);
        else reject(new Error(res.error ?? "server"));
      } catch {
        reject(new Error(xhr.status === 413 ? "size" : "server"));
      }
    };
    xhr.onerror = () => reject(new Error("network"));
    xhr.send(body);
  });
}

export function MediaThumb({ item, className }: { item: Pick<PublicMedia, "kind" | "url" | "variants" | "blurDataUrl">; className?: string }) {
  if (item.kind === "video") {
    return (
      <div className={cn("relative h-full w-full bg-navy-950", className)}>
        <video src={`${item.url}#t=0.1`} preload="metadata" muted className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-white/90 text-navy-900">
            <PlayIcon size={14} />
          </span>
        </span>
      </div>
    );
  }
  const small = [...item.variants].sort((a, b) => a.width - b.width)[0]?.url ?? item.url;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={small} alt="" loading="lazy" className={cn("h-full w-full object-cover", className)} style={item.blurDataUrl ? { backgroundImage: `url(${item.blurDataUrl})`, backgroundSize: "cover" } : undefined} />
  );
}

type Uploading = { name: string; pct: number; error?: string };

/**
 * Media library grid. In "select" mode it's used inside pickers; in "manage"
 * mode (the Media page) items can be edited and deleted.
 */
export function MediaLibrary({
  mode,
  kind = "all",
  onSelect,
  multiple,
  defaultFolder = "general",
}: {
  mode: "select" | "manage";
  kind?: "image" | "video" | "all";
  onSelect?: (items: LibraryItem[]) => void;
  multiple?: boolean;
  defaultFolder?: string;
}) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<{ kind: "image" | "video" | "all"; folder: string; q: string }>({ kind, folder: "", q: "" });
  const [selected, setSelected] = useState<LibraryItem[]>([]);
  const [uploads, setUploads] = useState<Uploading[]>([]);
  const [editing, setEditing] = useState<LibraryItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const confirm = useConfirm();

  const load = useCallback(
    async (offset = 0) => {
      setLoading(true);
      setLoadError(false);
      try {
        const res = await listMediaAction({ kind: filter.kind, folder: filter.folder || undefined, q: filter.q || undefined, offset });
        if (!res.ok || !res.data) throw new Error();
        setItems((prev) => (offset ? [...prev, ...res.data!.items] : res.data!.items));
        setFolders(res.data.folders);
        setTotal(res.data.total);
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    const t = setTimeout(() => void load(0), filter.q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, filter.q]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploads(list.map((f) => ({ name: f.name, pct: 0 })));
    const done: LibraryItem[] = [];
    for (const [i, file] of list.entries()) {
      try {
        const m = await uploadFile(file, filter.folder || defaultFolder, (pct) =>
          setUploads((u) => u.map((x, j) => (j === i ? { ...x, pct } : x))),
        );
        done.push(m);
        setUploads((u) => u.map((x, j) => (j === i ? { ...x, pct: 100 } : x)));
      } catch (e) {
        const code = (e as Error).message;
        setUploads((u) => u.map((x, j) => (j === i ? { ...x, error: uploadErrors[code] ?? uploadErrors.server } : x)));
      }
    }
    if (done.length) {
      toast(done.length === 1 ? "تم رفع الملف" : `تم رفع ${done.length} ملفات`);
      setItems((prev) => [...done, ...prev]);
      setTotal((t) => t + done.length);
      if (mode === "select") setSelected((s) => (multiple ? [...s, ...done] : done.slice(-1)));
    }
    setTimeout(() => setUploads((u) => u.filter((x) => x.error)), 1500);
    if (fileRef.current) fileRef.current.value = "";
  };

  const toggle = (item: LibraryItem) => {
    if (mode === "manage") return setEditing(item);
    setSelected((s) => (s.some((x) => x.id === item.id) ? s.filter((x) => x.id !== item.id) : multiple ? [...s, item] : [item]));
  };

  const remove = async (item: LibraryItem) => {
    const ok = await confirm({
      title: "حذف الملف نهائيًا؟",
      body: "سيُحذف الملف من كل الأماكن التي يُستخدم فيها (المشاريع، الخدمات، الآراء…). لا يمكن التراجع.",
      confirmLabel: "حذف",
      danger: true,
    });
    if (!ok) return;
    const res = await deleteMediaAction(item.id);
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      setTotal((t) => t - 1);
      setEditing(null);
      toast("تم حذف الملف");
    } else toast("تعذر حذف الملف", "error");
  };

  const accept =
    filter.kind === "video" || kind === "video"
      ? "video/mp4,video/webm,video/quicktime"
      : kind === "image"
        ? "image/jpeg,image/png,image/webp,image/avif,image/gif"
        : "image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,video/quicktime";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <SearchIcon size={17} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={filter.q}
            onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))}
            placeholder="ابحث باسم الملف…"
            aria-label="بحث في الوسائط"
            className={cn(inputClass, "h-10 ps-9")}
          />
        </div>
        {kind === "all" && (
          <div role="group" aria-label="نوع الملف" className="flex rounded-[var(--radius-md)] border border-line bg-white p-0.5">
            {(["all", "image", "video"] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={filter.kind === k}
                onClick={() => setFilter((f) => ({ ...f, kind: k }))}
                className={cn("rounded-[7px] px-3 py-1.5 text-sm font-medium", filter.kind === k ? "bg-navy-900 text-white" : "text-ink-600 hover:text-navy-900")}
              >
                {k === "all" ? "الكل" : k === "image" ? "صور" : "فيديو"}
              </button>
            ))}
          </div>
        )}
        {folders.length > 1 && (
          <select
            aria-label="المجلد"
            value={filter.folder}
            onChange={(e) => setFilter((f) => ({ ...f, folder: e.target.value }))}
            className={cn(inputClass, "h-10 w-auto")}
          >
            <option value="">كل المجلدات</option>
            {folders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        )}
        <input ref={fileRef} type="file" multiple={mode === "manage" || multiple} accept={accept} className="sr-only" onChange={(e) => void onFiles(e.target.files)} />
        <Button variant="secondary" size="sm" className="h-10" onClick={() => fileRef.current?.click()}>
          <UploadIcon size={16} /> رفع ملفات
        </Button>
      </div>

      {uploads.length > 0 && (
        <ul className="space-y-2">
          {uploads.map((u, i) => (
            <li key={i} className="rounded-[var(--radius-md)] border border-line bg-white p-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="t-latin truncate">{u.name}</span>
                <span className={u.error ? "text-danger" : "text-ink-600"}>{u.error ? "فشل" : `${u.pct}%`}</span>
              </div>
              {u.error ? (
                <p className="mt-1 text-xs text-danger">{u.error}</p>
              ) : (
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                  <div className="h-full bg-orange-500 transition-[width]" style={{ width: `${u.pct}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void onFiles(e.dataTransfer.files);
        }}
        className="min-h-40"
      >
        {loadError ? (
          <div className="rounded-[var(--radius-md)] bg-danger-bg p-4 text-sm text-danger">
            تعذر تحميل الوسائط.{" "}
            <button type="button" onClick={() => void load(0)} className="font-semibold underline">
              إعادة المحاولة
            </button>
          </div>
        ) : !loading && items.length === 0 ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-line bg-white px-6 py-14 text-center text-ink-600 hover:border-orange-500"
          >
            <UploadIcon size={28} />
            <span className="font-semibold text-navy-900">لا توجد ملفات بعد</span>
            <span className="text-sm">اسحب الملفات هنا أو اضغط للرفع. الصور تُضغط تلقائيًا.</span>
          </button>
        ) : (
          <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
            {items.map((item) => {
              const isSel = selected.some((s) => s.id === item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggle(item)}
                    aria-pressed={mode === "select" ? isSel : undefined}
                    title={item.filename}
                    className={cn(
                      "group relative block aspect-square w-full overflow-hidden rounded-[var(--radius-md)] bg-paper-2 ring-offset-2 transition",
                      isSel ? "ring-3 ring-orange-500" : "hover:ring-2 hover:ring-navy-600/30",
                    )}
                  >
                    <MediaThumb item={item} />
                    <span className="absolute start-1.5 top-1.5 inline-flex size-6 items-center justify-center rounded-full bg-white/90 text-navy-900">
                      {item.kind === "video" ? <VideoIcon size={13} /> : <ImageIcon size={13} />}
                    </span>
                    {isSel && (
                      <span className="absolute end-1.5 top-1.5 inline-flex size-6 items-center justify-center rounded-full bg-orange-500 text-navy-950">
                        <CheckIcon size={14} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
            {loading &&
              Array.from({ length: 6 }, (_, i) => (
                <li key={`sk-${i}`} className="aspect-square animate-pulse rounded-[var(--radius-md)] bg-paper-2" aria-hidden="true" />
              ))}
          </ul>
        )}
        {!loading && items.length < total && (
          <div className="mt-4 text-center">
            <Button variant="subtle" size="sm" onClick={() => void load(items.length)}>
              تحميل المزيد ({total - items.length})
            </Button>
          </div>
        )}
      </div>

      {mode === "select" && (
        <div className="sticky bottom-0 -mx-5 flex items-center justify-between gap-3 border-t border-line bg-white px-5 pt-4 md:-mx-6 md:px-6">
          <span className="text-sm text-ink-600">{selected.length ? `تم اختيار ${selected.length}` : "اختر ملفًا"}</span>
          <Button variant="primary" disabled={!selected.length} onClick={() => onSelect?.(selected)}>
            استخدام المحدد
          </Button>
        </div>
      )}

      {editing && <MediaEditDialog item={editing} onClose={() => setEditing(null)} onDelete={() => void remove(editing)} onSaved={(m) => setItems((prev) => prev.map((x) => (x.id === m.id ? m : x)))} />}
    </div>
  );
}

function MediaEditDialog({ item, onClose, onDelete, onSaved }: { item: LibraryItem; onClose: () => void; onDelete: () => void; onSaved: (m: LibraryItem) => void }) {
  const [alt, setAlt] = useState<Localized>(item.alt);
  const [folder, setFolder] = useState(item.folder);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const save = async () => {
    setSaving(true);
    const res = await updateMediaAction({ id: item.id, alt, folder: folder || "general" });
    setSaving(false);
    if (res.ok) {
      toast("تم الحفظ");
      onSaved({ ...item, alt, folder });
      onClose();
    } else toast(res.error === "invalid" ? "اسم المجلد: حروف إنجليزية وأرقام وشرطة فقط." : "تعذر الحفظ", "error");
  };
  return (
    <Dialog
      open
      onClose={onClose}
      title="تفاصيل الملف"
      size="lg"
      footer={
        <>
          <Button variant="ghost" className="me-auto text-danger hover:bg-danger-bg" onClick={onDelete}>
            <TrashIcon size={16} /> حذف
          </Button>
          <Button variant="subtle" onClick={onClose}>
            إلغاء
          </Button>
          <Button variant="secondary" onClick={() => void save()} disabled={saving}>
            {saving ? "جارٍ الحفظ…" : "حفظ"}
          </Button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-[var(--radius-md)] bg-paper-2">
          {item.kind === "video" ? (
            <video src={item.url} controls preload="metadata" className="w-full" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.url} alt="" className="w-full" />
          )}
        </div>
        <div className="space-y-4">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-ink-600">الاسم</dt>
              <dd className="t-latin truncate font-medium">{item.filename}</dd>
            </div>
            <div>
              <dt className="text-ink-600">الحجم</dt>
              <dd className="t-latin font-medium">{formatBytes(item.size)}</dd>
            </div>
            {item.width && (
              <div>
                <dt className="text-ink-600">الأبعاد</dt>
                <dd className="t-latin font-medium">
                  {item.width}×{item.height}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-ink-600">الرابط</dt>
              <dd className="t-latin truncate font-medium">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-orange-700 underline">
                  فتح
                </a>
              </dd>
            </div>
          </dl>
          <LocalizedField label="النص البديل (Alt) — يصف الصورة لمحركات البحث وقارئات الشاشة" value={alt} onChange={setAlt} multiline rows={2} />
          <TextField label="المجلد" value={folder} onChange={setFolder} dir="ltr" hint="لتنظيم الملفات، مثل: projects أو team" />
        </div>
      </div>
    </Dialog>
  );
}

/** Single media field with preview, choose, and remove. */
export function MediaPicker({
  label,
  value,
  onChange,
  kind = "image",
  folder = "general",
  hint,
  aspect = "aspect-video",
}: {
  label: string;
  value: PublicMedia | null;
  onChange: (m: PublicMedia | null) => void;
  kind?: "image" | "video" | "all";
  folder?: string;
  hint?: string;
  aspect?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-navy-900">{label}</p>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn("relative w-40 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-dashed border-line bg-paper-2 hover:border-orange-500", aspect)}
          aria-label={value ? `تغيير ${label}` : `اختيار ${label}`}
        >
          {value ? (
            <MediaThumb item={value} />
          ) : (
            <span className="flex h-full flex-col items-center justify-center gap-1 text-xs text-ink-600">
              <UploadIcon size={20} />
              اختر أو ارفع
            </span>
          )}
        </button>
        <div className="flex flex-col gap-2">
          <Button variant="subtle" size="sm" onClick={() => setOpen(true)}>
            {value ? "تغيير" : "اختيار"}
          </Button>
          {value && (
            <Button variant="ghost" size="sm" className="text-danger hover:bg-danger-bg" onClick={() => onChange(null)}>
              إزالة
            </Button>
          )}
        </div>
      </div>
      {hint && <p className="mt-1.5 text-xs text-ink-600">{hint}</p>}
      <Dialog open={open} onClose={() => setOpen(false)} title={label} size="xl">
        {open && (
          <MediaLibrary
            mode="select"
            kind={kind}
            defaultFolder={folder}
            onSelect={(items) => {
              onChange(items[0] ?? null);
              setOpen(false);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}
