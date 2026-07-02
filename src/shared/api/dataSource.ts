export type DataSource = 'backend' | 'mock'

export const DATA_SOURCE: DataSource = 'mock'
// process.env.NEXT_PUBLIC_DATA_SOURCE === 'mock' ? 'mock' : 'backend'

export function isMockDataSource() {
  return DATA_SOURCE === 'mock'
}
