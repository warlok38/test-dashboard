import { type GtkSlug } from './types'

export const GTK_SLUG_BY_NAME = {
  Олимпиада: 'olimpiada',
  Благодатное: 'blagodatnoe',
  Наталка: 'natalka',
  Куранах: 'kuranah',
  'Сухой Лог': 'suhoy-log'
} as const satisfies Record<string, GtkSlug>

export const GTK_NAME_BY_SLUG = {
  olimpiada: 'Олимпиада',
  blagodatnoe: 'Благодатное',
  natalka: 'Наталка',
  kuranah: 'Куранах',
  'suhoy-log': 'Сухой Лог'
} as const satisfies Record<GtkSlug, keyof typeof GTK_SLUG_BY_NAME>

export function getGtkSlugByName(name: string): GtkSlug | undefined {
  return GTK_SLUG_BY_NAME[name as keyof typeof GTK_SLUG_BY_NAME]
}

export function getGtkNameBySlug(slug: string): string | undefined {
  return GTK_NAME_BY_SLUG[slug as GtkSlug]
}

export function getGtkHrefByName(name: string): string | undefined {
  const slug = getGtkSlugByName(name)

  return slug ? `/${slug}` : undefined
}

export function isKnownGtkSlug(slug: string): slug is GtkSlug {
  return slug in GTK_NAME_BY_SLUG
}
