// Tunable threshold for the "looks like production" key-count signal.
export const PRODUCTION_KEY_COUNT_THRESHOLD = 10_000

export const LOCAL_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1']

// Fixed width (px) of the bottom-right prompt card.
export const PROMPT_WIDTH = 400

export const PROMOTE_PRODUCTION_PROMPT = {
  title: 'Is this a production database?',
  body:
    'Mark it as production to add confirmation dialogs and stronger friction ' +
    'before destructive changes. These safeguards apply within Redis Insight ' +
    'only — your Redis server settings and data are not affected.',
  dismissLabel: 'Not now',
  confirmLabel: 'Take me to database settings',
} as const
