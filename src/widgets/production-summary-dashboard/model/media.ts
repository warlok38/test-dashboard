import { hasMediaCameras } from './cameras'
import { hasMediaModels } from './models'
import type { SummaryOverlayType } from './overlays'
import { hasMediaVideoRecords } from './video-records'

export function isMediaOverlayAvailable(overlay: SummaryOverlayType, gtkSlug: string | undefined) {
  if (overlay === 'live') {
    return hasMediaCameras(gtkSlug)
  }

  if (overlay === 'records') {
    return hasMediaVideoRecords(gtkSlug)
  }

  return hasMediaModels(gtkSlug)
}
