// Note: Declared ENV variables must start with "NEXT_PUBLIC_" to work in the browser
// More Information: https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#bundling-environment-variables-for-the-browser
const env = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME,
  twitchClientId: process.env.NEXT_PUBLIC_TWITCH_APP_CLIENT_ID,
  discordClientId: process.env.NEXT_PUBLIC_DISCORD_APP_CLIENT_ID,
  twitchRedirectUrl: process.env.NEXT_PUBLIC_TWITCH_APP_REDIRECT_URL,
  discordRedirectUrl: process.env.NEXT_PUBLIC_DISCORD_APP_REDIRECT_URL,
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  },
}

export default env;