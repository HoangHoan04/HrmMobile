export const endpoints = {
  auth: {
    login: "/mobile/auth/login",
    me: "/mobile/auth/me",
    forgotPassword: "/mobile/auth/forgot-password",
    resetPassword: "/mobile/auth/reset-password-with-otp",
    refreshToken: "/mobile/auth/refresh",
    changePassword: "/mobile/auth/change-password",
    updateProfile: "/mobile/auth/update-profile",
  },
  timekeeping: {
    today: "/mobile/timekeeping/today",
    checkIn: "/mobile/timekeeping/check-in",
    checkOut: "/mobile/timekeeping/check-out",
    month: "/mobile/timekeeping/month",
  },
  leave: {
    create: "/mobile/leave/create",
    myList: "/mobile/leave/my-list",
    cancel: "/mobile/leave/cancel",
  },
  upload: {
    single: "/upload-file/upload-single",
    multi: "/upload-file/upload-multi",
    image: "/upload-file/upload-image",
    document: "/upload-file/upload-document",
    audio: "/upload-file/upload-audio",
    catbox: "/upload-file/upload-catbox",
    s3: "/upload-file/upload-s3",
    multiS3: "/upload-file/upload-multi-s3",
  },
};
