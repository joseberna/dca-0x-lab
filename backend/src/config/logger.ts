interface LoggerContext {
  service?: string;
  method?: string;
  planId?: string;
  txHash?: string;
}

// ANSI Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  // Background colors
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

class Logger {
  private formatMessage(level: string, msg: string, context?: LoggerContext, color?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context 
      ? `${colors.gray}[${context.service || 'System'}${context.method ? `::${context.method}` : ''}]${colors.reset}` 
      : '';
    
    const levelColor = color || colors.reset;
    const levelLabel = `${levelColor}${colors.bright}[${level}]${colors.reset}`;
    const timeLabel = `${colors.dim}${timestamp}${colors.reset}`;
    
    return `${levelLabel} ${timeLabel} ${contextStr} ${color || ''}${msg}${colors.reset}`;
  }

  info(msg: string, context?: LoggerContext) {
    console.log(this.formatMessage('INFO', msg, context, colors.cyan));
  }

  error(msg: string, context?: LoggerContext) {
    console.error(this.formatMessage('ERROR', msg, context, colors.red));
  }

  warn(msg: string, context?: LoggerContext) {
    console.warn(this.formatMessage('WARN', msg, context, colors.yellow));
  }

  debug(msg: string, context?: LoggerContext) {
    console.debug(this.formatMessage('DEBUG', msg, context, colors.gray));
  }
  
  success(msg: string, context?: LoggerContext) {
    console.log(this.formatMessage('SUCCESS', msg, context, colors.green));
  }
}

export default new Logger();
