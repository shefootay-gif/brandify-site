"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import type { Localized } from "@/server/db/schema/types";
import { cn } from "@/lib/utils";

function Toolbar({ editor }: { editor: Editor }) {
  const btn = (label: string, active: boolean, onClick: () => void, title: string) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn("min-w-8 rounded px-2 py-1 text-sm font-semibold", active ? "bg-navy-900 text-white" : "text-navy-900 hover:bg-paper-2")}
    >
      {label}
    </button>
  );
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("الرابط (https://…) — اتركه فارغًا للإزالة", prev ?? "https://");
    if (url === null) return;
    if (url === "" || url === "https://") editor.chain().focus().unsetLink().run();
    else if (/^(https?:|mailto:|tel:)/.test(url)) editor.chain().focus().setLink({ href: url }).run();
  };
  return (
    <div role="toolbar" aria-label="تنسيق النص" className="flex flex-wrap gap-1 border-b border-line bg-paper/60 p-1.5">
      {btn("B", editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), "عريض")}
      {btn("I", editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), "مائل")}
      {btn("H2", editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "عنوان رئيسي")}
      {btn("H3", editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "عنوان فرعي")}
      {btn("•", editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), "قائمة نقطية")}
      {btn("1.", editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), "قائمة مرقمة")}
      {btn("❝", editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), "اقتباس")}
      {btn("🔗", editor.isActive("link"), setLink, "رابط")}
      <span className="mx-1 w-px bg-line" />
      {btn("↶", false, () => editor.chain().focus().undo().run(), "تراجع")}
      {btn("↷", false, () => editor.chain().focus().redo().run(), "إعادة")}
    </div>
  );
}

function SingleEditor({ value, onChange, dir, label }: { value: string; onChange: (html: string) => void; dir: "rtl" | "ltr"; label: string }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, protocols: ["http", "https", "mailto", "tel"] },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        dir,
        "aria-label": label,
        class: "prose-brand min-h-40 px-4 py-3 text-[0.95rem] text-navy-900 outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  // Sync when the value is replaced from outside (e.g. form reset).
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  if (!editor) return <div className="min-h-48 animate-pulse bg-paper-2" />;
  return (
    <>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </>
  );
}

/** Bilingual rich text with AR/EN tabs. */
export function LocalizedRichText({ label, value, onChange, hint }: { label: string; value: Localized; onChange: (v: Localized) => void; hint?: string }) {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-navy-900">{label}</span>
        <div role="tablist" aria-label="اللغة" className="flex rounded-md border border-line p-0.5 text-xs">
          {(["ar", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={lang === l}
              onClick={() => setLang(l)}
              className={cn("t-latin rounded px-2.5 py-1 font-bold", lang === l ? "bg-navy-900 text-white" : "text-ink-600")}
            >
              {l.toUpperCase()}
              {!value[l] && <span className="ms-1 text-orange-500">•</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-[var(--radius-md)] border border-line bg-white focus-within:border-navy-600 focus-within:ring-2 focus-within:ring-orange-500/30">
        {(["ar", "en"] as const).map((l) => (
          <div key={l} hidden={lang !== l}>
            <SingleEditor value={value[l]} dir={l === "ar" ? "rtl" : "ltr"} label={`${label} (${l.toUpperCase()})`} onChange={(html) => onChange({ ...value, [l]: html })} />
          </div>
        ))}
      </div>
      {hint && <p className="mt-1.5 text-xs text-ink-600">{hint}</p>}
    </div>
  );
}

export default LocalizedRichText;
