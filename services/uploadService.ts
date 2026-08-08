import { endpoints } from "./endpoint";
import { rootApi } from "./rootApi";
import { PickedFile, UploadFileResult, UploadMode } from "@/types/upload";

const endpointByMode: Record<UploadMode, string> = {
  single: endpoints.upload.single,
  image: endpoints.upload.image,
  document: endpoints.upload.document,
  audio: endpoints.upload.audio,
  catbox: endpoints.upload.catbox,
  s3: endpoints.upload.s3,
};

export async function uploadPickedFile(
  file: PickedFile,
  mode: UploadMode = "single",
): Promise<UploadFileResult> {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as any);

  const { data } = await rootApi.post<UploadFileResult>(
    endpointByMode[mode],
    formData,
    {
      timeout: 120000,
      skipErrorToast: true,
    } as any,
  );

  return data;
}

export async function uploadPickedFiles(
  files: PickedFile[],
  mode: UploadMode = "single",
): Promise<UploadFileResult[]> {
  if (files.length === 1) {
    return [await uploadPickedFile(files[0], mode)];
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
    } as any);
  });

  const endpoint =
    mode === "s3" ? endpoints.upload.multiS3 : endpoints.upload.multi;

  const { data } = await rootApi.post<UploadFileResult[]>(endpoint, formData, {
    timeout: 120000,
    skipErrorToast: true,
  } as any);

  return data;
}
