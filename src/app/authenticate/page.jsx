'use client'

import { Suspense } from 'react'
import Organism from '@organism'

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Organism.Authenticate />
    </Suspense>
  )
}
