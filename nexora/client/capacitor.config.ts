import type { CapacitorConfig } from "@capacitor/cli";

/**
 * NEXORA Android / iOS shell (Capacitor)
 *
 * The Android app loads the live NEXORA website so deployed frontend updates
 * become available in the installed app without reinstalling the APK.
 * Native Android changes (plugins, permissions, icon and launch screen) require a rebuild.
 */
const config: CapacitorConfig = {
  appId: "com.nexora.member",
  appName: "NEXORA",
  webDir: "dist",
  server: {
    androidScheme: "https",
    url: "https://nexora-referral.onrender.com",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      // Keep the native branded launch screen visible until the React hand-off is ready.
      launchAutoHide: false,
      backgroundColor: "#07090D",
      showSpinner: false,
      androidScaleType: "CENTER",
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#07090D",
    },
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#07090D",
  },
};

export default config;
