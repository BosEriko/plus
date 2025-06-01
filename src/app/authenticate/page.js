import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const AuthHandler = dynamic(() => import('./_client/AuthHandler'), { ssr: false })

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AuthHandler />
    </Suspense>
  )
}
