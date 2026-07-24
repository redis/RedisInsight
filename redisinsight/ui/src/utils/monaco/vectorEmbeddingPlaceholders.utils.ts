// A CSPRNG-derived prefix (not Math.random) keeps the session id unguessable so
// a placeholder-shaped token from elsewhere can't be forged to match ours.
export const newSessionId = (): string => {
  const [seed] = crypto.getRandomValues(new Uint32Array(1))
  return seed.toString(36)
}
