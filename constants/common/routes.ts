export const ROUTES = {
  auth: {
    login: "/(auth)/login" as const,
    forgotPassword: "/(auth)/forgot-password" as const,
    onboarding: "/(auth)/onboarding" as const,
    welcome: "/(auth)/welcome" as const,
  },
  tabs: {
    home: "/(tabs)" as const,
  },
};
