import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.impactforge.foodrelay',
  appName: 'FoodRelay AI',
  webDir: 'public',
  server: {
    // When connected via USB with `adb reverse tcp:3000 tcp:3000`, localhost:3000 forwards to MacBook Next.js
    url: process.env.CAPACITOR_LIVE_URL || 'http://localhost:3000',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#15803d',
    },
  },
};

export default config;
