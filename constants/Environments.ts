export const AppEnv = {
  apiUrl: process.env.EXPO_PUBLIC_API || 'http://localhost:4300/api/mobile',
  name: process.env.NODE_ENV || 'development',
};
