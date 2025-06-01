'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import env from "../../_utilities/env"

const firebaseConfig = {
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId,
  storageBucket: env.firebase.storageBucket,
  messagingSenderId: env.firebase.messagingSenderId,
  appId: env.firebase.appId,
  measurementId: env.firebase.measurementId,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export default function AuthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      signInWithCustomToken(auth, token)
        .then(() => {
          console.log('Signed in with Twitch via Firebase')
          router.push('/')
        })
        .catch(console.error)
    }
  }, [token])

  return <p>Signing you in...</p>
}
