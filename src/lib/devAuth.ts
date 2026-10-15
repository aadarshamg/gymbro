const STORAGE_KEY = "gymbro_dev_token";

export function getDevToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setDevToken(token: string) {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // ignore (e.g. private browsing)
  }
}

export function clearDevToken() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
