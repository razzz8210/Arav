import React from "react";

export class ImagePreloader {
  private static _preloadedImages = new Set<string>();
  private static _loadingPromises = new Map<string, Promise<void>>();
  private static _preloadedFonts = new Set<string>();

  /**
   * Preload a single image
   */
  static preload(src: string): Promise<void> {
    if (this._preloadedImages.has(src)) {
      return Promise.resolve();
    }

    if (this._loadingPromises.has(src)) {
      return this._loadingPromises.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this._preloadedImages.add(src);
        this._loadingPromises.delete(src);
        resolve();
      };

      img.onerror = () => {
        this._loadingPromises.delete(src);
        reject(new Error(`Failed to preload image: ${src}`));
      };

      // Set crossorigin for external images
      if (src.startsWith("http")) {
        img.crossOrigin = "anonymous";
      }

      img.src = src;
    });

    this._loadingPromises.set(src, promise);

    return promise;
  }

  /**
   * Preload a font using the Font Loading API
   */
  static async preloadFont(
    fontFamily: string,
    testString = "BESbswy"
  ): Promise<void> {
    if (this._preloadedFonts.has(fontFamily)) {
      return Promise.resolve();
    }

    // Check if Font Loading API is supported
    if (typeof document === "undefined" || !("fonts" in document)) {
      return Promise.resolve();
    }

    return document.fonts
      .load(`1em ${fontFamily}`, testString)
      .then(() => {
        this._preloadedFonts.add(fontFamily);
        return Promise.resolve();
      })
      .catch((err) => {
        console.warn(`Failed to preload font: ${fontFamily}`, err);
        return Promise.resolve(); // Resolve anyway to not block other operations
      });
  }

  /**
   * Preload multiple images
   */
  static async preloadMultiple(sources: string[]): Promise<void[]> {
    return Promise.allSettled(sources.map((src) => this.preload(src))).then(
      (results) =>
        results
          .map((result) =>
            result.status === "fulfilled" ? result.value : undefined
          )
          .filter(Boolean) as void[]
    );
  }

  /**
   * Preload critical images (above the fold)
   */
  static preloadCritical(): void {
    // Preload critical fonts
    if (typeof document !== "undefined" && "fonts" in document) {
      this.preloadFont(
        "Manrope",
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      );
      this.preloadFont(
        "Inter",
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      );
    }
  }
}

export function useImagePreloader(sources: string[], immediate = false) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!immediate || sources.length === 0) {
      return;
    }

    ImagePreloader.preloadMultiple(sources)
      .then(() => {
        setIsLoaded(true);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoaded(false);
      });
  }, [sources, immediate]);

  const preload = React.useCallback(() => {
    return ImagePreloader.preloadMultiple(sources)
      .then(() => {
        setIsLoaded(true);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoaded(false);
      });
  }, [sources]);

  return { isLoaded, error, preload };
}
