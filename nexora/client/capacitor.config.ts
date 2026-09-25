import type { CapacitorConfig } from "@capacitor/cli";

/**
 * NEXORA Android / iOS shell (Capacitor)
 *
 * Default: bundles the local Vite build (client/dist) into the app.
 * For faster testing on a phone without rebuilding every time, uncomment
 * the server.url line below (points at your live Render frontend).
 * For Play Store / production, keep server.url commented out.
 */
const config: CapacitorConfig = {
  appId: "com.nexora.member",
  appName: "NEXORA",
  webDir: "dist",
  server: {
    androidScheme: "https",
    // Uncomment to load the live site inside the app (good for testing):
    // url: "https://nexora-referral.onrender.com",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1400,
      backgroundColor: "#07090d",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#07090d",
    },
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#07090d",
  },
};

export default config;
