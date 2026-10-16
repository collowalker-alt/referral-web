# NEXORA background push notifications

This update adds browser Web Push for members and administrators. Browser push is opt-in on each device; it can show while the NEXORA page is closed after the device/browser has accepted a subscription. It is not SMS or WhatsApp.

## Required Render environment variables

Add the following to the NEXORA backend service in Render:

- `VAPID_PUBLIC_KEY` — Web Push application server public key
- `VAPID_PRIVATE_KEY` — matching private key; keep it secret
- `VAPID_SUBJECT` — contact URI such as `mailto:you@yourdomain.com` using an email address you control

Generate a key pair locally after installing server dependencies. Run the command from the `server` directory:

```bash
cd server
node -e "console.log(require('web-push').generateVAPIDKeys())"
```

Copy the returned public key and private key into Render environment variables. Never commit the private key or send it in chat. Redeploy the backend after setting variables. The public key is returned by `/api/push/public-key`; the private key stays server-side.

## Database migration

This update adds a `PushSubscription` table with optional User/Admin ownership. Back up the database first, ensure the existing Neon database is reachable, then run from the project root:

```bash
npm run db:push
```

Review Prisma output; do not use destructive resets. Deploy the backend and frontend after the schema is applied.

## Enabling notifications

- Members: open **Notifications** in NEXORA and choose **Enable phone alerts**.
- Admins: sign in to the admin console and select **Enable phone alerts** near the notification bell.
- Grant browser notification permission when prompted. A device must support Service Workers, Push API and Notifications.
- For iOS, web push generally requires the website to be added to the Home Screen and opened as a web app on a supported iOS/iPadOS version.

## User updates and greetings

In Admin → **Announcements**, create a title and message and check **Also send this update as an in-app notification and phone push**. This creates an in-app notification for active members and sends push to their subscribed devices. Use this for important updates or occasional greetings. It sends once and is not a recurring schedule. Only SUPER_ADMIN and ADMIN can broadcast.

## What gets pushed

- Existing important user notifications created by the backend (payments, project updates, Connect orders, wallet changes, support replies, etc.) go to that user's opted-in devices.
- Existing admin attention notifications go to the relevant administrators' opted-in devices.
- Expired subscriptions (HTTP 404/410) are removed automatically.
- Announcement broadcasts notify all active members in-app and push only to devices that opted in.

## Important limitations

- Push requires public HTTPS frontend hosting and a VAPID-configured backend.
- Users/admins must opt in on every device/browser. Notification permission can be denied in browser settings.
- Push is best-effort; it cannot guarantee delivery if a device is offline for a long period, the browser disables background activity, or a push provider rejects a subscription.
- This does not send SMS or WhatsApp messages.
