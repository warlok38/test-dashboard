import { type GtkSlug, isKnownGtkSlug } from '@/entities/production-summary'
import { DEFAULT_CAMERA_STREAM } from '@/shared/ui'

export type MediaCamera = {
  detailSrc?: string
  id: string
  name: string
  previewSrc?: string
}

type MediaCameraConfig = MediaCamera[] | { source: 'api' }

const CAMERA_CONFIG_BY_GTK_SLUG: Partial<Record<GtkSlug, MediaCameraConfig>> = {
  natalka: [
    {
      id: 'natalka-default-camera',
      detailSrc: DEFAULT_CAMERA_STREAM.detailSrc,
      name: DEFAULT_CAMERA_STREAM.title,
      previewSrc: DEFAULT_CAMERA_STREAM.previewSrc
    }
  ],
  'suhoy-log': {
    source: 'api'
  }
}

export function getMediaCameras(gtkSlug?: string) {
  if (!gtkSlug || !isKnownGtkSlug(gtkSlug)) {
    return undefined
  }

  const config = CAMERA_CONFIG_BY_GTK_SLUG[gtkSlug]

  return Array.isArray(config) ? config : undefined
}

export function hasMediaCameras(gtkSlug?: string) {
  return Boolean(gtkSlug && isKnownGtkSlug(gtkSlug) && gtkSlug in CAMERA_CONFIG_BY_GTK_SLUG)
}
