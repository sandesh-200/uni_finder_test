// Frontend logging utility
class Logger {
  private isDevelopment = import.meta.env?.MODE === 'development' || false;

  info(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, data || '');
    }
    // In production, you could send to a logging service
  }

  error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error || '');
    // In production, you could send to error tracking service
  }

  warn(message: string, data?: any) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
}

export const logger = new Logger(); 