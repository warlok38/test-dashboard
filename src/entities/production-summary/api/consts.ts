export const PRODUCTION_SUMMARY_API_ROUTES = {
  gtk: '/gtk',
  summary: '/summary',
  graph: '/graph',
  graphByMode: '/productivity/graph-by-mode',
  graphMapping: '/productivity/graph-mapping',
  graphWithGtk: '/productivity/graph-with-gtk',
  graphWithDetails: '/productivity/graph-with-details',
  generalSummary: '/general/info'
} as const

export const PRODUCTION_SUMMARY_API_TAGS = {
  gtk: 'Gtk',
  summary: 'Summary',
  graph: 'Graph',
  graphByMode: 'GraphByMode',
  graphMapping: 'GraphMapping',
  graphWithGtk: 'GraphWithGtk',
  graphWithDetails: 'GraphWithDetails',
  generalSummary: 'GeneralSummary'
} as const

export const PRODUCTION_SUMMARY_API_TAG_TYPES = Object.values(PRODUCTION_SUMMARY_API_TAGS)
