# Build the NEXORA Android APK (Windows)

Your NEXORA app is a **web app** wrapped with **Capacitor**.  
This computer environment cannot compile a signed Android binary (no Android SDK).  
Build the APK on **your PC** with Android Studio — about 15–25 minutes the first time.

---

## Fastest path (recommended)

### 1. Install tools (once)
1. **Node.js 20 LTS** — https://nodejs.org  
2. **Android Studio** — https://developer.android.com/studio  
   During setup, install:
   - Android SDK  
   - Android SDK Platform 34  
   - Android SDK Build-Tools  
   - Android Emulator (optional)

### 2. Open the project
Unzip this NEXORA folder, then in **PowerShell** or **Terminal**:

```bash
cd path\to\NEXORA\client
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Android Studio opens the `android` project.

### 3. Build a debug APK (for testing on your phone)
In Android Studio:

**Build → Build Bundle(s) / APK(s) → Build APK(s)**

When it finishes, click **locate**, or go to:

```
client\android\app\build\outputs\apk\debug\app-debug.apk
```

Copy `app-debug.apk` to your phone and install it  
(enable **Install unknown apps** for your file manager if asked).

### 4. After any website/UI change
```bash
cd client
npm run build
npx cap sync android
```
Then build the APK again in Android Studio.

Shortcut:

```bash
npm run cap:android
```

---

## Package details
| Setting | Value |
|---------|--------|
| App name | NEXORA |
| Application ID | `com.nexora.member` |
| API (already in code) | `https://nexora-api-shxf.onrender.com/api` |
| Frontend (live) | `https://nexora-referral.onrender.com` |

---

## Optional: app always loads the live website
Good for testing so you don’t rebuild after every small change.

Edit `client/capacitor.config.ts` and set:

```ts
server: {
  androidScheme: "https",
  url: "https://nexora-referral.onrender.com",
},
```

Then:

```bash
npx cap sync android
```

Rebuild the APK.  
For **Play Store**, remove `url` so the app uses the offline `dist` build.

---

## Play Store (later)
1. Create a keystore (once):
```bash
keytool -genkey -v -keystore nexora-release.keystore -alias nexora -keyalg RSA -keysize 2048 -validity 10000
```
2. Android Studio → **Build → Generate Signed Bundle / APK → Android App Bundle**  
3. Upload the **.aab** to https://play.google.com/console  

---

## Alternative without Android Studio
1. Open https://www.pwabuilder.com  
2. Enter `https://nexora-referral.onrender.com`  
3. Generate a package → download Android options  

That creates a TWA/PWA package; quality depends on your PWA manifest/icons.

---

## Checklist before sharing the APK
- [ ] Login works on phone data (not only Wi‑Fi)  
- [ ] Paybill / wallet calls the live API  
- [ ] App icon looks correct  
- [ ] Splash screen is dark NEXORA style  
- [ ] Never share release keystore passwords  

---

**Bottom line:** Run the commands in section 2 on your PC, then **Build APK** in Android Studio.  
The file you install is `app-debug.apk`.
