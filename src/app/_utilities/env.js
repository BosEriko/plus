// Note: Declared ENV variables must start with "NEXT_PUBLIC_" to work in the browser
// More Information: https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#bundling-environment-variables-for-the-browser
const env = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME,
  twitchClientId: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID
  },
}

export default env;
