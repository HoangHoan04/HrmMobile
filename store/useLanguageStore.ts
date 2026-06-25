import { create } from "zustand";

export const translations = {
  vi: {
    common: {
      success: "Thành công",
      error: "Lỗi",
      cancel: "Hủy",
      processing: "Đang xử lý...",
      continue: "Tiếp tục",
      back: "Quay lại",
    },
    login: {
      title: "Đăng nhập",
      username: "Tên đăng nhập",
      password: "Mật khẩu",
      rememberMe: "Ghi nhớ đăng nhập",
      forgotPassword: "Quên mật khẩu?",
      loginFailed: "Đăng nhập không thành công",
    },
    forgotPassword: {
      title: "Quên Mật Khẩu",
      email: "Email",
      enterEmail: "Nhập email của bạn",
      sendRequest: "Gửi Yêu Cầu",
      backToLogin: "Quay lại Đăng Nhập",
      otp: "Mã OTP",
      enterOtp: "Nhập mã OTP 6 số",
      newPassword: "Mật khẩu mới",
      enterNewPassword: "Nhập mật khẩu mới",
      resetPassword: "Đặt lại mật khẩu",
      stepEmail: "Email",
      stepOtp: "Mã OTP",
      stepPassword: "Mật khẩu",
      emailSent: "Email khôi phục mật khẩu đã được gửi đến",
      criteriaLength: "Đủ từ 6 ký tự",
      criteriaUppercase: "Chứa chữ viết hoa",
      criteriaLowercase: "Chứa chữ viết thường",
      criteriaNumber: "Chứa chữ số",
      criteriaSpecial: "Chứa ký tự đặc biệt",
    },
    tabs: {
      home: "Trang Chủ",
      checkin: "Chấm Công",
      leave: "Đơn Từ",
      notification: "Thông Báo",
      profile: "Cá Nhân",
    },
  },
  en: {
    common: {
      success: "Success",
      error: "Error",
      cancel: "Cancel",
      processing: "Processing...",
      continue: "Continue",
      back: "Back",
    },
    login: {
      title: "Login",
      username: "Username",
      password: "Password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot Password?",
      loginFailed: "Login failed",
    },
    forgotPassword: {
      title: "Forgot Password",
      email: "Email",
      enterEmail: "Enter your email",
      sendRequest: "Send Request",
      backToLogin: "Back to Login",
      otp: "OTP Code",
      enterOtp: "Enter 6-digit OTP",
      newPassword: "New Password",
      enterNewPassword: "Enter new password",
      resetPassword: "Reset Password",
      stepEmail: "Email",
      stepOtp: "OTP",
      stepPassword: "Password",
      emailSent: "A recovery email has been sent to",
      criteriaLength: "At least 6 characters",
      criteriaUppercase: "Contains uppercase letter",
      criteriaLowercase: "Contains lowercase letter",
      criteriaNumber: "Contains a number",
      criteriaSpecial: "Contains a special character",
    },
    tabs: {
      home: "Home",
      checkin: "Check-in",
      leave: "Leave",
      notification: "Notifications",
      profile: "Profile",
    },
  },
};

type Language = "vi" | "en";

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (path: string) => string;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: "vi",
  setLanguage: (language: Language) => set({ language }),
  t: (path: string) => {
    const lang = get().language;
    const keys = path.split(".");
    let current: any = translations[lang];
    
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        return path; // Fallback to path string if not found
      }
    }
    return typeof current === "string" ? current : path;
  },
}));
