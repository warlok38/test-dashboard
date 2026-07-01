export type DataSource = 'backend' | 'mock'

export const DATA_SOURCE: DataSource =
  process.env.NEXT_PUBLIC_DATA_SOURCE === 'backend' ? 'backend' : 'mock'

export function isMockDataSource() {
  return DATA_SOURCE === 'mock'
}
