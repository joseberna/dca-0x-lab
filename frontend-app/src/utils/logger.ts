interface LoggerContext {
  service?: string;
  method?: string;
  planId?: string;
  txHash?: string;
}

class Logger {
  private getServiceStyle(service?: string): string {
    switch (service) {
      case 'TreasuryService': return 'color: #fbbf24; font-weight: bold;'; // yellow
      case 'DCAService': return 'color: #06b6d4; font-weight: bold;'; // cyan
      case 'System': return 'color: #22c55e; font-weight: bold;'; // green
      case 'Frontend': return 'color: #8b5cf6; font-weight: bold;'; // purple
      default: return 'color: inherit;';
    }
  }

  private formatMessage(level: string, msg: string, context?: LoggerContext, levelColor?: string) {
    const timestamp = new Date().toLocaleTimeString();
    const service = context?.service || 'System';
    const method = context?.method ? `::${context.method}` : '';
    
    const levelStyle = `color: ${levelColor}; font-weight: bold; padding: 2px 4px; border-radius: 2px; background: rgba(255,255,255,0.1);`;
    const timeStyle = 'color: #94a3b8;'; // gray
    const contextStyle = 'color: #64748b; font-weight: bold;'; // slate
    const msgStyle = this.getServiceStyle(service);

    return [
      `%c[${level}]%c ${timestamp} %c[${service}${method}]%c ${msg}`,
      levelStyle,
      timeStyle,
      contextStyle,
      msgStyle
    ];
  }

  info(msg: string, context?: LoggerContext) {
    const args = this.formatMessage('INFO', msg, context, '#3b82f6'); // blue
    console.log(...args);
  }

  error(msg: string, context?: LoggerContext) {
    const args = this.formatMessage('ERROR', msg, context, '#ef4444'); // red
    console.error(...args);
  }

  warn(msg: string, context?: LoggerContext) {
    const args = this.formatMessage('WARN', msg, context, '#f59e0b'); // amber
    console.warn(...args);
  }

  debug(msg: string, context?: LoggerContext) {
    if (process.env.NODE_ENV === 'development') {
      const args = this.formatMessage('DEBUG', msg, context, '#d946ef'); // fuchsia
      console.debug(...args);
    }
  }
  
  success(msg: string, context?: LoggerContext) {
    const args = this.formatMessage('SUCCESS', msg, context, '#22c55e'); // green
    console.log(...args);
  }
}

export default new Logger();
