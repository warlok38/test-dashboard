import {
  DownOutlined,
  PlaySquareFilled,
  PlaySquareOutlined,
  UpOutlined,
  VideoCameraFilled,
  VideoCameraOutlined
} from '@ant-design/icons'
import classNames from 'classnames'
import type { ComponentProps } from 'react'

import type { SummaryOverlayType } from '../../model'
import { ModelToggleIcon } from '../ModelOverlay'
import { SideActions } from '../SideActions'
import styles from './SummarySideActions.module.css'

type SideAction = ComponentProps<typeof SideActions>['actions'][number]

type SummarySideActionsProps = {
  activeOverlay?: SummaryOverlayType | null
  isShowAll: boolean
  onOverlayChange?: (overlay: SummaryOverlayType | null) => void
  onShowAllToggle: () => void
  showCamera: boolean
  showModel: boolean
  showVideoRecords: boolean
}

type SummarySideActionsParams = SummarySideActionsProps & {
  activeOverlay: SummaryOverlayType | null
}

function createOverlayToggleAction({
  activeIcon,
  activeLabel,
  activeOverlay,
  inactiveIcon,
  inactiveLabel,
  key,
  onOverlayChange,
  overlay
}: {
  activeIcon: SideAction['icon']
  activeLabel: string
  activeOverlay: SummaryOverlayType | null
  inactiveIcon: SideAction['icon']
  inactiveLabel: string
  key: string
  onOverlayChange?: (overlay: SummaryOverlayType | null) => void
  overlay: SummaryOverlayType
}): SideAction {
  const isActive = activeOverlay === overlay
  const icon = isActive ? activeIcon : inactiveIcon

  return {
    icon: inactiveIcon,
    key,
    label: isActive ? activeLabel : inactiveLabel,
    render: () => (
      <button
        className={classNames(styles.overlayToggleButton, {
          [styles.overlayToggleButtonActive]: isActive
        })}
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onOverlayChange?.(isActive ? null : overlay)
        }}
      >
        {icon}
      </button>
    )
  }
}

function getSummarySideActions({
  activeOverlay,
  isShowAll,
  onOverlayChange,
  onShowAllToggle,
  showCamera,
  showModel,
  showVideoRecords
}: SummarySideActionsParams): SideAction[] {
  return [
    {
      icon: isShowAll ? <UpOutlined /> : <DownOutlined />,
      key: 'show-all',
      label: isShowAll ? 'Скрыть все' : 'Показать все',
      onClick: onShowAllToggle
    },
    ...(showCamera
      ? [
          createOverlayToggleAction({
            activeIcon: <VideoCameraFilled />,
            activeLabel: 'Выключить камеры',
            activeOverlay,
            inactiveIcon: <VideoCameraOutlined />,
            inactiveLabel: 'Включить камеры',
            key: 'cameras',
            onOverlayChange,
            overlay: 'live'
          })
        ]
      : []),
    ...(showVideoRecords
      ? [
          createOverlayToggleAction({
            activeIcon: <PlaySquareFilled />,
            activeLabel: 'Скрыть записи',
            activeOverlay,
            inactiveIcon: <PlaySquareOutlined />,
            inactiveLabel: 'Показать записи',
            key: 'video-records',
            onOverlayChange,
            overlay: 'records'
          })
        ]
      : []),
    ...(showModel
      ? [
          createOverlayToggleAction({
            activeIcon: <ModelToggleIcon />,
            activeLabel: 'Скрыть 3D',
            activeOverlay,
            inactiveIcon: <ModelToggleIcon />,
            inactiveLabel: 'Показать 3D',
            key: 'model3d',
            onOverlayChange,
            overlay: 'model3d'
          })
        ]
      : [])
  ]
}

export function SummarySideActions({
  activeOverlay = null,
  isShowAll,
  onOverlayChange,
  onShowAllToggle,
  showCamera,
  showModel,
  showVideoRecords
}: SummarySideActionsProps) {
  return (
    <SideActions
      actions={getSummarySideActions({
        activeOverlay,
        isShowAll,
        onOverlayChange,
        onShowAllToggle,
        showCamera,
        showModel,
        showVideoRecords
      })}
    />
  )
}
