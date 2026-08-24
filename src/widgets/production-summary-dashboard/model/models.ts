import { type GtkSlug, isKnownGtkSlug } from '@/entities/production-summary'

export type MediaModel = {
  id: string
  name: string
  src: string
}

const MODELS_BY_GTK_SLUG: Partial<Record<GtkSlug, MediaModel[]>> = {
  olimpiada: [
    {
      id: 'olimpiada-low-poly-mine',
      name: 'Олимпиада',
      src: '/models/olimpiada/low-poly_mine.glb'
    }
  ]
}

export function getMediaModels(gtkSlug?: string) {
  return gtkSlug && isKnownGtkSlug(gtkSlug) ? MODELS_BY_GTK_SLUG[gtkSlug] : undefined
}

export function hasMediaModels(gtkSlug?: string) {
  return Boolean(getMediaModels(gtkSlug)?.length)
}
