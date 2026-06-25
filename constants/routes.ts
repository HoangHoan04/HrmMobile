export const ROUTES = {
  auth: {
    login: "/(auth)/login" as const,
    forgotPassword: "/(auth)/forgot-password" as const,
  },
  tabs: {
    home: "/(tabs)" as const,
  },
};
