import { getApiErrorMessage, useApiError } from "@/features/common";
import { showToastError } from "@/helper/ToastEventEmitter";
import { rootApi } from "@/services";
import { endpoints } from "@/services/api/endpoints";
import { PickedFile, UploadFileResult, UploadMode } from "@/types/upload";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

function resolveUploadEndpoint(mode: UploadMode): string {
  switch (mode) {
    case "image":
      return endpoints.upload.image;
    case "document":
      return endpoints.upload.document;
    case "audio":
      return endpoints.upload.audio;
    case "catbox":
      return endpoints.upload.catbox;
    case "s3":
      return endpoints.upload.s3;
    case "single":
    default:
      return endpoints.upload.single;
  }
}

type UploadPayload = {
  file: PickedFile;
  mode: UploadMode;
};

export function useUpload() {
  const { getErrorMessage } = useApiError();

  const uploadMutation = useMutation({
    mutationKey: ["upload"],
    mutationFn: async ({ file, mode }: UploadPayload) => {
      const form = new FormData();
      form.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      } as any);

      const { data } = await rootApi.post<UploadFileResult>(
        resolveUploadEndpoint(mode),
        form,
        { skipErrorToast: true } as any,
      );
      return data;
    },
    onError: (err: unknown) => {
      showToastError(getApiErrorMessage(err, "upload.failed"));
    },
  });

  const upload = useCallback(
    async (file: PickedFile, mode: UploadMode = "image") => {
      return uploadMutation.mutateAsync({ file, mode });
    },
    [uploadMutation],
  );

  return {
    upload,
    loading: uploadMutation.isPending,
    error: uploadMutation.error
      ? getErrorMessage(uploadMutation.error, "upload.failed")
      : null,
    reset: uploadMutation.reset,
  };
}
