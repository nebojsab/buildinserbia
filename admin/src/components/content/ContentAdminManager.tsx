"use client";

import JSZip from "jszip";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  calculateReadingTimeMinutes,
  formatContentDate,
  generateExcerptFromBody,
  slugify,
} from "@shared/content/helpers";
import { localeLabel } from "@shared/content/localize";
import { MediaLibraryPicker } from "@/components/media/MediaLibraryPicker";
import { RichTextEditor } from "@/components/content/RichTextEditor";
import { useToast } from "@/components/ui/ToastProvider";
import { addMediaItemFromFile, mediaKindFromFileName } from "@/lib/mediaLibraryStore";
import type { MediaItem } from "@/lib/mediaLibraryStore";
import type {
  BaseContentItem,
  DocumentAttachment,
  ContentLocale,
  ContentType,
  LocalizedContentFields,
  PublishStatus,
} from "@shared/content/types";

type FormState = {
  id: string;
  type: ContentType;
  slug: string;
  coverImage: string;
  coverImageFileName: string;
  locales: Record<
    ContentLocale,
    {
      title: string;
      body: string;
      excerpt: string;
      categories: string[];
      useCustomExcerpt: boolean;
    }
  >;
  author: string;
  createdAt: string;
  publishStatus: PublishStatus;
  featured: boolean;
  readingTimeOverride: string;
  attachments: DocumentAttachment[];
};

function dateInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const last = path.split("/").filter(Boolean).pop() ?? "";
    return decodeURIComponent(last);
  } catch {
    return "";
  }
}

function emptyForm(type: ContentType, defaultAuthor: string): FormState {
  const now = new Date().toISOString();
  return {
    id: `tmp-${Math.random().toString(36).slice(2, 10)}`,
    type,
    slug: "",
    coverImage: "",
    coverImageFileName: "",
    locales: {
      sr: { title: "", body: "", excerpt: "", categories: [], useCustomExcerpt: false },
      en: { title: "", body: "", excerpt: "", categories: [], useCustomExcerpt: false },
      ru: { title: "", body: "", excerpt: "", categories: [], useCustomExcerpt: false },
    },
    author: defaultAuthor,
    createdAt: now,
    publishStatus: "draft",
    featured: false,
    readingTimeOverride: "",
    attachments: [],
  };
}

function toLocalizedFields(
  fields: FormState["locales"][ContentLocale],
): LocalizedContentFields {
  const autoExcerpt = generateExcerptFromBody(fields.body);
  return {
    title: fields.title.trim(),
    body: fields.body.trim(),
    excerpt: fields.useCustomExcerpt ? fields.excerpt.trim() : autoExcerpt,
    categories: fields.categories,
  };
}

function toContentItem(form: FormState): BaseContentItem {
  const sr = toLocalizedFields(form.locales.sr);
  const en = toLocalizedFields(form.locales.en);
  const ru = toLocalizedFields(form.locales.ru);
  const fallback = sr.title ? sr : en.title ? en : ru;
  const autoReadingTime = calculateReadingTimeMinutes(fallback.body);
  return {
    id: form.id,
    type: form.type,
    title: fallback.title,
    slug: form.slug.trim(),
    coverImage: form.coverImage.trim() || undefined,
    body: fallback.body,
    excerpt: fallback.excerpt,
    categories: fallback.categories,
    author: form.author.trim(),
    createdAt: new Date(form.createdAt).toISOString(),
    publishStatus: form.publishStatus,
    featured: form.featured,
    readingTime: form.readingTimeOverride.trim() ? Number(form.readingTimeOverride) : autoReadingTime,
    attachments: form.type === "document" ? form.attachments : undefined,
    locales: { sr, en, ru },
  };
}

