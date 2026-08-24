import classNames from 'classnames'
import { Empty, Popover } from 'antd'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CSSProperties, useState } from 'react'

import {
  type GeneralSummaryCard,
  type GeneralSummaryGtkBreakdown
} from '@/entities/production-summary'
import { Loader } from '@/shared/ui'
import { formatNumber } from '@/shared/utils/formatNumber'

import {
  getMediaCameras,
  getMediaModels,
  hasMediaCameras,
  hasMediaVideoRecords,
  type SummaryOverlayType
} from '../model'
import styles from '../ProductionSummaryDashboard.module.css'
import { SummaryMediaOverlay } from './SummaryMediaOverlay'
import { SummarySideActions } from './SummarySideActions'

type GeneralSummaryProps = {
  cards: GeneralSummaryCard[]
  activeOverlay?: SummaryOverlayType | null
  activeIndicator?: string
  gtkSlug?: string
  loading?: boolean
  showGraph?: boolean
  onOverlayChange?: (overlay: SummaryOverlayType | null) => void
  onOverlayPreviewClose?: () => void
}

export function GeneralSummary({
  cards,
  activeOverlay = null,
  activeIndicator = 'Объем бурения',
  gtkSlug,
  loading,
  showGraph = false,
  onOverlayChange,
  onOverlayPreviewClose
}: GeneralSummaryProps) {
  const [isShowAll, setIsShowAll] = useState(false)
  const cameraItems = getMediaCameras(gtkSlug)
  const modelItems = getMediaModels(gtkSlug)
  const canShowCameraButton = showGraph && hasMediaCameras(gtkSlug)
  const canShowModelButton = showGraph && Boolean(modelItems?.length)
  const canShowVideoRecordsButton = showGraph && hasMediaVideoRecords(gtkSlug)

  if (loading && cards.length === 0) {
    return (
      <div className={classNames(styles.generalSummaryWrapper, styles.generalSummaryState)}>
        <Loader description="Загружаем показатели..." />
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className={classNames(styles.generalSummaryWrapper, styles.generalSummaryState)}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет показателей" />
      </div>
    )
  }

  const detailCards = cards[0].cards?.find((card) => card.indicator_name === activeIndicator)?.cards

  return (
    <Loader
      spinning={Boolean(loading)}
      description="Обновляем показатели..."
      classNames={{ root: styles.generalSummarySpin }}
    >
      <div className={styles.generalSummaryWrapper}>
        <div className={styles.generalSummary}>
          <div className={styles.generalSummaryTopIndicator}>
            <Card
              card={cards[0]}
              size="lg"
              style={{ border: 'none' }}
              active={cards[0].indicator_name === activeIndicator}
            />
            {cards?.[1] && (
              <div>
                <Card
                  card={cards[1]}
                  selectable={false}
                  size="sm"
                  style={{ border: 'none' }}
                  active={cards[0].indicator_name === activeIndicator}
                />
              </div>
            )}
          </div>
          <div className={styles.generalSummaryIndicatorsWrapper}>
            <div className={styles.generalSummaryIndicators}>
              {cards[0].cards?.map((card) => (
                <Card
                  key={card.indicator_name + '-1'}
                  card={card}
                  active={card.indicator_name === activeIndicator}
                />
              ))}
            </div>
            {isShowAll
              ? cards[0].cards?.map((card) => (
                  <div
                    key={card.indicator_name + '-3'}
                    className={classNames(
                      styles.generalSummaryIndicators,
                      styles.generalSummaryDetailIndicators
                    )}
                  >
                    {card.cards?.map((cardDetail) => (
                      <Card
                        key={cardDetail.indicator_name + '-3-1'}
                        card={cardDetail}
                        size="sm"
                        active={card.indicator_name === activeIndicator}
                        selectable={false}
                      />
                    ))}
                  </div>
                ))
              : detailCards &&
                detailCards.length > 0 && (
                  <div
                    className={classNames(
                      styles.generalSummaryIndicators,
                      styles.generalSummaryDetailIndicators
                    )}
                  >
                    {detailCards?.map((card) => (
                      <Card
                        key={card.indicator_name + '-2'}
                        card={card}
                        size="sm"
                        selectable={false}
                        active={true}
                      />
                    ))}
                  </div>
                )}
          </div>
        </div>
        <SummaryMediaOverlay
          activeOverlay={activeOverlay}
          cameraItems={cameraItems}
          className={styles.generalSummaryVideoOverlay}
          modelItems={modelItems}
          onClosePreview={onOverlayPreviewClose ?? (() => undefined)}
          showCamera={canShowCameraButton}
          showModel={canShowModelButton}
          showVideoRecords={canShowVideoRecordsButton}
          siteSlug="sl"
        />
        <SummarySideActions
          activeOverlay={activeOverlay}
          isShowAll={isShowAll}
          onOverlayChange={onOverlayChange}
          onShowAllToggle={() => setIsShowAll(!isShowAll)}
          showCamera={canShowCameraButton}
          showModel={canShowModelButton}
          showVideoRecords={canShowVideoRecordsButton}
        />
      </div>
    </Loader>
  )
}

