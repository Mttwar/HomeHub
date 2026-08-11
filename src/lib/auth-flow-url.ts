export function authFlowUrl(path: "/login" | "/registrazione", callbackURL?: string) {
  return callbackURL
    ? `${path}?callbackURL=${encodeURIComponent(callbackURL)}`
    : path;
}
