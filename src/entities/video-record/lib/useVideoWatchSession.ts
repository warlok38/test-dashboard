'use client'

import { useEffect } from 'react'

import {
  useKeepVideoWatchSessionMutation,
  useStopVideoWatchSessionMutation
} from '../api/videoRecordApi'
import type { VideoRecordStreamResponse } from '../model/types'

type UseVideoWatchSessionOptions = {
  enabled?: boolean
  stream?: VideoRecordStreamResponse
}

const pendingStopTimers = new Map<string, number>()

export function useVideoWatchSession({ enabled = true, stream }: UseVideoWatchSessionOptions) {
  const [keepVideoWatchSession] = useKeepVideoWatchSessionMutation()
  const [stopVideoWatchSession] = useStopVideoWatchSessionMutation()
  const keepAliveSeconds = stream?.keep_alive_seconds
  const keepAliveUrl = stream?.keep_alive_url
  const stopUrl = stream?.stop_url

  useEffect(() => {
    if (!enabled || !keepAliveUrl || !stopUrl || !keepAliveSeconds) {
      return
    }

    const pendingStopTimer = pendingStopTimers.get(stopUrl)
    if (pendingStopTimer) {
      window.clearTimeout(pendingStopTimer)
      pendingStopTimers.delete(stopUrl)
    }

    const keepSession = () => {
      void keepVideoWatchSession({ session: keepAliveUrl })
    }
    const intervalId = window.setInterval(keepSession, keepAliveSeconds * 1000)

    return () => {
      window.clearInterval(intervalId)
      const stopTimer = window.setTimeout(() => {
        pendingStopTimers.delete(stopUrl)
        void stopVideoWatchSession({ session: stopUrl })
      }, 0)

      pendingStopTimers.set(stopUrl, stopTimer)
    }
  }, [
    enabled,
    keepAliveSeconds,
    keepAliveUrl,
    keepVideoWatchSession,
    stopUrl,
    stopVideoWatchSession
  ])
}
