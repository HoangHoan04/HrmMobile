import { ROUTES } from "@/constants/common/routes";
import { normalizeStringList } from "@/constants/permissions";
import { getApiErrorMessage, isNetworkError, t } from "@/features/common";
import {
  getBiometricEnabled,
  setBiometricEnabled,
} from "@/features/more/biometric";
import {
  MobileProfile,
  normalizeMobileProfile,
} from "@/features/profile/types";
import { showToastError, showToastSuccess } from "@/helper/ToastEventEmitter";
import { rootApi } from "@/services";
import { endpoints } from "@/services/api/endpoints";
import secureStorage from "@/services/storage/secureStorage";
import { useAuthStore } from "@/store/authStore";
import tokenCache from "@/utils/token";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

function extractToken(data: any): string | null {
  return data?.token || data?.accessToken || data?.Token || null;
}

function buildAuthUser(data: any, previous?: any) {
  return {
    ...(previous || {}),
    username: data?.username || data?.Username || previous?.username,
    type: data?.type || data?.Type || previous?.type,
    email: data?.email || data?.Email || previous?.email,
    fullName: data?.fullName || data?.FullName || previous?.fullName,
    avatarUrl: data?.avatarUrl || data?.AvatarUrl || previous?.avatarUrl,
    employeeId: data?.employeeId || data?.EmployeeId || previous?.employeeId,
    companyId: data?.companyId || data?.CompanyId || previous?.companyId,
    branchId: data?.branchId || data?.BranchId || previous?.branchId,
    roles: normalizeStringList(data?.roles ?? data?.Roles ?? previous?.roles),
    permissions: normalizeStringList(
      data?.permissions ?? data?.Permissions ?? previous?.permissions,
    ),
  };
}

export function useLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  useEffect(() => {
    void (async () => {
      const enabled = await getBiometricEnabled();
      const saved = await secureStorage.getUserLoginData();
      setBiometricAvailable(enabled && !!saved);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as {
            username?: string;
            password?: string;
          };
          if (parsed.username) setUsername(parsed.username);
        } catch {
          //! ignore
        }
      }
    })();
  }, []);

  const mutation = useMutation({
    mutationFn: async (creds?: { username: string; password: string }) => {
      const loginUsername = (creds?.username ?? username).trim();
      const loginPassword = creds?.password ?? password;
      const { data } = await rootApi.post(endpoints.auth.login, {
        username: loginUsername,
        password: loginPassword,
      });
      return { data, loginUsername, loginPassword };
    },
    onSuccess: async ({ data, loginUsername, loginPassword }) => {
      const token = extractToken(data);
      const refreshToken = data?.refreshToken || data?.RefreshToken;

      if (data && token && refreshToken) {
        const user = buildAuthUser(data.user || data);
        await login(token, refreshToken, user);

        await secureStorage.saveUserLoginData({
          username: loginUsername,
          password: loginPassword,
        });

        const already = await getBiometricEnabled();
        if (!already) {
          await setBiometricEnabled(true);
        }

        router.replace(ROUTES.tabs.home);
      } else {
        showToastError("Đăng nhập không thành công");
      }
    },
    onError: (error: any) => {
      console.error("[Auth] login failed", {
        status: error?.response?.status ?? null,
        baseURL: rootApi.defaults.baseURL,
        url: error?.config?.url,
        code: error?.code,
        message: error?.message,
        responseData: error?.response?.data,
      });

      const status = error?.response?.status;
      const fallbackKey =
        status === 403 ? "login.noMobileAccess" : "login.loginFailed";
      showToastError(getApiErrorMessage(error, fallbackKey));
    },
  });

  const loginWithSavedCredentials = async () => {
    const saved = await secureStorage.getUserLoginData();
    if (!saved) {
      showToastError(t("login.loginFailed"));
      return;
    }
    try {
      const parsed = JSON.parse(saved) as {
        username?: string;
        password?: string;
      };
      if (!parsed.username || !parsed.password) {
        showToastError(t("login.loginFailed"));
        return;
      }
      mutation.mutate({
        username: parsed.username,
        password: parsed.password,
      });
    } catch {
      showToastError(t("login.loginFailed"));
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    loading: mutation.isPending,
    rememberMe,
    setRememberMe,
    handleLogin: () => mutation.mutate(undefined),
    biometricAvailable,
    loginWithSavedCredentials,
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

export function useProfile(options?: { enabled?: boolean }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const skipHeavyProfile = useAuthStore((s) => s.skipHeavyProfile);
  const logout = useAuthStore((s) => s.logout);
  const enabled =
    (options?.enabled ?? true) && isAuthenticated && !skipHeavyProfile;

  const {
    data: profile = null,
    isLoading: loading,
    refetch,
  } = useQuery<MobileProfile | null>({
    queryKey: ["profile"],
    enabled,
    staleTime: 60_000,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 404) return false;
      if (isNetworkError(error)) return failureCount < 1;
      return failureCount < 2;
    },
    queryFn: async () => {
      try {
        const { data } = await rootApi.get(endpoints.auth.profile, {
          skipErrorToast: true,
        } as any);

        const normalized = normalizeMobileProfile(data);
        const currentUser = useAuthStore.getState().user;
        const nextUser = buildAuthUser(
          {
            ...data,
            employeeId: normalized?.employeeId ?? data?.employeeId,
            companyId: normalized?.companyId ?? data?.companyId,
            branchId: normalized?.branchId ?? data?.branchId,
            type: data?.type ?? currentUser?.type,
            username: data?.username ?? currentUser?.username,
            email: data?.email ?? currentUser?.email,
            fullName: normalized?.fullName ?? data?.fullName,
            avatarUrl: normalized?.avatarUrl ?? data?.avatarUrl,
          },
          currentUser,
        );

        const changed =
          JSON.stringify(nextUser.roles || []) !==
            JSON.stringify(currentUser?.roles || []) ||
          JSON.stringify(nextUser.permissions || []) !==
            JSON.stringify(currentUser?.permissions || []) ||
          nextUser.employeeId !== currentUser?.employeeId ||
          nextUser.avatarUrl !== currentUser?.avatarUrl ||
          nextUser.fullName !== currentUser?.fullName;

        if (changed) {
          await tokenCache.setUser(nextUser);
          useAuthStore.setState({ user: nextUser });
        }
        return normalized;
      } catch (error: any) {
        const status = error?.response?.status;

        if (status === 401 || status === 403 || status === 404) {
          if (useAuthStore.getState().isAuthenticated) {
            await logout();
          }
          return null;
        }

        if (isNetworkError(error)) {
          console.warn("[Mobile useProfile] Network:", error.message);
          return null;
        }

        console.warn("[Mobile useProfile] Failed:", error.message);
        throw error;
      }
    },
  });

  return { profile, loading, refetch };
}
