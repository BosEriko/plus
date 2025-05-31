const axios = require('axios');

const TWITCH_CLIENT_ID = functions.config().twitch.client_id;
const TWITCH_CLIENT_SECRET = functions.config().twitch.client_secret;
const REDIRECT_URI = functions.config().twitch.redirect_uri;

exports.twitchCallback = (admin) => functions.https.onRequest(async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(`https://id.twitch.tv/oauth2/token`, null, {
      params: {
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      },
    });

    const { access_token } = tokenRes.data;

    // Get user data
    const userRes = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Client-Id': TWITCH_CLIENT_ID,
      },
    });

    const twitchUser = userRes.data.data[0];
    const twitch_id = twitchUser.id;

    // Save to Firestore
    const userRef = admin.firestore().collection('users').doc(twitch_id);
    await userRef.set({
      twitch_id,
      provider: 'twitch',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return res.status(200).send(`Twitch user ${twitchUser.display_name} authenticated.`);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Authentication failed.');
  }
});