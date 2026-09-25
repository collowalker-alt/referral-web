import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.nexora.member",
  appName: "NEXORA",
  webDir: "dist",
  server: {
    // For production the app loads the built files from webDir.
    // During local device testing you can temporarily set:
    // url: "https://your-live-nexora-url.onrender.com",
    // cleartext: true
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
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
