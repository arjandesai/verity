import * as React from "react";
import { useCallback, useState } from "react";
import { ImagePlus, Music, Upload, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useImageUpload } from "@/components/hooks/use-image-upload";

interface FileUploadZoneProps {
  kind: "image" | "audio";
  onFileSelected?: (file: File, url: string) => void;
  className?: string;
}

/** A drag-and-drop (or click-to-browse) file upload zone with a live preview — an image
 *  thumbnail for photos, or a filename + audio player for audio files. Used for the
 *  handwriting-photo upload and as an alternative to live-recording on the speech test. */
export function FileUploadZone({ kind, onFileSelected, className }: FileUploadZoneProps) {
  const { previewUrl, fileName, file, fileInputRef, handleThumbnailClick, handleFileChange, handleRemove } = useImageUpload({
    onUpload: (url, f) => onFileSelected?.(f, url),
  });
  const [isDragging, setIsDragging] = useState(false);
  const accept = kind === "image" ? "image/*" : "audio/*";

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const dropped = e.dataTransfer.files?.[0];
      const matches = kind === "image" ? dropped?.type.startsWith("image/") : dropped?.type.startsWith("audio/");
      if (dropped && matches) {
        const fakeEvent = { target: { files: [dropped] } } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileChange(fakeEvent);
      }
    },
    [handleFileChange, kind]
  );

  return (
    <div className={cn("w-full", className)}>
      <input type="file" accept={accept} className="hidden" ref={fileInputRef} onChange={handleFileChange} />

      {!previewUrl ? (
        <div
          onClick={handleThumbnailClick}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            display: "flex",
            height: kind === "image" ? 200 : 140,
            cursor: "pointer",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            borderRadius: 12,
            border: `2px dashed ${isDragging ? "var(--blue-deep)" : "var(--border)"}`,
            background: isDragging ? "rgba(47,111,237,0.06)" : "var(--bg)",
            transition: "border-color 0.15s ease, background 0.15s ease",
          }}
        >
          <div style={{ borderRadius: 999, background: "var(--card)", padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
            {kind === "image" ? <ImagePlus size={22} color="var(--text-soft)" /> : <Music size={22} color="var(--text-soft)" />}
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 13.5, fontWeight: 600 }}>Click to select {kind === "image" ? "a photo" : "an audio file"}</p>
            <p style={{ fontSize: 11.5, color: "var(--text-soft)" }}>or drag and drop it here</p>
          </div>
        </div>
      ) : (
        <div>
          {kind === "image" ? (
            <div className="group" style={{ position: "relative", height: 200, overflow: "hidden", borderRadius: 12, border: "1px solid var(--border)" }}>
              <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div
                className="group-hover:opacity-100"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "rgba(0,0,0,0.4)",
                  opacity: 0,
                  transition: "opacity 0.15s ease",
                }}
              >
                <button
                  onClick={handleThumbnailClick}
                  aria-label="Replace photo"
                  style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <Upload size={16} />
                </button>
                <button
                  onClick={handleRemove}
                  aria-label="Remove photo"
                  style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "#b23b3b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              <audio controls src={previewUrl} style={{ width: "100%" }} />
              <button onClick={handleRemove} className="btn btn-secondary btn-sm" style={{ alignSelf: "flex-start" }}>
                Remove file
              </button>
            </div>
          )}
          {fileName && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-soft)" }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</span>
              <button onClick={handleRemove} aria-label="Clear" style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--text-soft)", display: "flex" }}>
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
