// Escape special regex characters in tokens
export const sanitizeToken = (token: string = '') => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') || ''
