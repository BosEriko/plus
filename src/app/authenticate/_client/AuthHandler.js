'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithCustomToken } from 'firebase/auth'
import { auth } from "../../_utilities/firebase";

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
