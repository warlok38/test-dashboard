export function getModelLoadProgress(event: ProgressEvent<EventTarget>) {
  if (!event.lengthComputable || event.total === 0) {
    return null
  }

  return Math.round((event.loaded / event.total) * 100)
}
