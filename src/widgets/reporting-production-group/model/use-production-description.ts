'use client'

import { useCallback, useEffect, useState } from 'react'

export const DESCRIPTION_PLACEHOLDER = 'Введите комментарий по отклонениям'

export function useProductionDescription(descriptionKey: string, initialDescription: string) {
  const [savedDescription, setSavedDescription] = useState(initialDescription)
  const [draftDescription, setDraftDescription] = useState(initialDescription)
  const [editingDescription, setEditingDescription] = useState(false)
  const hasSavedDescription = savedDescription.trim().length > 0

  useEffect(() => {
    setSavedDescription(initialDescription)
    setDraftDescription(initialDescription)
    setEditingDescription(false)
  }, [descriptionKey, initialDescription])

  const openEditor = useCallback(() => {
    setEditingDescription(true)
  }, [])

  const saveDescription = useCallback(() => {
    setSavedDescription(draftDescription)
    setEditingDescription(false)
  }, [draftDescription])

  const resetDescription = useCallback(() => {
    setSavedDescription(initialDescription)
    setDraftDescription(initialDescription)
  }, [initialDescription])

  const closeDescription = useCallback(() => {
    setDraftDescription(savedDescription)
    setEditingDescription(false)
  }, [savedDescription])

  return {
    savedDescription,
    draftDescription,
    editingDescription,
    hasSavedDescription,
    setDraftDescription,
    openEditor,
    saveDescription,
    resetDescription,
    closeDescription
  }
}
