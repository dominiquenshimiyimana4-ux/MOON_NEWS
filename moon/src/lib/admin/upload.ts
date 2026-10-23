export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

/** LocalStorage-safe limit (~4MB of base64 payload). */
export const MAX_UPLOAD_BYTES = 2.5 * 1024 * 1024;

export type UploadKind = "image" | "video" | "any";

export function acceptFor(kind: UploadKind): string {
  if (kind === "image") return [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(",");
  if (kind === "video") return [...ACCEPTED_VIDEO_TYPES, ...ACCEPTED_IMAGE_TYPES].join(",");
  return [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(",");
}

export function kindOfFile(file: File): "image" | "video" | "unknown" {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return "image";
  if (ACCEPTED_VIDEO_TYPES.includes(file.type)) return "video";
  return "unknown";
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}