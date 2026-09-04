'use client'

import { CloseOutlined, UndoOutlined } from '@ant-design/icons'
import { Button, Input } from 'antd'
import { useRef } from 'react'

import { useClickOutside } from '@/shared/hooks'

import {
  DESCRIPTION_PLACEHOLDER,
  useProductionDescription
} from '../model/use-production-description'
import styles from '../ReportingProductionGroup.module.css'

type ProductionDescriptionEditorProps = {
  descriptionKey: string
  initialDescription: string
}

export function ProductionDescriptionEditor({
  descriptionKey,
  initialDescription
}: ProductionDescriptionEditorProps) {
  const descriptionEditorRef = useRef<HTMLDivElement>(null)
  const {
    savedDescription,
    draftDescription,
    editingDescription,
    hasSavedDescription,
    setDraftDescription,
    openEditor,
    saveDescription,
    resetDescription,
    closeDescription
  } = useProductionDescription(descriptionKey, initialDescription)

  useClickOutside(descriptionEditorRef, () => {
    if (editingDescription) {
      closeDescription()
    }
  })

  if (!editingDescription) {
    return (
      <button className={styles.descriptionPreview} type="button" onClick={openEditor}>
        <span className={hasSavedDescription ? styles.description : styles.descriptionPlaceholder}>
          {hasSavedDescription ? savedDescription : DESCRIPTION_PLACEHOLDER}
        </span>
      </button>
    )
  }

  return (
    <div className={styles.descriptionEditor} ref={descriptionEditorRef}>
      <Input.TextArea
        autoFocus
        className={styles.descriptionTextarea}
        placeholder={DESCRIPTION_PLACEHOLDER}
        value={draftDescription}
        onChange={(event) => setDraftDescription(event.target.value)}
      />
      <div className={styles.descriptionActions}>
        <Button icon={<CloseOutlined />} size="small" title="Закрыть" onClick={closeDescription} />
        <div className={styles.descriptionPrimaryActions}>
          <Button
            icon={<UndoOutlined />}
            size="small"
            title="Сбросить"
            onClick={resetDescription}
          />
          <Button
            className={styles.descriptionSaveButton}
            size="small"
            title="Сохранить"
            type="primary"
            onClick={saveDescription}
          >
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  )
}
