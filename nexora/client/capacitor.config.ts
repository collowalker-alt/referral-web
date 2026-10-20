import type { CapacitorConfig } from "@capacitor/cli";

/**
 * NEXORA Android / iOS shell (Capacitor)
 *
 * The Android app loads the live NEXORA website so deployed frontend updates
 * become available in the installed app without reinstalling the APK.
 * Native Android changes (plugins, permissions, icon) still require a rebuild.
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
      launchShowDuration: 1400,
      backgroundColor: "#ffffff",
      showSpinner: false,
      androidScaleType: "CENTER_INSIDE",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#ffffff",
    },
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#ffffff",
  },
};

export default config;
