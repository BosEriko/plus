'use client'

import { Suspense } from 'react'
import AuthHandler from './_client/AuthHandler'

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AuthHandler />
    </Suspense>
  )
}
