import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { uploadPickedFile, uploadPickedFiles } from "@/services/uploadService";
import { PickedFile, UploadFileResult, UploadMode } from "@/types/upload";
import { useCallback, useState } from "react";

export function useUpload() {
  const [loading, setLoading] = useState(false);

  const upload = useCallback(
    async (
      file: PickedFile,
      mode: UploadMode = "single",
    ): Promise<UploadFileResult> => {
      setLoading(true);
      try {
        const result = await uploadPickedFile(file, mode);
        showToastSuccess("Tải file lên thành công");
        return result;
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Tải file lên thất bại";
        showToastError(typeof message === "string" ? message : "Tải file lên thất bại");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const uploadMany = useCallback(
    async (
      files: PickedFile[],
      mode: UploadMode = "single",
    ): Promise<UploadFileResult[]> => {
      setLoading(true);
      try {
        const results = await uploadPickedFiles(files, mode);
        showToastSuccess("Tải file lên thành công");
        return results;
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Tải file lên thất bại";
        showToastError(typeof message === "string" ? message : "Tải file lên thất bại");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { upload, uploadMany, loading };
}
