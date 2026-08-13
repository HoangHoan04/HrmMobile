import { getApiErrorMessage, t } from "@/features/common";
import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type CourseDto = {
  id?: string;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  status?: string | null;
};

export type EnrollmentDto = {
  id?: string;
  courseId?: string;
  courseName?: string | null;
  progressPercent?: number | null;
  status?: string | null;
};

export type TrainingResultDto = {
  id?: string;
  courseName?: string | null;
  score?: number | null;
  passed?: boolean | null;
  completedAt?: string | null;
};

export type QuizDto = {
  id?: string;
  title?: string | null;
  questionCount?: number | null;
  courseId?: string | null;
};

export function useTraining(courseId?: string | null) {
  const queryClient = useQueryClient();

  const coursesQuery = useQuery<CourseDto[]>({
    queryKey: ["more", "training", "courses"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.training.myCourses,
          {},
          { skipErrorToast: true } as any,
        );
        return Array.isArray(data) ? data : [];
      } catch (err) {
        showToastError(getApiErrorMessage(err, "phaseM.loadFailed"));
        throw err;
      }
    },
  });

  const enrollmentsQuery = useQuery<EnrollmentDto[]>({
    queryKey: ["more", "training", "enrollments"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.training.myEnrollments,
          {},
          { skipErrorToast: true } as any,
        );
        return Array.isArray(data) ? data : [];
      } catch (err) {
        showToastError(getApiErrorMessage(err, "phaseM.loadFailed"));
        throw err;
      }
    },
  });

  const resultsQuery = useQuery<TrainingResultDto[]>({
    queryKey: ["more", "training", "results"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.training.myResults,
          {},
          { skipErrorToast: true } as any,
        );
        return Array.isArray(data) ? data : [];
      } catch (err) {
        showToastError(getApiErrorMessage(err, "phaseM.loadFailed"));
        throw err;
      }
    },
  });

  const quizzesQuery = useQuery<QuizDto[]>({
    queryKey: ["more", "training", "quizzes", courseId || "none"],
    enabled: !!courseId,
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.training.quizzes,
          { courseId },
          { skipErrorToast: true } as any,
        );
        return Array.isArray(data) ? data : [];
      } catch (err) {
        showToastError(getApiErrorMessage(err, "phaseM.loadFailed"));
        throw err;
      }
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: {
      quizId: string;
      answers?: unknown;
      note?: string | null;
    }) => {
      const { data } = await rootApi.post(
        endpoints.training.submitQuiz,
        payload,
        { skipErrorToast: true } as any,
      );
      return data;
    },
    onSuccess: () => {
      showToastSuccess(t("phaseM.training.submitQuizSuccess"));
      queryClient.invalidateQueries({ queryKey: ["more", "training"] });
    },
    onError: (err) => {
      showToastError(
        getApiErrorMessage(err, "phaseM.training.submitQuizFailed"),
      );
    },
  });

  return {
    courses: coursesQuery.data ?? [],
    enrollments: enrollmentsQuery.data ?? [],
    results: resultsQuery.data ?? [],
    quizzes: quizzesQuery.data ?? [],
    loading:
      coursesQuery.isLoading ||
      enrollmentsQuery.isLoading ||
      resultsQuery.isLoading,
    refreshing:
      coursesQuery.isRefetching ||
      enrollmentsQuery.isRefetching ||
      resultsQuery.isRefetching,
    refetch: async () => {
      await Promise.all([
        coursesQuery.refetch(),
        enrollmentsQuery.refetch(),
        resultsQuery.refetch(),
        courseId ? quizzesQuery.refetch() : Promise.resolve(),
      ]);
    },
    submitQuiz: submitMutation.mutateAsync,
    submitting: submitMutation.isPending,
  };
}
