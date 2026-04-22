import Cookies from 'js-cookie';

class CookieStorage {
  private keys: Set<string> = new Set();
  private readonly fallbackKeyPrefix = '__cookie_fallback__:';

  private buildFallbackKey(key: string) {
    return `${this.fallbackKeyPrefix}${key}`;
  }

  private getFallbackValue(key: string): string | undefined {
    try {
      const value = localStorage.getItem(this.buildFallbackKey(key));

      return value ?? undefined;
    } catch {
      return undefined;
    }
  }

  private setFallbackValue(key: string, value: string): void {
    try {
      localStorage.setItem(this.buildFallbackKey(key), value);
    } catch {
      // Silent fallback: if localStorage is unavailable we still rely on cookies.
    }
  }

  private removeFallbackValue(key: string): void {
    try {
      localStorage.removeItem(this.buildFallbackKey(key));
    } catch {
      // Ignore storage removal errors.
    }
  }

  getItem(key: string): string | undefined {
    const cookieValue = Cookies.get(key);

    if (cookieValue !== undefined) {
      return cookieValue;
    }

    return this.getFallbackValue(key);
  }

  setItem(
    key: string,
    value: string,
    attributes?: Cookies.CookieAttributes,
  ): void {
    this.keys.add(key);

    const secureAttributes = {
      secure: window.location.protocol === 'https:',
      sameSite: 'lax' as const,
      ...attributes,
    };

    Cookies.set(key, value, secureAttributes);
    this.setFallbackValue(key, value);
  }

  removeItem(key: string, attributes?: Cookies.CookieAttributes): void {
    this.keys.delete(key);
    Cookies.remove(key, attributes);
    this.removeFallbackValue(key);
  }

  clear(): void {
    this.keys.forEach((key) => this.removeItem(key));
  }
}

export const cookieStorage = new CookieStorage();
