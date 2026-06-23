import { useContext } from 'react'
import { PollarContext } from './PollarProvider'
import type { PollarContextValue } from './types'

export function usePollar(): PollarContextValue {
  const ctx = useContext(PollarContext)
  if (!ctx) {
    throw new Error('usePollar must be used inside <PollarProvider>')
  }
  return ctx
}
