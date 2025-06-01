'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import env from "../_utilities/env";

const firebaseConfig = {
    apiKey: env.firebase.apiKey,
    authDomain: env.firebase.authDomain,
    projectId: env.firebase.projectId,
    storageBucket: env.firebase.storageBucket,
    messagingSenderId: env.firebase.messagingSenderId,
    appId: env.firebase.appId,
    measurementId: env.firebase.measurementId
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export default function AuthSuccessPage() {
  const router = useRouter()
  const { token } = router.query

  useEffect(() => {
    if (token && typeof token === 'string') {
      signInWithCustomToken(auth, token).then(() => {
        console.log('Signed in with Twitch via Firebase')
        console.log(auth);
        console.log(token);
      }).catch(console.error)
    }
  }, [token])

  return <p>Signing you in...</p>
}
