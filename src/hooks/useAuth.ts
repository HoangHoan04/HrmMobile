import { ROUTES } from "@/constants/common/routes";
import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { rootApi } from "@/services";
import { endpoints } from "@/services/api/endpoints";
import { useAuthStore } from "@/store/authStore";
import tokenCache from "@/utils/token";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";

function extractToken(data: any): string | null {
  return data?.token || data?.accessToken || data?.Token || null;
}

export function useLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const loginUsername = username.trim();
      const { data } = await rootApi.post(endpoints.auth.login, {
        username: loginUsername,
        password,
      });
      return data;
    },
    onSuccess: async (data) => {
      const token = extractToken(data);
      const refreshToken = data?.refreshToken || data?.RefreshToken;

      if (data && token && refreshToken) {
        const user = data.user || {
          username: data.username || data.Username,
          type: data.type || data.Type,
          employeeId: data.employeeId || data.EmployeeId,
          companyId: data.companyId || data.CompanyId,
          branchId: data.branchId || data.BranchId,
        };
        await login(token, refreshToken, user);
        router.replace(ROUTES.tabs.home);
      } else {
        showToastError("Đăng nhập không thành công");
      }
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const data = error?.response?.data;
      let errorMsg =
        (typeof data === "string" && data) ||
        data?.message ||
        data?.title ||
        error?.message ||
        "Đã xảy ra lỗi khi đăng nhập";

      if (!error?.response) {
        errorMsg =
          "Không kết nối được API. Kiểm tra API đang chạy (port 5036) và IP LAN. Thử: npx expo start -c";
      } else if (status >= 500) {
        errorMsg = "Máy chủ đang lỗi. Vui lòng thử lại sau.";
      }

      console.error("[Auth] login failed", {
        status: status ?? null,
        baseURL: rootApi.defaults.baseURL,
        url: error?.config?.url,
        code: error?.code,
        message: error?.message,
        responseData: data,
      });

      showToastError(
        typeof errorMsg === "string" ? errorMsg : "Đã xảy ra lỗi khi đăng nhập",
      );
    },
  });

  return {
    username,
    setUsername,
    password,
    setPassword,
    loading: mutation.isPending,
    rememberMe,
    setRememberMe,
    handleLogin: mutation.mutate,
  };
}

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const router = useRouter();

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      if (!email) throw new Error("Vui lòng nhập email");
      return rootApi.post(endpoints.auth.forgotPassword, { email });
    },
    onSuccess: () => {
      setSent(true);
      showToastSuccess("Mã OTP đã được gửi đến email");
    },
    onError: (error: any) => {
      showToastError(
        error?.message === "Vui lòng nhập email"
          ? error.message
          : error.response?.data?.message || "Không thể gửi email khôi phục",
      );
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (onSuccess?: () => void) => {
      if (!otp || !newPassword)
        throw new Error("Vui lòng nhập OTP và mật khẩu mới");
      await rootApi.post(endpoints.auth.resetPassword, {
        email,
        otp,
        newPassword,
      });
      return onSuccess;
    },
    onSuccess: (onSuccess) => {
      showToastSuccess("Mật khẩu đã được đặt lại thành công");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(ROUTES.auth.login);
      }
    },
    onError: (error: any) => {
      showToastError(
        error?.message === "Vui lòng nhập OTP và mật khẩu mới"
          ? error.message
          : error.response?.data?.message || "Không thể đặt lại mật khẩu",
      );
    },
  });

  return {
    email,
    setEmail,
    sent,
    otp,
    setOtp,
    newPassword,
    setNewPassword,
    loading: sendEmailMutation.isPending || resetPasswordMutation.isPending,
    handleSendEmail: sendEmailMutation.mutate,
    handleResetPassword: (onSuccess?: () => void) =>
      resetPasswordMutation.mutate(onSuccess),
  };
}

export function useProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const {
    data: profile = null,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["profile"],
    enabled: isAuthenticated,
    queryFn: async () => {
      try {
        const { data } = await rootApi.get(endpoints.auth.me, {
          skipErrorToast: true,
        } as any);

        const employeeId = data?.employeeId || data?.EmployeeId;
        if (employeeId) {
          const currentUser = useAuthStore.getState().user;
          if (currentUser?.employeeId !== employeeId) {
            const nextUser = { ...currentUser, employeeId };
            await tokenCache.setUser(nextUser);
            useAuthStore.setState({ user: nextUser });
          }
        }
        console.log("[Mobile useProfile] Fetched profile:", data);
        return data;
      } catch (error: any) {
        console.error("[Mobile useProfile] Failed:", error.message);
        if (error.response?.status === 401) {
          await logout();
        }
        throw error;
      }
    },
  });

  return { profile, loading, refetch };
}
