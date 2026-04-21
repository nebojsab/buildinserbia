"use client";

import { useEffect } from "react";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphHtml(text: string): string {
  return `<p>${escapeHtml(text).replace(/\n/g, "<br />")}</p>`;
}

function listHtml(items: string[], ordered: boolean): string {
  const tag = ordered ? "ol" : "ul";
  const renderedItems = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `<${tag}>${renderedItems}</${tag}>`;
}

function legacyContentToHtml(content: string): string {
  const chunks = content
    .split(/\n\s*\n/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks
    .map((chunk) => {
      const lines = chunk
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length === 0) return "";

      const allBullet = lines.every((line) => /^-\s+/.test(line));
      if (allBullet) {
        return listHtml(
          lines.map((line) => line.replace(/^-\s+/, "").trim()),
          false,
        );
      }

      const allOrdered = lines.every((line) => /^\d+[.)]\s+/.test(line));
      if (allOrdered) {
        return listHtml(
          lines.map((line) => line.replace(/^\d+[.)]\s+/, "").trim()),
          true,
        );
      }

      const firstLine = lines[0] ?? "";
      const restText = lines.slice(1).join(" ").trim();

      if (firstLine.startsWith("# ")) {
        return [`<h2>${escapeHtml(firstLine.replace(/^#\s+/, "").trim())}</h2>`, restText ? paragraphHtml(restText) : ""]
          .filter(Boolean)
          .join("");
      }

      if (firstLine.startsWith("## ")) {
        return [`<h3>${escapeHtml(firstLine.replace(/^##\s+/, "").trim())}</h3>`, restText ? paragraphHtml(restText) : ""]
          .filter(Boolean)
          .join("");
      }

      return paragraphHtml(lines.join(" "));
    })
    .join("");
}

function normalizeEditorContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return "<p></p>";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  return legacyContentToHtml(trimmed);
}

function ToolbarButton({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`rt-editor-btn${active ? " rt-editor-btn--active" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (nextValue: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
    ],
    content: normalizeEditorContent(value),
    editorProps: {
      attributes: {
        class: "rt-editor-surface",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const normalized = normalizeEditorContent(value);
    if (editor.getHTML() === normalized) return;
    editor.commands.setContent(normalized, { emitUpdate: false });
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="rt-editor-shell">
      <div className="rt-editor-toolbar">
        <ToolbarButton label="P" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()} />
        <ToolbarButton label="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolbarButton label="H3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <ToolbarButton label="B" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton label="I" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarButton label="UL" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarButton label="OL" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <ToolbarButton
          label="Link"
          active={editor.isActive("link")}
          onClick={() => {
            const previousUrl = editor.getAttributes("link").href as string | undefined;
            const nextUrl = window.prompt("Unesi URL", previousUrl ?? "https://");
            if (nextUrl == null) return;
            if (!nextUrl.trim()) {
              editor.chain().focus().unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: nextUrl.trim() }).run();
          }}
        />
        <ToolbarButton label="Clear" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
