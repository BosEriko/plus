exports.authDiscord = functions.https.onRequest(async (req, res) => {
  const { code, redirectUri } = req.query;

  try {
    // Step 1: Exchange code for token
    const tokenRes = await axios.post('https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: 'DISCORD_CLIENT_ID',
        client_secret: 'DISCORD_CLIENT_SECRET',
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const accessToken = tokenRes.data.access_token;

    // Step 2: Get user info
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const discordUser = userRes.data;
    const uid = `discord:${discordUser.id}`;

    // Step 3: Create Firebase custom token
    const firebaseToken = await admin.auth().createCustomToken(uid, {
      displayName: `${discordUser.username}#${discordUser.discriminator}`,
      provider: 'discord',
    });

    res.redirect(`https://your-frontend-url.com/auth/callback?token=${firebaseToken}`);
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).send('Discord login failed');
  }
});
