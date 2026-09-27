/**
 * Storage access can throw (private mode, blocked site data).
 * These helpers never throw; callers fall back to defaults.
 */
export function readStorage(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value)
  } catch {
    /* ignore: the value simply won't persist */
  }
}

export function removeStorage(storage: Storage, key: string): void {
  try {
    storage.removeItem(key)
  } catch {
    /* ignore */
  }
}
