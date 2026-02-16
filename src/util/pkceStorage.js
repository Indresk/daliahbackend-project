const store = new Map();

export function savePKCE(state, codeVerifier) {
  store.set(state, {
    code_verifier: codeVerifier,
    expires: Date.now() + 10 * 60 * 1000
  });
}

export function getPKCE(state) {
  const data = store.get(state);
  if (!data || Date.now() > data.expires) {
    store.delete(state);
    return null;
  }
  return data.code_verifier;
}

export function clearPKCE(state) {
  store.delete(state);
}