import { cookies } from 'next/headers';

/**
 * Singleton class to manage user token in cookies (server-side).
 */
class CookiesManager {
  private static instance: CookiesManager;
  private readonly AUTH_TOKEN_KEY: string = "crackedai_token";

  // Private constructor to prevent direct instantiation
  private constructor() {}

  /**
   * Returns the singleton instance of CookiesManager.
   */
  public static getInstance(): CookiesManager {
    if (!CookiesManager.instance) {
      CookiesManager.instance = new CookiesManager();
    }
    return CookiesManager.instance;
  }

  /**
   * Retrieves the user token from cookies.
   * @returns {Promise<string | null>} The user token or null if not found.
   */
  public async getUserToken(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(this.AUTH_TOKEN_KEY);
      return token?.value || null;
    } catch (e) {
      console.warn("Could not access cookies:", e);
      return null;
    }
  }

  /**
   * Stores the user token in cookies.
   * @param {string} token - The user token to store.
   * @param {number} days - Number of days until expiration (default: 14).
   */
  public async setUserToken(token: string, days: number = 14): Promise<void> {
    try {
      const cookieStore = await cookies();
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      
      cookieStore.set(this.AUTH_TOKEN_KEY, token, {
        expires,
        path: '/',
        secure: process.env.NODE_ENV==='production',
        sameSite: 'strict',
        httpOnly: true
      });
    } catch (e) {
      console.warn("Could not set token in cookies:", e);
    }
  }

  /**
   * Removes the user token from cookies.
   */
  public async removeUserToken(): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.delete(this.AUTH_TOKEN_KEY);
    } catch (e) {
      console.warn("Could not remove token from cookies:", e);
    }
  }
}

// Export the singleton instance
export const cookiesManager: CookiesManager = CookiesManager.getInstance();
