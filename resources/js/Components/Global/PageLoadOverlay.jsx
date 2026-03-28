import React, { useEffect, useRef, useState } from 'react'
import { RingLoader } from 'react-spinners'

const PRIMARY = '#1976d2'
const SHOW_DELAY_MS = 140

export default function PageLoadOverlay() {
  const [visible, setVisible] = useState(false)
  const showTimerRef = useRef(null)

  useEffect(() => {
    const clearShowTimer = () => {
      if (showTimerRef.current != null) {
        clearTimeout(showTimerRef.current)
        showTimerRef.current = null
      }
    }

    const onStart = () => {
      clearShowTimer()
      showTimerRef.current = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    }

    const onFinish = () => {
      clearShowTimer()
      setVisible(false)
    }

    document.addEventListener('inertia:start', onStart)
    document.addEventListener('inertia:finish', onFinish)

    return () => {
      clearShowTimer()
      document.removeEventListener('inertia:start', onStart)
      document.removeEventListener('inertia:finish', onFinish)
    }
  }, [])

  if (!visible) {
    return null
  }

  return (
    <div
      className="page-load-overlay fixed inset-0 z-[10050] flex flex-col items-center justify-center gap-4 bg-white/75 backdrop-blur-md"
      role="progressbar"
      aria-label="Loading page"
      aria-busy="true"
    >
      <RingLoader color={PRIMARY} size={52} speedMultiplier={0.9} />
      <span className="text-sm font-medium tracking-wide text-slate-500">Loading</span>
    </div>
  )
}
