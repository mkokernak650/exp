import { useEffect } from 'react'

const INITIAL_LOADER_ID = 'initial-app-loader'

export default function DismissInitialLoader() {
  useEffect(() => {
    document.getElementById(INITIAL_LOADER_ID)?.remove()
  }, [])
  return null
}
