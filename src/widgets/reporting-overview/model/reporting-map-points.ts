import type { ReportingAssetKey } from '@/entities/reporting'

export const REPORTING_MAP_IMAGE_SIZE = {
  width: 2182,
  height: 928
}

export type ReportingMapPoint = {
  assetKey: Exclude<ReportingAssetKey, 'group'>
  x: number
  y: number
}

export const reportingMapPoints = [
  {
    assetKey: 'olimpiada',
    x: 1100,
    y: 541
  },
  {
    assetKey: 'blagodatnoe',
    x: 1127,
    y: 530
  },
  {
    assetKey: 'natalka',
    x: 1780,
    y: 380
  },
  {
    assetKey: 'kuranah',
    x: 1574,
    y: 510
  },
  {
    assetKey: 'suhoy-log',
    x: 1420,
    y: 538
  }
] satisfies ReportingMapPoint[]
