import AsyncStorage from "@react-native-async-storage/async-storage";
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
    auth: {
      noAccount: "Chưa có tài khoản? ",
      contactHr: "Liên hệ HR ngay",
      modalTitle: "Liên hệ bộ phận Nhân sự",
      modalSubtitle: "Chúng tôi sẵn sàng hỗ trợ bạn tạo tài khoản",
      modalBody:
        "Hệ thống HRDashboard không hỗ trợ tự đăng ký. Tài khoản của bạn được cấp và quản lý bởi bộ phận Nhân sự của công ty.",
      modalDeptVal: "Phòng Nhân sự",
      modalHours: "Giờ làm việc",
      modalHoursVal: "08:00 - 17:30 (Thứ 2 - Thứ 6)",
      modalClose: "Đóng",
    },
    login: {
      title: "Đăng nhập",
      username: "Tên đăng nhập / Email",
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
      successTitle: "Đổi mật khẩu thành công",
      successDesc:
        "Bạn đã đổi mật khẩu thành công. Vui lòng đăng nhập lại với mật khẩu mới.",
    },
    tabs: {
      home: "Trang Chủ",
      checkin: "Bảng công",
      leave: "Đơn từ",
      salary: "Bảng Lương",
      profile: "Cá Nhân",
    },
    notification: {
      empty: "Chưa có thông báo nào",
      checkNew: "Kiểm tra thông báo mới để không bỏ lỡ thông tin quan trọng.",
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
      successTitle: "Password Reset Successful",
      successDesc:
        "You have successfully changed your password. Please log in again with your new password.",
    },
    tabs: {
      home: "Home",
      checkin: "Worksheet",
      leave: "Leave",
      salary: "Salary",
      profile: "Profile",
    },
    notification: {
      empty: "No notifications yet",
      checkNew:
        "Check for new notifications so you don't miss important information.",
    },
  },
};

type Language = "vi" | "en";

interface LanguageState {
  language: Language;
  dynamicTranslations: any;
  setLanguage: (language: Language) => void;
  initLanguage: () => Promise<void>;
  t: (path: string) => string;
}

const deepMerge = (target: any, source: any) => {
  if (typeof target !== "object" || target === null) return source;
  if (typeof source !== "object" || source === null) return target;

  const output = Object.assign({}, target);
  Object.keys(source).forEach((key) => {
    if (typeof source[key] === "object" && source[key] !== null) {
      if (!(key in target)) Object.assign(output, { [key]: source[key] });
      else output[key] = deepMerge(target[key], source[key]);
    } else {
      Object.assign(output, { [key]: source[key] });
    }
  });
  return output;
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: "vi",
  dynamicTranslations: null,

  setLanguage: async (language: Language) => {
    await AsyncStorage.setItem("appLanguage", language);
    set({ language });
  },

  initLanguage: async () => {
    try {
      const savedLang = await AsyncStorage.getItem("appLanguage");
      if (savedLang === "vi" || savedLang === "en") {
        set({ language: savedLang });
      }

      const cachedTranslations = await AsyncStorage.getItem("appTranslations");
      if (cachedTranslations) {
        set({ dynamicTranslations: JSON.parse(cachedTranslations) });
      }
    } catch (e) {
      //! Handle error if needed
    }
  },

  t: (path: string) => {
    const { language, dynamicTranslations } = get();
    const keys = path.split(".");

    let current: any =
      dynamicTranslations && dynamicTranslations[language]
        ? deepMerge(translations[language], dynamicTranslations[language])
        : translations[language];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        return path;
      }
    }
    return typeof current === "string" ? current : path;
  },
}));