function fromContentItem(item: BaseContentItem): FormState {
  const existingCover = (item.coverImage ?? "").trim();
  return {
    id: item.id,
    type: item.type,
    slug: item.slug,
    coverImage: existingCover,
    coverImageFileName: existingCover ? fileNameFromUrl(existingCover) || "Existing cover image" : "",
    locales: {
      sr: {
        title: item.locales.sr.title,
        body: item.locales.sr.body,
        excerpt: item.locales.sr.excerpt,
        categories: item.locales.sr.categories,
        useCustomExcerpt: Boolean(item.locales.sr.excerpt),
      },
      en: {
        title: item.locales.en.title,
        body: item.locales.en.body,
        excerpt: item.locales.en.excerpt,
        categories: item.locales.en.categories,
        useCustomExcerpt: Boolean(item.locales.en.excerpt),
      },
      ru: {
        title: item.locales.ru.title,
        body: item.locales.ru.body,
        excerpt: item.locales.ru.excerpt,
        categories: item.locales.ru.categories,
        useCustomExcerpt: Boolean(item.locales.ru.excerpt),
      },
    },
    author: item.author,
    createdAt: item.createdAt,
    publishStatus: item.publishStatus,
    featured: Boolean(item.featured),
    readingTimeOverride: item.readingTime ? String(item.readingTime) : "",
    attachments: item.type === "document" ? [...(item.attachments ?? [])] : [],
  };
}

