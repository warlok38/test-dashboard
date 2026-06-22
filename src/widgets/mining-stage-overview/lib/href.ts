export function getHrefWithQuery(href: string, queryString: string) {
  return queryString ? `${href}?${queryString}` : href
}
