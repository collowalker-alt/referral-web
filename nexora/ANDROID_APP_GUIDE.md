# NEXORA — Android App (Capacitor)

This turns your existing NEXORA web app into a real Android app you can install and later publish on Google Play.  
iOS uses the same project — steps at the bottom.

---

## What you get

| Item | Result |
|------|--------|
| Package ID | `com.nexora.member` |
| App name | NEXORA |
| Shell | Capacitor 6 (WebView + native plugins) |
| Source | Your current Vite React build (`client/dist`) |
| Output | APK (testing) or AAB (Play Store) |

You do **not** rewrite the UI. The same site becomes the app.

---

## Requirements (Android)

1. **Node.js 18+**
2. **Android Studio** (latest stable) — https://developer.android.com/studio  
3. During Android Studio setup, install:
   - Android SDK
   - Android SDK Platform 34 (or latest)
   - Android SDK Build-Tools
   - Android Emulator (optional)
4. **JDK 17** (Android Studio usually bundles one)

---

## One-time setup

```bash
cd client
npm install

# Build the web app into dist/
npm run build

# Add the Android native project (creates client/android/)
npx cap add android

# Copy web build into Android + register plugins
npx cap sync android
```

Open in Android Studio:

```bash
npx cap open android
```

Or:

```bash
npm run cap:android
```

---

## Run on a phone / emulator

### Emulator
1. In Android Studio: **Device Manager** → create a virtual device  
2. Click **Run** (green play)

### Physical phone
1. Enable **Developer options** + **USB debugging** on the phone  
2. Connect USB  
3. Select the device in Android Studio → **Run**

### Installable APK (share with testers)
In Android Studio:

**Build → Build Bundle(s) / APK(s) → Build APK(s)**

APK path (typical):

```
client/android/app/build/outputs/apk/debug/app-debug.apk
```

Transfer that file to a phone and install (allow “Install from unknown sources” if needed).

---

## Production build (Google Play)

1. Create a keystore (once):

```bash
keytool -genkey -v -keystore nexora-release.keystore -alias nexora -keyalg RSA -keysize 2048 -validity 10000
```

2. In Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**  
3. Upload the **.aab** to Google Play Console  

Play Console: https://play.google.com/console

---

## After every web change

Whenever you change the React/UI code:

```bash
cd client
npm run build
npx cap sync android
```

Then run again from Android Studio.

Shortcut:

```bash
npm run cap:android
```

---

## API URL in the app

Your app must call your **live API**, not `localhost`.

In production builds, `VITE_API_URL` should already point to your Render API, e.g.:

```
VITE_API_URL=https://nexora-api-shxf.onrender.com/api
```

Set this in the environment **before** `npm run build` if needed.

---

## Optional: load live site inside the app (no rebuild each time)

For quick testing only, in `capacitor.config.ts`:

```ts
server: {
  url: "https://your-nexora-frontend.onrender.com",
  cleartext: true,
}
```

Then `npx cap sync android`.  
Remove this for production store builds (use the offline `dist` bundle instead).

---

## iOS (later)

You need:

- A **Mac**
- **Xcode** (from App Store)
- **Apple Developer account** ($99/year) to publish

```bash
cd client
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

Then archive and upload via Xcode → App Store Connect.

Same Capacitor project works for both platforms.

---

## Plugins already configured

| Plugin | Use |
|--------|-----|
| Splash Screen | Dark NEXORA launch screen |
| Status Bar | Dark status bar |
| App | Back-button / app state |
| Haptics | Native vibration on supported devices |

---

## Checklist before Play Store

- [ ] App icon 512×512 (replace default Capacitor icon in `android/app/src/main/res/`)
- [ ] Splash looks correct
- [ ] Login / Paybill / wallet work on a real phone
- [ ] API uses HTTPS production URL
- [ ] Privacy policy URL ready
- [ ] Signed **AAB** (not only debug APK)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| White screen | Run `npm run build` then `npx cap sync` again |
| API fails on phone | Check `VITE_API_URL` is public HTTPS, not localhost |
| `cap` not found | `cd client && npm install` |
| SDK missing | Open Android Studio → SDK Manager → install Platform 34 |

---

## Summary

1. `cd client && npm install`  
2. `npx cap add android`  
3. `npm run cap:android`  
4. Run or build APK from Android Studio  

That is your Android app. iOS is the same flow with Xcode when you are ready.
