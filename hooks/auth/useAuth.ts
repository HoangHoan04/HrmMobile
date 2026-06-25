import { endpoints } from "@/services/endpoint";
import { rootApi } from "@/services/rootApi";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { ROUTES } from "@/constants/routes";

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
      if (data && data.accessToken) {
        await login(data.accessToken, data.refreshToken, data.user);
        router.replace(ROUTES.tabs.home);
      } else {
        showToastError("Đăng nhập không thành công");
      }
    } catch (error: any) {
      console.log("=== LOGIN ERROR ===", error.message, error.response?.data);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Đã xảy ra lỗi khi đăng nhập";
      showToastError(errorMsg);
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

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      showToastError("Vui lòng nhập OTP và mật khẩu mới");
      return;
    }
    setLoading(true);
    try {
      await rootApi.post(endpoints.auth.resetPassword, {
        email,
        otp,
        password: newPassword,
      });
      showToastSuccess("Mật khẩu đã được đặt lại thành công");
      router.push(ROUTES.auth.login);
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

