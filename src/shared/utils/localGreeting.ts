const MORNING_START_HOUR = 5
const DAY_START_HOUR = 12
const EVENING_START_HOUR = 18
const NIGHT_START_HOUR = 23
const HOURS_IN_DAY = 24
const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = HOURS_IN_DAY * HOUR_MS

export type LocalGreeting = 'Доброе утро' | 'Добрый день' | 'Добрый вечер' | 'Доброй ночи'

export function getLocalGreeting(date = new Date()): LocalGreeting {
  const hour = date.getHours()

  if (hour >= MORNING_START_HOUR && hour < DAY_START_HOUR) {
    return 'Доброе утро'
  }

  if (hour >= DAY_START_HOUR && hour < EVENING_START_HOUR) {
    return 'Добрый день'
  }

  if (hour >= EVENING_START_HOUR && hour < NIGHT_START_HOUR) {
    return 'Добрый вечер'
  }

  return 'Доброй ночи'
}

function getNextGreetingChangeHour(currentHour: number): number {
  if (currentHour < MORNING_START_HOUR) return MORNING_START_HOUR
  if (currentHour < DAY_START_HOUR) return DAY_START_HOUR
  if (currentHour < EVENING_START_HOUR) return EVENING_START_HOUR
  if (currentHour < NIGHT_START_HOUR) return NIGHT_START_HOUR
  return MORNING_START_HOUR + HOURS_IN_DAY
}

export function getMsUntilNextLocalGreetingChange(date = new Date()): number {
  const currentHour = date.getHours()
  const nextHour = getNextGreetingChangeHour(currentHour)
  const currentTimeMs =
    currentHour * HOUR_MS +
    date.getMinutes() * MINUTE_MS +
    date.getSeconds() * 1000 +
    date.getMilliseconds()

  return nextHour * HOUR_MS - currentTimeMs || DAY_MS
}
