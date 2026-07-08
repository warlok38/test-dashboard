export const KERB_TOKEN = process.env.kerbToken || null

export const isDevelopmentRunMode = process.env.runMode === 'development'
export const isProductionRunMode = !isDevelopmentRunMode
