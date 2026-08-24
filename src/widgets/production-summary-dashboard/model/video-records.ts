import { type GtkSlug, isKnownGtkSlug } from '@/entities/production-summary'

const VIDEO_RECORDS_GTK_SLUGS: readonly GtkSlug[] = ['suhoy-log']

export function hasMediaVideoRecords(gtkSlug?: string) {
  return gtkSlug && isKnownGtkSlug(gtkSlug) ? VIDEO_RECORDS_GTK_SLUGS.includes(gtkSlug) : false
}
