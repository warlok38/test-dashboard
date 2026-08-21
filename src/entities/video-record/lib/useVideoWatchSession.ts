'use client'

import { useEffect } from 'react'

import {
  useKeepVideoWatchSessionMutation,
  useStopVideoWatchSessionMutation
} from '../api/videoRecordApi'
import type { VideoRecordStreamResponse } from '../model/types'

type UseVideoWatchSessionOptions = {
  enabled?: boolean
  sessionId?: string
  stream?: VideoRecordStreamResponse
}

const pendingStopTimers = new Map<string, number>()

export function useVideoWatchSession({
  enabled = true,
  sessionId,
  stream
}: UseVideoWatchSessionOptions) {
  const [keepVideoWatchSession] = useKeepVideoWatchSessionMutation()
  const [stopVideoWatchSession] = useStopVideoWatchSessionMutation()
  const keepAliveSeconds = stream?.keep_alive_seconds

  useEffect(() => {
    if (!enabled || !sessionId || !keepAliveSeconds) {
      return
    }

    const pendingStopTimer = pendingStopTimers.get(sessionId)
    if (pendingStopTimer) {
      window.clearTimeout(pendingStopTimer)
      pendingStopTimers.delete(sessionId)
    }

    const keepSession = () => {
      void keepVideoWatchSession({ session: sessionId })
    }
    const intervalId = window.setInterval(keepSession, keepAliveSeconds * 1000)

    return () => {
      window.clearInterval(intervalId)
      const stopTimer = window.setTimeout(() => {
        pendingStopTimers.delete(sessionId)
        void stopVideoWatchSession({ session: sessionId })
      }, 0)

      pendingStopTimers.set(sessionId, stopTimer)
    }
  }, [enabled, keepAliveSeconds, keepVideoWatchSession, sessionId, stopVideoWatchSession])
}
