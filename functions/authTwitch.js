const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

exports.authTwitch = functions.https.onRequest(async (req, res) => {
  const { code, redirectUri } = req.query;

  try {
    // Step 1: Exchange code for access token
    const tokenRes = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: 'TWITCH_CLIENT_ID',
        client_secret: 'TWITCH_CLIENT_SECRET',
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      },
    });

    const accessToken = tokenRes.data.access_token;

    // Step 2: Get user info
    const userRes = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': 'TWITCH_CLIENT_ID',
      },
    });

    const twitchUser = userRes.data.data[0];
    const uid = `twitch:${twitchUser.id}`;

    // Step 3: Create Firebase custom token
    const firebaseToken = await admin.auth().createCustomToken(uid, {
      displayName: twitchUser.display_name,
      provider: 'twitch',
    });

    res.redirect(`https://your-frontend-url.com/auth/callback?token=${firebaseToken}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Twitch login failed');
  }
});
