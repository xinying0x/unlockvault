type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(level: LogLevel, message: string, data?: any, meta?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      ...meta
    };
  }

  info(message: string, data?: any, meta?: any) {
    const log = this.formatLog('info', message, data, meta);
    console.log(`[${log.timestamp}] INFO: ${log.message}`, log.data || '');
  }

  warn(message: string, data?: any, meta?: any) {
    const log = this.formatLog('warn', message, data, meta);
    console.warn(`[${log.timestamp}] WARN: ${log.message}`, log.data || '');
  }

  error(message: string, error?: any, meta?: any) {
    const log = this.formatLog('error', message, error, meta);
    console.error(`[${log.timestamp}] ERROR: ${log.message}`, error || '');
    
    // In production, you might want to send to external service
    if (!this.isDevelopment) {
      // TODO: Send to external logging service (e.g., Sentry, LogRocket)
    }
  }

  debug(message: string, data?: any, meta?: any) {
    if (this.isDevelopment) {
      const log = this.formatLog('debug', message, data, meta);
      console.debug(`[${log.timestamp}] DEBUG: ${log.message}`, log.data || '');
    }
  }

  // API request logger
  apiRequest(req: any, res: any, duration?: number) {
    const meta = {
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      endpoint: `${req.method} ${req.url}`,
      statusCode: res.statusCode,
      duration: duration ? `${duration}ms` : undefined
    };

    const level = res.statusCode >= 400 ? 'error' : 'info';
    this[level](`API ${req.method} ${req.url} - ${res.statusCode}`, null, meta);
  }

  // Performance monitoring
  performance(operation: string, duration: number, meta?: any) {
    const message = `${operation} completed in ${duration}ms`;
    
    if (duration > 1000) {
      this.warn(`Slow operation: ${message}`, null, meta);
    } else {
      this.debug(message, null, meta);
    }
  }
}

export const logger = new Logger(); 