import { useCallback, useRef, useState } from "react";

interface UseImageUploadOptions {
  onUpload?: (url: string, file: File) => void;
}

/** Manages a single-file upload with a live preview URL — used for both image drag/drop (the
 *  handwriting photo test) and audio file uploads (an alternative to recording live for the
 *  speech test). Not React-Native/Next specific — plain browser File/URL APIs, works anywhere. */
export function useImageUpload({ onUpload }: UseImageUploadOptions = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selected = event.target.files?.[0];
      if (!selected) return;
      setFile(selected);
      setFileName(selected.name);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
      onUpload?.(url, selected);
    },
    [onUpload]
  );

  const handleRemove = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileName(null);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [previewUrl]);

  return { previewUrl, fileName, file, fileInputRef, handleThumbnailClick, handleFileChange, handleRemove };
}
