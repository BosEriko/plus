import axios from 'axios'
import * as admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = admin.firestore()

export default async function handler(req, res) {
  const code = req.query.code

  try {
    const tokenRes = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.TWITCH_REDIRECT_URI,
      },
    })

    const { access_token } = tokenRes.data

    const userRes = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID,
      },
    })

    const twitchUser = userRes.data.data[0]

    const uid = `twitch:${twitchUser.id}`
    const customToken = await admin.auth().createCustomToken(uid, {
      displayName: twitchUser.display_name,
      profileImage: twitchUser.profile_image_url,
    })

    await db.collection('users').doc(uid).set(
      {
        twitchId: twitchUser.id,
        displayName: twitchUser.display_name,
        profileImage: twitchUser.profile_image_url,
        email: twitchUser.email || null,
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    res.redirect(`/authenticate?token=${customToken}`)
  } catch (error) {
    console.error('OAuth error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
}
