const axios = require('axios');

const DISCORD_CLIENT_ID = functions.config().discord.client_id;
const DISCORD_CLIENT_SECRET = functions.config().discord.client_secret;
const REDIRECT_URI = functions.config().discord.redirect_uri;

exports.discordCallback = (admin) => functions.https.onRequest(async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(`https://discord.com/api/oauth2/token`, new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      scope: 'identify',
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token } = tokenRes.data;

    // Get user data
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const discordUser = userRes.data;
    const user_id = discordUser.id;

    // Save to Firestore
    const userRef = admin.firestore().collection('users').doc(user_id);
    await userRef.set({
      user_id,
      provider: 'discord',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return res.status(200).send(`Discord user ${discordUser.username} authenticated.`);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Authentication failed.');
  }
});