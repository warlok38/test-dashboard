export type DataSource = 'backend' | 'mock'

export const DATA_SOURCE: DataSource = 'mock'

export function isMockDataSource() {
  return DATA_SOURCE === 'mock'
}
