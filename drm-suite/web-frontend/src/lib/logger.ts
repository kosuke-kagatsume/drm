/**
 * ロガーユーティリティ
 * 開発環境でのみログを出力し、本番環境では出力を抑制します
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG === 'true';

export const logger = {
  /**
   * デバッグログ（開発環境のみ）
   */
  debug: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * 情報ログ（開発環境のみ）
   */
  info: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * 警告ログ（常に出力）
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * エラーログ（常に出力）
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * 見積機能専用のデバッグログ
   */
  estimate: {
    debug: (...args: any[]) => {
      if (isDevelopment || isDebugEnabled) {
        console.log('[ESTIMATE-DEBUG]', ...args);
      }
    },
    info: (...args: any[]) => {
      if (isDevelopment || isDebugEnabled) {
        console.info('[ESTIMATE-INFO]', ...args);
      }
    },
    warn: (...args: any[]) => {
      console.warn('[ESTIMATE-WARN]', ...args);
    },
    error: (...args: any[]) => {
      console.error('[ESTIMATE-ERROR]', ...args);
    },
  },

  /**
   * API関連のログ
   */
  api: {
    request: (method: string, url: string, data?: any) => {
      if (isDevelopment || isDebugEnabled) {
        console.log('[API-REQUEST]', method, url, data);
      }
    },
    response: (method: string, url: string, status: number, data?: any) => {
      if (isDevelopment || isDebugEnabled) {
        console.log('[API-RESPONSE]', method, url, status, data);
      }
    },
    error: (method: string, url: string, error: any) => {
      console.error('[API-ERROR]', method, url, error);
    },
  },

  /**
   * パフォーマンス計測
   */
  perf: {
    start: (label: string) => {
      if (isDevelopment || isDebugEnabled) {
        performance.mark(`${label}-start`);
      }
    },
    end: (label: string) => {
      if (isDevelopment || isDebugEnabled) {
        performance.mark(`${label}-end`);
        try {
          performance.measure(label, `${label}-start`, `${label}-end`);
          const measure = performance.getEntriesByName(label)[0];
          console.log(`[PERF] ${label}: ${measure.duration.toFixed(2)}ms`);
        } catch (e) {
          // Ignore measurement errors
        }
      }
    },
  },
};

/**
 * 旧形式のconsole.logを置き換えるヘルパー
 */
export const devLog = (...args: any[]) => {
  if (isDevelopment || isDebugEnabled) {
    console.log(...args);
  }
};

export const devWarn = (...args: any[]) => {
  if (isDevelopment || isDebugEnabled) {
    console.warn(...args);
  }
};

export const devError = (...args: any[]) => {
  console.error(...args);
};
