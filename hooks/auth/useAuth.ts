import { ROUTES } from "@/constants/common/routes";
import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { endpoints } from "@/services/endpoint";
import { rootApi } from "@/services/rootApi";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
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
    try {
      const { data } = await rootApi.post(endpoints.auth.login, {
        username,
        password,
      });
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
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Đã xảy ra lỗi khi đăng nhập";
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
