import type { ProjectDocument } from "../lib/generateProjectDocs";

export function DocumentPreviewModal({
  doc,
  downloadLabel,
  docxLabel,
  closeLabel,
  onClose,
  onDownload,
  onDownloadDocx,
}: {
  doc: ProjectDocument;
  downloadLabel: string;
  docxLabel?: string;
  closeLabel: string;
  onClose: () => void;
  onDownload: (doc: ProjectDocument) => void;
  onDownloadDocx?: (doc: ProjectDocument) => void | Promise<void>;
}) {
  return (
    <div className="modal-back" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 720, width: "min(96vw, 720px)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "none",
            border: "none",
            fontSize: 20,
            color: "var(--ink4)",
            cursor: "pointer",
            lineHeight: 1,
            zIndex: 1,
          }}
        >
          ✕
        </button>
        <p
          style={{
            fontFamily: "var(--heading)",
            fontSize: 20,
            fontWeight: 500,
            color: "var(--ink)",
            marginBottom: 14,
            lineHeight: 1.3,
            paddingRight: 36,
          }}
        >
          {doc.title}
        </p>
        <div
          style={{
            flex: 1,
            overflow: "auto",
            border: "1px solid var(--bdr)",
            borderRadius: "var(--r)",
            background: "var(--bgw)",
            padding: "16px 18px",
            marginBottom: 18,
          }}
        >
          <pre
            style={{
              margin: 0,
              fontFamily: "var(--sans)",
              fontSize: 12.5,
              lineHeight: 1.55,
              color: "var(--ink2)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {doc.body}
          </pre>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" className="btn-g" style={{ fontSize: 13, padding: "10px 18px" }} onClick={onClose}>
            {closeLabel}
          </button>
          {docxLabel && onDownloadDocx ? (
            <button
              type="button"
              className="btn-g"
              style={{ fontSize: 13, padding: "10px 18px" }}
              onClick={() => void onDownloadDocx(doc)}
            >
              {docxLabel}
            </button>
          ) : null}
          <button type="button" className="btn-p" style={{ fontSize: 13, padding: "10px 20px" }} onClick={() => onDownload(doc)}>
            {downloadLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function downloadProjectDocument(doc: ProjectDocument): void {
  const blob = new Blob(["\uFEFF" + doc.body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = doc.filename;
  a.click();
  URL.revokeObjectURL(url);
}