export function ContentAdminManager({
  title,
  description,
  type,
  categoryOptions,
  ctaVerb,
  initialItems,
  backupUrl,
  backupLabel = "Backup all",
}: {
  title: string;
  description: string;
  type: ContentType;
  categoryOptions: Record<ContentLocale, readonly string[]>;
  ctaVerb: string;
  initialItems: BaseContentItem[];
  backupUrl?: string;
  backupLabel?: string;
}) {
  const toast = useToast();
  const [items, setItems] = useState<BaseContentItem[]>(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState<ContentLocale>("sr");
  const [form, setForm] = useState<FormState>(() => emptyForm(type, "BuildInSerbia Editorial"));
  const [importingBackup, setImportingBackup] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [loadingFromServer, setLoadingFromServer] = useState(false);
  const restoreInputRef = useRef<HTMLInputElement | null>(null);
  const coverUploadInputRef = useRef<HTMLInputElement | null>(null);
  const attachmentsInputRef = useRef<HTMLInputElement | null>(null);

  const isEditing = Boolean(editingId);
  const localeFields = form.locales[activeLocale];
  const autoExcerpt = useMemo(
    () => generateExcerptFromBody(localeFields.body),
    [localeFields.body],
  );
  const autoReadingTime = useMemo(
    () =>
      calculateReadingTimeMinutes(
        form.locales.sr.body || form.locales.en.body || form.locales.ru.body || "",
      ),
    [form.locales.sr.body, form.locales.en.body, form.locales.ru.body],
  );

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [items],
  );

  const deleteCandidate = useMemo(
    () => sortedItems.find((item) => item.id === deleteCandidateId) ?? null,
    [deleteCandidateId, sortedItems],
  );
  const tableHeaders = type === "document"
    ? ["Cover", "Title", "Status", "Categories", "Author", "Date", "Read", "Files", "Actions"]
    : ["Cover", "Title", "Status", "Categories", "Author", "Date", "Read", "Actions"];

  useEffect(() => {
    let cancelled = false;
    async function loadItems() {
      setLoadingFromServer(true);
      try {
        const response = await fetch(`/api/content?type=${type}`, {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as
          | { items?: BaseContentItem[]; error?: string }
          | null;
        if (!response.ok) {
          throw new Error(payload?.error ?? "Ne mogu da učitam sadržaj.");
        }
        const nextItems = Array.isArray(payload?.items) ? payload.items : [];
        if (!cancelled) setItems(nextItems);
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Ne mogu da učitam sadržaj.");
        }
      } finally {
        if (!cancelled) setLoadingFromServer(false);
      }
    }
    void loadItems();
    return () => {
      cancelled = true;
    };
  }, [toast, type]);

  async function persistItems(nextItems: BaseContentItem[]) {
    const response = await fetch(`/api/content?type=${type}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: nextItems }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      throw new Error(payload?.error ?? "Neuspešno čuvanje sadržaja.");
    }
  }

  function resetForm() {
    setEditingId(null);
    setActiveLocale("sr");
    setForm(emptyForm(type, "BuildInSerbia Editorial"));
  }

  function openCreateDrawer() {
    resetForm();
    setDrawerOpen(true);
  }

  function openEditDrawer(item: BaseContentItem) {
    setEditingId(item.id);
    setActiveLocale("sr");
    setForm(fromContentItem(item));
    setDrawerOpen(true);
  }

  async function saveItem() {
    if (!form.locales.sr.title.trim() || !form.locales.sr.body.trim()) {
      toast.error("Naslov i body na srpskom su obavezni.");
      return;
    }
    const wasEditing = isEditing;
    const fallbackTitle = form.locales.sr.title || form.locales.en.title || form.locales.ru.title;
    const prepared = toContentItem({
      ...form,
      slug: form.slug.trim() || slugify(fallbackTitle),
    });
    const nextItems = (() => {
      const exists = items.some((entry) => entry.id === prepared.id);
      if (exists) return items.map((entry) => (entry.id === prepared.id ? prepared : entry));
      return [prepared, ...items];
    })();
    try {
      await persistItems(nextItems);
      setItems(nextItems);
      setDrawerOpen(false);
      resetForm();
      toast.success(
        wasEditing
          ? `${ctaVerb} je uspešno ažuriran.`
          : `${ctaVerb} je uspešno sačuvan.`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Neuspešno čuvanje sadržaja.");
    }
  }

  async function onCoverImageSelected(file: File | null) {
    if (!file) return;
    if (mediaKindFromFileName(file.name) !== "image") {
      toast.error("Podržani formati za cover su: jpg, jpeg, png, svg, webp.");
      return;
    }
    try {
      setCoverUploading(true);
      const uploaded = await addMediaItemFromFile({
        file,
        name: file.name.replace(/\.[^.]+$/, ""),
        categories: ["cover", type],
      });
      if (uploaded.kind !== "image") {
        toast.error("Za cover možeš da koristiš samo sliku.");
        return;
      }
      setForm((prev) => ({
        ...prev,
        coverImage: uploaded.url,
        coverImageFileName: uploaded.fileName,
      }));
      toast.success("Naslovna slika je uploadovana i sačuvana.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Ne mogu da uploadujem izabranu sliku.",
      );
    } finally {
      setCoverUploading(false);
      if (coverUploadInputRef.current) coverUploadInputRef.current.value = "";
    }
  }

  function applyCoverImageFromLibrary(item: MediaItem) {
    setForm((prev) => ({
      ...prev,
      coverImage: item.url,
      coverImageFileName: item.fileName,
    }));
    toast.info("Slika je izabrana iz Media Library.");
  }

  async function onAttachmentsSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const hasUnsupported = files.some((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      return ext !== "pdf" && ext !== "docx";
    });
    if (hasUnsupported) {
      toast.error("Only PDF and DOCX files are supported.");
      if (attachmentsInputRef.current) attachmentsInputRef.current.value = "";
      return;
    }

    setAttachmentUploading(true);
    try {
      const payload = new FormData();
      files.forEach((file) => payload.append("files", file));
      const response = await fetch("/api/document-attachments", {
        method: "POST",
        body: payload,
      });
      const data = (await response.json().catch(() => null)) as
        | { error?: string; attachments?: DocumentAttachment[] }
        | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "Attachment upload failed.");
      }

      const uploaded = Array.isArray(data?.attachments) ? data.attachments : [];
      if (uploaded.length === 0) {
        throw new Error("Attachment upload failed.");
      }

      setForm((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...uploaded],
      }));
      toast.success(`Added ${uploaded.length} downloadable file${uploaded.length > 1 ? "s" : ""}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Attachment upload failed.");
    } finally {
      setAttachmentUploading(false);
      if (attachmentsInputRef.current) attachmentsInputRef.current.value = "";
    }
  }

  function removeAttachment(attachmentId: string) {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((entry) => entry.id !== attachmentId),
    }));
  }

  async function deleteItem(id: string) {
    const nextItems = items.filter((entry) => entry.id !== id);
    try {
      await persistItems(nextItems);
      setItems(nextItems);
      if (editingId === id) resetForm();
      if (deleteCandidateId === id) setDeleteCandidateId(null);
      toast.success(`${ctaVerb} je obrisan.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Neuspešno brisanje sadržaja.");
    }
  }

  function openPreviewInTab(item: BaseContentItem) {
    const publicBase = item.type === "document" ? "/documents" : "/blog";
    window.open(`${publicBase}/${item.slug}?lang=sr`, "_blank", "noopener,noreferrer");
  }

  async function downloadBackup() {
    const zip = new JSZip();
    const generatedAt = new Date().toISOString();
    const backupFile = type === "document" ? "documents.json" : "blog-posts.json";
    zip.file(
      "manifest.json",
      JSON.stringify(
        {
          formatVersion: 1,
          backupType: type === "document" ? "documents" : "blog-posts",
          generatedAt,
          counts: {
            items: items.length,
          },
        },
        null,
        2,
      ),
    );
    zip.file(`content/${backupFile}`, JSON.stringify(items, null, 2));
    const bytes = await zip.generateAsync({ type: "uint8array" });
    const blob = new Blob([bytes], { type: "application/zip" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download =
      type === "document"
        ? `buildinserbia-documents-backup-${generatedAt.slice(0, 10)}.zip`
        : `buildinserbia-blog-backup-${generatedAt.slice(0, 10)}.zip`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
    toast.success("Backup je pripremljen za download.");
  }

  async function restoreBackupFile(file: File) {
    setImportingBackup(true);
    try {
      const bytes = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(bytes);
      const candidates = type === "document"
        ? ["content/documents.json", "documents.json"]
        : ["content/blog-posts.json", "blog-posts.json"];

      let contentRaw = "";
      for (const candidate of candidates) {
        const fileEntry = zip.file(candidate);
        if (!fileEntry) continue;
        contentRaw = await fileEntry.async("text");
        break;
      }

      if (!contentRaw) {
        toast.error("Backup nema validan content JSON fajl za ovaj tip.");
        return;
      }

      const parsed = JSON.parse(contentRaw) as BaseContentItem[];
      if (!Array.isArray(parsed)) {
        toast.error("Backup format nije validan.");
        return;
      }

      const confirmReplace = window.confirm(
        "Restore import ce zameniti trenutnu listu stavki za ovaj tip. Nastavi?",
      );
      if (!confirmReplace) return;

      await persistItems(parsed);
      setItems(parsed);
      toast.success(`Restore uspešan. Uvezeno stavki: ${parsed.length}.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? `Restore import nije uspeo: ${error.message}` : "Restore import nije uspeo.",
      );
    } finally {
      setImportingBackup(false);
      if (restoreInputRef.current) restoreInputRef.current.value = "";
    }
  }

  return (
    <>
      <section className="card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 18px",
            borderBottom: "1px solid var(--bdr)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ fontFamily: "var(--heading)", fontSize: 18, marginBottom: 6 }}>{title}</h2>
            <p style={{ fontSize: 13, color: "var(--ink3)", lineHeight: 1.6 }}>{description}</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button type="button" className="btn-g" onClick={() => void downloadBackup()}>
              {backupLabel}
            </button>
            <button
              type="button"
              className="btn-g"
              disabled={importingBackup}
              onClick={() => restoreInputRef.current?.click()}
            >
              {importingBackup ? "Importujem..." : "Restore import"}
            </button>
            <input
              ref={restoreInputRef}
              type="file"
              accept=".zip,application/zip"
              style={{ display: "none" }}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                void restoreBackupFile(file);
              }}
            />
            {backupUrl ? (
              <a href={backupUrl} className="btn-g" title="Server backup endpoint">
                API backup
              </a>
            ) : null}
            <button type="button" className="btn-p" onClick={openCreateDrawer}>
              Add new {ctaVerb}
            </button>
          </div>
        </div>
        {loadingFromServer ? (
          <div style={{ padding: "30px 20px", textAlign: "center" }}>
            <p style={{ color: "var(--ink3)", fontSize: 13 }}>Loading content...</p>
          </div>
        ) : sortedItems.length === 0 ? (
          <div style={{ padding: "30px 20px", textAlign: "center" }}>
            <p style={{ color: "var(--ink2)", marginBottom: 8 }}>No entries yet.</p>
            <p style={{ color: "var(--ink4)", fontSize: 12.5 }}>
              Use the button in the top-right corner to create your first entry.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
              <thead>
                <tr style={{ background: "var(--bgw)" }}>
                  {tableHeaders.map((head) => (
                    <th
                      key={head}
                      style={{
                        textAlign: "left",
                        fontSize: 11,
                        letterSpacing: ".08em",
                        textTransform: "uppercase",
                        color: "var(--ink4)",
                        padding: "10px 12px",
                        borderBottom: "1px solid var(--bdr)",
                      }}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                      {(() => {
                        const resolvedCoverImage = (item.coverImage ?? "").trim();
                        return (
                      <div
                        style={{
                          width: 58,
                          height: 38,
                          borderRadius: 8,
                          border: "1px solid var(--bdr)",
                          background: !resolvedCoverImage
                            ? "linear-gradient(145deg, rgba(196,92,46,.13), rgba(29,78,216,.08))"
                            : undefined,
                          overflow: "hidden",
                        }}
                      >
                        {resolvedCoverImage ? (
                          <img
                            src={resolvedCoverImage}
                            alt={item.locales.sr.title || "Cover"}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        ) : null}
                      </div>
                        );
                      })()}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                        {item.locales.sr.title}
                      </p>
                      <p style={{ fontSize: 12, color: "var(--ink4)" }}>/{item.slug}</p>
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: ".06em",
                          color: item.publishStatus === "published" ? "var(--grn)" : "var(--amb)",
                        }}
                      >
                        {item.publishStatus}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {item.categories.slice(0, 2).map((tag) => (
                          <span key={tag} style={{ fontSize: 11, color: "var(--ink3)" }}>
                            {tag}
                          </span>
                        ))}
                        {item.categories.length > 2 ? <span style={{ fontSize: 11, color: "var(--ink4)" }}>+{item.categories.length - 2}</span> : null}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)", fontSize: 12.5, color: "var(--ink3)" }}>
                      {item.author}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)", fontSize: 12.5, color: "var(--ink3)" }}>
                      {formatContentDate(item.createdAt)}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)", fontSize: 12.5, color: "var(--ink3)" }}>
                      {item.readingTime ?? 1} min
                    </td>
                    {type === "document" ? (
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)", fontSize: 12.5, color: "var(--ink3)" }}>
                        {(item.attachments ?? []).length > 0 ? `${(item.attachments ?? []).length} files` : "0"}
                      </td>
                    ) : null}
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className="btn-g"
                          style={{ padding: "6px 9px", fontSize: 11.5 }}
                          onClick={() => openEditDrawer(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-g"
                          style={{ padding: "6px 9px", fontSize: 11.5 }}
                          onClick={() => openPreviewInTab(item)}
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          className="btn-g"
                          style={{ padding: "6px 9px", fontSize: 11.5, color: "#DC2626", borderColor: "#FCA5A5" }}
                          onClick={() => setDeleteCandidateId(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {drawerOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 450,
          }}
        >
          <button
            type="button"
            aria-label="Close drawer backdrop"
            onClick={() => setDrawerOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              border: "none",
              background: "rgba(24,24,27,.45)",
              cursor: "pointer",
            }}
          />

          <aside
            className="card"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "min(560px, 95vw)",
              height: "100vh",
              borderRadius: 0,
              borderLeft: "1px solid var(--bdr)",
              overflowY: "auto",
              padding: "16px 16px 24px",
              background: "var(--bg)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
              <h3 style={{ fontFamily: "var(--heading)", fontSize: 17 }}>
                {isEditing ? `Edit ${ctaVerb}` : `Create ${ctaVerb}`}
              </h3>
              <button type="button" className="btn-g" onClick={() => setDrawerOpen(false)}>
                Close
              </button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <div className="mtabs" style={{ width: "fit-content", marginBottom: 10 }}>
                  {(["sr", "en", "ru"] as const).map((locale) => (
                    <button
                      key={locale}
                      type="button"
                      className={`mtab ${activeLocale === locale ? "mtab--active" : ""}`}
                      onClick={() => setActiveLocale(locale)}
                    >
                      {localeLabel(locale)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flabel">Title</label>
                <input
                  className="finput"
                  value={localeFields.title}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      locales: {
                        ...prev.locales,
                        [activeLocale]: {
                          ...prev.locales[activeLocale],
                          title: event.target.value,
                        },
                      },
                      slug:
                        activeLocale === "sr" && !prev.slug
                          ? slugify(event.target.value)
                          : prev.slug,
                    }))
                  }
                />
              </div>

              <div>
                <label className="flabel">Slug</label>
                <input
                  className="finput"
                  value={form.slug}
                  onChange={(event) => setForm((prev) => ({ ...prev, slug: slugify(event.target.value) }))}
                />
              </div>

              <div>
                <label className="flabel">Cover image upload</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn-g"
                    disabled={coverUploading}
                    onClick={() => coverUploadInputRef.current?.click()}
                  >
                    {coverUploading ? "Uploadujem..." : "Izaberi sliku"}
                  </button>
                  <span style={{ fontSize: 12.5, color: form.coverImageFileName ? "var(--ink2)" : "var(--ink4)" }}>
                    {form.coverImageFileName || "Nije izabrana slika"}
                  </span>
                  <input
                    ref={coverUploadInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(event) => {
                      const next = event.target.files?.[0] ?? null;
                      void onCoverImageSelected(next);
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <MediaLibraryPicker
                    kind="image"
                    label="Izaberi iz Media Library"
                    onSelect={(item) => applyCoverImageFromLibrary(item)}
                  />
                </div>
                <div style={{ marginTop: 8 }}>
                  <label className="flabel">ili URL slike</label>
                  <input
                    className="finput"
                    value={form.coverImage}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        coverImage: event.target.value,
                        coverImageFileName: prev.coverImageFileName || "URL image",
                      }))
                    }
                    placeholder="https://..."
                  />
                </div>
                {form.coverImage ? (
                  <div style={{ marginTop: 8 }}>
                    <img
                      src={form.coverImage}
                      alt="Cover preview"
                      style={{ width: "100%", maxHeight: 190, objectFit: "cover", borderRadius: 10, border: "1px solid var(--bdr)" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 11.5, color: "var(--ink4)" }}>{form.coverImageFileName || "Uploaded image"}</span>
                      <button
                        type="button"
                        className="btn-g"
                        style={{ padding: "5px 8px", fontSize: 11.5 }}
                        onClick={() => setForm((prev) => ({ ...prev, coverImage: "", coverImageFileName: "" }))}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div>
                <label className="flabel">Body text</label>
                <RichTextEditor
                  value={localeFields.body}
                  onChange={(nextBody) =>
                    setForm((prev) => ({
                      ...prev,
                      locales: {
                        ...prev.locales,
                        [activeLocale]: {
                          ...prev.locales[activeLocale],
                          body: nextBody,
                        },
                      },
                    }))
                  }
                />
              </div>

              {type === "document" ? (
                <div>
                  <label className="flabel">Downloadable files</label>
                  <p style={{ fontSize: 12.5, color: "var(--ink4)", marginBottom: 8 }}>
                    Upload one or more PDF or DOCX files that should appear as downloadable resources on the public document page.
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="btn-g"
                      disabled={attachmentUploading}
                      onClick={() => attachmentsInputRef.current?.click()}
                    >
                      {attachmentUploading ? "Uploading..." : "Attach files"}
                    </button>
                    <span style={{ fontSize: 12, color: "var(--ink4)" }}>
                      Upload PDF or DOCX files for visitors to download from this document page.
                    </span>
                    <input
                      ref={attachmentsInputRef}
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      multiple
                      style={{ display: "none" }}
                      onChange={(event) => void onAttachmentsSelected(event.target.files)}
                    />
                  </div>
                  {form.attachments.length === 0 ? (
                    <p style={{ fontSize: 12.5, color: "var(--ink4)", marginTop: 10 }}>
                      No downloadable files added yet.
                    </p>
                  ) : (
                    <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                      {form.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="card"
                          style={{
                            borderRadius: 10,
                            padding: "9px 10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: 12.5,
                                fontWeight: 600,
                                color: "var(--ink)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {attachment.name}
                            </p>
                            <p style={{ fontSize: 11.5, color: "var(--ink4)" }}>
                              {attachment.fileType.toUpperCase()}
                              {attachment.fileSize ? ` • ${attachment.fileSize}` : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn-g"
                            style={{ padding: "5px 8px", fontSize: 11.5 }}
                            onClick={() => removeAttachment(attachment.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink3)", marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={localeFields.useCustomExcerpt}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        locales: {
                          ...prev.locales,
                          [activeLocale]: {
                            ...prev.locales[activeLocale],
                            useCustomExcerpt: event.target.checked,
                          },
                        },
                      }))
                    }
                  />
                  Manual excerpt override
                </label>
                <textarea
                  className="finput"
                  style={{ minHeight: 80, resize: "vertical" }}
                  value={localeFields.useCustomExcerpt ? localeFields.excerpt : autoExcerpt}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      locales: {
                        ...prev.locales,
                        [activeLocale]: {
                          ...prev.locales[activeLocale],
                          excerpt: event.target.value,
                        },
                      },
                    }))
                  }
                  disabled={!localeFields.useCustomExcerpt}
                />
              </div>

              <div>
                <label className="flabel">Categories</label>
                <div style={{ maxHeight: 120, overflow: "auto", border: "1px solid var(--bdr)", borderRadius: 10, padding: "8px 10px" }}>
                  {categoryOptions[activeLocale].map((option) => (
                    <label key={option} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, marginBottom: 6 }}>
                      <input
                        type="checkbox"
                        checked={localeFields.categories.includes(option)}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            locales: {
                              ...prev.locales,
                              [activeLocale]: {
                                ...prev.locales[activeLocale],
                                categories: event.target.checked
                                  ? [...prev.locales[activeLocale].categories, option]
                                  : prev.locales[activeLocale].categories.filter((entry) => entry !== option),
                              },
                            },
                          }))
                        }
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className="flabel">Author</label>
                  <input
                    className="finput"
                    value={form.author}
                    onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
                  />
                </div>
                <div>
                  <label className="flabel">Created date</label>
                  <input
                    className="finput"
                    type="date"
                    value={dateInputValue(form.createdAt)}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        createdAt: new Date(`${event.target.value}T09:00:00.000Z`).toISOString(),
                      }))
                    }
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className="flabel">Publish status</label>
                  <select
                    className="fselect"
                    value={form.publishStatus}
                    onChange={(event) => setForm((prev) => ({ ...prev, publishStatus: event.target.value as PublishStatus }))}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <label className="flabel">Reading time (minutes)</label>
                  <input
                    className="finput"
                    type="number"
                    min={1}
                    placeholder={`${autoReadingTime}`}
                    value={form.readingTimeOverride}
                    onChange={(event) => setForm((prev) => ({ ...prev, readingTimeOverride: event.target.value }))}
                  />
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink3)" }}>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))}
                />
                Featured item
              </label>

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button type="button" className="btn-p" onClick={() => void saveItem()}>
                  {isEditing ? "Update item" : "Create item"}
                </button>
                <button type="button" className="btn-g" onClick={resetForm}>
                  Clear
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {deleteCandidate ? (
        <div className="modal-back" onClick={() => setDeleteCandidateId(null)}>
          <div
            className="modal-box"
            style={{ maxWidth: 460, padding: "20px 20px" }}
            onClick={(event) => event.stopPropagation()}
          >
            <h4 style={{ fontFamily: "var(--heading)", fontSize: 22, marginBottom: 10 }}>
              Delete {ctaVerb}?
            </h4>
            <p style={{ fontSize: 13.5, color: "var(--ink3)", lineHeight: 1.65 }}>
              Are you sure you want to delete <strong>{deleteCandidate.locales.sr.title}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
              <button type="button" className="btn-g" onClick={() => setDeleteCandidateId(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-g"
                style={{ color: "#DC2626", borderColor: "#FCA5A5" }}
                onClick={() => {
                  void deleteItem(deleteCandidate.id);
                  setDeleteCandidateId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
