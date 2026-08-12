import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.EXPO_PUBLIC_APP_NAME || 'hrm-mobile',
  slug: 'hrm-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/assets/images/icon.png',
  scheme: 'hrmmobile',
  userInterfaceStyle: 'light',
  androidStatusBar: {
    barStyle: 'dark-content',
    backgroundColor: '#ffffff',
    translucent: true,
  },
  newArchEnabled: true,
  splash: {
    image: './src/assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: process.env.EXPO_PUBLIC_BUNDLE_ID || 'com.hrm.mobile',
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
      NSLocationWhenInUseUsageDescription:
        'Cho phép HRM Mobile truy cập vị trí để chấm công GPS tại chi nhánh.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: process.env.EXPO_PUBLIC_BUNDLE_ID || 'com.hrm.mobile',
    // @ts-ignore
    usesCleartextTraffic: true,
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'INTERNET',
      'ACCESS_NETWORK_STATE',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './src/assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Cho phép HRM Mobile truy cập vị trí để chấm công GPS tại chi nhánh.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Cho phép truy cập thư viện ảnh để tải avatar và tài liệu lên.',
        cameraPermission: 'Cho phép truy cập camera để chụp ảnh tải lên.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
