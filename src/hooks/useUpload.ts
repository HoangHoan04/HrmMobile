import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { uploadPickedFile, uploadPickedFiles } from "@/services/api/uploadService";
import { PickedFile, UploadFileResult, UploadMode } from "@/types/upload";
import { useMutation } from "@tanstack/react-query";

// ─── useUpload ────────────────────────────────────────────
export function useUpload() {
  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      mode = "single",
    }: {
      file: PickedFile;
      mode?: UploadMode;
    }): Promise<UploadFileResult> => {
      return uploadPickedFile(file, mode);
    },
    onSuccess: () => {
      showToastSuccess("Tải file lên thành công");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Tải file lên thất bại";
      showToastError(typeof message === "string" ? message : "Tải file lên thất bại");
    },
  });

  const uploadManyMutation = useMutation({
    mutationFn: async ({
      files,
      mode = "single",
    }: {
      files: PickedFile[];
      mode?: UploadMode;
    }): Promise<UploadFileResult[]> => {
      return uploadPickedFiles(files, mode);
    },
    onSuccess: () => {
      showToastSuccess("Tải file lên thành công");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Tải file lên thất bại";
      showToastError(typeof message === "string" ? message : "Tải file lên thất bại");
    },
  });

  return {
    upload: (file: PickedFile, mode?: UploadMode) =>
      uploadMutation.mutateAsync({ file, mode }),
    uploadMany: (files: PickedFile[], mode?: UploadMode) =>
      uploadManyMutation.mutateAsync({ files, mode }),
    loading: uploadMutation.isPending || uploadManyMutation.isPending,
  };
}
