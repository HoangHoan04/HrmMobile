import { ROUTES } from "@/constants/common/routes";
import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { endpoints } from "@/services/endpoint";
import { rootApi } from "@/services/rootApi";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

function extractToken(data: any): string | null {
  return data?.token || data?.accessToken || data?.Token || null;
}

export function useLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) return;
    setLoading(true);
    const loginUsername = username.trim();
    try {
      console.log("[Auth] login start", {
        username: loginUsername,
        endpoint: endpoints.auth.login,
        baseURL: rootApi.defaults.baseURL,
      });

      const { data } = await rootApi.post(endpoints.auth.login, {
        username: loginUsername,
        password,
      });
      const token = extractToken(data);
      const refreshToken = data?.refreshToken || data?.RefreshToken;
      console.log("[Auth] login response", {
        hasToken: !!token,
        hasRefresh: !!refreshToken,
        type: data?.type ?? data?.Type,
        employeeId: data?.employeeId ?? data?.EmployeeId ?? null,
        mustChangePassword:
          data?.mustChangePassword ?? data?.MustChangePassword,
      });

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
        console.warn("[Auth] login missing token/refresh", data);
        showToastError("Đăng nhập không thành công");
      }
    } catch (error: any) {
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
        username: loginUsername,
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
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    loading,
    rememberMe,
    setRememberMe,
    handleLogin,
  };
}

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSendEmail = async () => {
    if (!email) {
      showToastError("Vui lòng nhập email");
      return;
    }
    setLoading(true);
    try {
      await rootApi.post(endpoints.auth.forgotPassword, { email });
      setSent(true);
      showToastSuccess("Mã OTP đã được gửi đến email");
    } catch (error: any) {
      showToastError(
        error.response?.data?.message || "Không thể gửi email khôi phục",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (onSuccess?: () => void) => {
    if (!otp || !newPassword) {
      showToastError("Vui lòng nhập OTP và mật khẩu mới");
      return;
    }
    setLoading(true);
    try {
      await rootApi.post(endpoints.auth.resetPassword, {
        email,
        otp,
        newPassword: newPassword,
      });
      showToastSuccess("Mật khẩu đã được đặt lại thành công");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(ROUTES.auth.login);
      }
    } catch (error: any) {
      showToastError(
        error.response?.data?.message || "Không thể đặt lại mật khẩu",
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    sent,
    otp,
    setOtp,
    newPassword,
    setNewPassword,
    loading,
    handleSendEmail,
    handleResetPassword,
  };
}

export function useProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`[Mobile useProfile] GET ${endpoints.auth.me}`);
      const { data } = await rootApi.get(endpoints.auth.me, {
        skipErrorToast: true,
      } as any);
      setProfile(data);

      const employeeId = data?.employeeId || data?.EmployeeId;
      if (employeeId) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.employeeId !== employeeId) {
          const nextUser = { ...currentUser, employeeId };
          await SecureStore.setItemAsync(
            "USER_PROFILE",
            JSON.stringify(nextUser),
          );
          useAuthStore.setState({ user: nextUser });
        }
      }
    } catch (error: any) {
      console.error(
        "[Mobile useProfile] Failed to fetch profile:",
        error.message,
      );
      if (error.response?.status === 401) {
        await logout();
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, refetch: fetchProfile };
}