type CardProps = {
  card: GeneralSummaryCard
  active?: boolean
  selectable?: boolean
  size?: 'lg' | 'md' | 'sm'
  style?: CSSProperties
}

const INDICATOR_PARAM = 'indicator'
const HOVER_DELAY_SECONDS = 0.5

function getGtkLetter(gtk: string) {
  return gtk.trim().charAt(0).toUpperCase()
}

function getGtkBreakdownLabel(breakdown: GeneralSummaryGtkBreakdown) {
  return breakdown.display_name
    ? `${breakdown.display_name.trim()}:`
    : `${getGtkLetter(breakdown.gtk_or_zif)}:`
}

function formatNullableNumber(value: number | null | undefined) {
  return value === null || value === undefined ? '-' : formatNumber(value)
}

function formatNullableDeviation(value: number | null | undefined) {
  return value === null || value === undefined
    ? '-'
    : formatNumber(value, { showSign: true, suffix: '%' })
}

function GtkBreakdownPopover({ breakdowns }: { breakdowns: GeneralSummaryGtkBreakdown[] }) {
  return (
    <div className={styles.generalSummaryGtkList}>
      {breakdowns.map((breakdown) => (
        <div key={breakdown.gtk_or_zif} className={styles.generalSummaryGtkRow}>
          <span className={styles.generalSummaryGtkLetter}>{getGtkBreakdownLabel(breakdown)}</span>
          <span className={styles.generalSummaryGtkFact}>
            {formatNullableNumber(breakdown.fact_value)}
          </span>
          <span
            className={classNames(styles.generalSummaryGtkDeviation, {
              [styles.generalSummaryGtkDeviationPositive]: (breakdown.deviation_pct ?? 0) > 0,
              [styles.generalSummaryGtkDeviationNegative]: (breakdown.deviation_pct ?? 0) < 0,
              [styles.generalSummaryGtkDeviationNeutral]: !breakdown.deviation_pct
            })}
          >
            {formatNullableDeviation(breakdown.deviation_pct)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function Card({ active = false, card, selectable = true, size = 'md', style }: CardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectIndicator = () => {
    if (!selectable || active) {
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.set(INDICATOR_PARAM, card.indicator_name)

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const getCardClassname = (cn: string) => {
    if (size === 'lg') {
      return cn + 'Large'
    }
    if (size === 'sm') {
      return cn + 'Small'
    }
    return cn
  }

  const cardNode = (
    <div
      className={classNames(
        styles.generalSummaryCardWrapper,
        styles[getCardClassname('generalSummaryCardWrapper')],
        {
          [styles.generalSummaryCardActive]: active,
          [styles.generalSummaryCardSelectable]: selectable
        }
      )}
      onClick={selectIndicator}
      style={style}
    >
      <div className={styles.generalSummaryCardTitleWrapper}>
        <span
          className={classNames(
            styles.generalSummaryCardTitle,
            styles[getCardClassname('generalSummaryCardTitle')]
          )}
        >
          {card.indicator_name}
        </span>
        &nbsp;
        <span
          className={classNames(
            styles.generalSummaryCardUnit,
            styles[getCardClassname('generalSummaryCardUnit')]
          )}
        >
          {card.measure_unit}
        </span>
      </div>
      <div
        className={classNames(
          styles.generalSummaryCardFact,
          styles[getCardClassname('generalSummaryCardFact')]
        )}
      >
        {formatNumber(card.fact_value)}
      </div>
      <div className={styles.generalSummaryCardPlanWrapper}>
        <div
          className={classNames(
            styles.generalSummaryCardPlan,
            styles[getCardClassname('generalSummaryCardPlan')]
          )}
        >
          {formatNumber(card.plan_value)}
        </div>
        {card.deviation_pct !== 0 && (
          <div
            className={classNames(styles.generalSummaryCardDeviationWrapper, {
              [styles.generalSummaryCardDeviationPositive]: card.deviation_pct > 0,
              [styles.generalSummaryCardDeviationNegative]: card.deviation_pct < 0
            })}
          >
            <div
              className={classNames(
                styles.generalSummaryCardDeviation,
                styles[getCardClassname('generalSummaryCardDeviation')]
              )}
            >
              {card.deviation_pct > 0 && <>+</>}
              {card.deviation_pct}
            </div>
            <div
              className={classNames(
                styles.generalSummaryCardDeviationPercent,
                styles[getCardClassname('generalSummaryCardDeviationPercent')]
              )}
            >
              %
            </div>
          </div>
        )}
      </div>
    </div>
  )

  if (!card.details?.length) {
    return cardNode
  }

  return (
    <Popover
      content={<GtkBreakdownPopover breakdowns={card.details} />}
      mouseEnterDelay={HOVER_DELAY_SECONDS}
      mouseLeaveDelay={0}
      placement="bottomLeft"
      classNames={{
        root: styles.generalSummaryGtkPopoverRoot,
        content: styles.generalSummaryGtkPopoverContent
      }}
    >
      {cardNode}
    </Popover>
  )
}
