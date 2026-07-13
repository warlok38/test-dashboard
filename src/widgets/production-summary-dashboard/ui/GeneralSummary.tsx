import classNames from 'classnames'

import { GeneralSummaryCard } from '@/entities/production-summary'

import styles from '../ProductionSummaryDashboard.module.css'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Spin } from 'antd'

type GeneralSummaryProps = {
  cards: GeneralSummaryCard[]
  activeIndicator?: string
  loading?: boolean
}

export function GeneralSummary({
  cards,
  activeIndicator = 'Объем бурения',
  loading
}: GeneralSummaryProps) {
  const [isShowAll, setIsShowAll] = useState(false)
  if (cards.length === 0 || loading) {
    return (
      <div className={classNames(styles.generalSummaryWrapper, styles.generalSummaryWrapperEmpty)}>
        <Spin spinning={loading} description="Загружаем показатели...">
          {loading ? '' : 'Нет показателей'}
        </Spin>
      </div>
    )
  }

  const detailCards = cards[0].cards?.find((card) => card.indicator_name === activeIndicator)?.cards

  return (
    <div className={styles.generalSummaryWrapper}>
      <div className={styles.generalSummary}>
        <div className={styles.generalSummaryTopIndicator}>
          <Card card={cards[0]} selectable={false} size="lg" />
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
          {isShowAll ? (
            cards[0].cards?.map((card) => (
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
          ) : (
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
      <div className={styles.generalSummaryShowAll} onClick={() => setIsShowAll(!isShowAll)}>
        {isShowAll ? 'Скрыть' : 'Показать'}&nbsp;все
      </div>
    </div>
  )
}

type CardProps = {
  card: GeneralSummaryCard
  active?: boolean
  selectable?: boolean
  size?: 'lg' | 'md' | 'sm'
}

const INDICATOR_PARAM = 'indicator'

export function Card({ active = false, card, selectable = true, size = 'md' }: CardProps) {
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

  return (
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
        {card.fact_value}
      </div>
      <div className={styles.generalSummaryCardPlanWrapper}>
        <div
          className={classNames(
            styles.generalSummaryCardPlan,
            styles[getCardClassname('generalSummaryCardPlan')]
          )}
        >
          {card.plan_value}
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
}
