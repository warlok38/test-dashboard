import type { MediaCamera, MediaModel, SummaryOverlayType } from '../../model'
import { GraphCameraOverlay } from '../GraphCameraOverlay'
import { ModelOverlay } from '../ModelOverlay'
import { VideoRecordsOverlay } from '../VideoRecordsOverlay'

type SummaryMediaOverlayProps = {
  activeOverlay?: SummaryOverlayType | null
  cameraItems?: MediaCamera[]
  className?: string
  modelItems?: MediaModel[]
  onClosePreview: () => void
  showCamera: boolean
  showModel: boolean
  showVideoRecords: boolean
  siteSlug: string
}

export function SummaryMediaOverlay({
  activeOverlay = null,
  cameraItems,
  className,
  modelItems,
  onClosePreview,
  showCamera,
  showModel,
  showVideoRecords,
  siteSlug
}: SummaryMediaOverlayProps) {
  if (showCamera && activeOverlay === 'live') {
    return (
      <GraphCameraOverlay
        cameras={cameraItems}
        className={className}
        onClosePreview={onClosePreview}
        siteSlug={siteSlug}
      />
    )
  }

  if (showVideoRecords && activeOverlay === 'records') {
    return (
      <VideoRecordsOverlay
        className={className}
        onClosePreview={onClosePreview}
        siteSlug={siteSlug}
      />
    )
  }

  if (showModel && activeOverlay === 'model3d' && modelItems) {
    return <ModelOverlay models={modelItems} onClosePreview={onClosePreview} />
  }

  return null
}
