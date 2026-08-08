export interface UploadFileResult {
  fileName: string;
  fileUrl: string;
  storage: string;
  checksum?: string;
  urlResize?: string;
  mobileFileUrl?: string;
  mobileFileName?: string;
  isHD?: boolean;
  size?: number;
  isSkipped?: boolean;
}

export type UploadMode = "single" | "image" | "document" | "audio" | "catbox" | "s3";

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}
