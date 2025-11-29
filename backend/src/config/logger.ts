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
  // Service-specific colors
  private getServiceColor(service?: string): string {
    switch (service) {
      case 'TreasuryService': return colors.yellow;
      case 'DCAService': return colors.cyan;
      case 'System': return colors.green;
      default: return colors.reset;
    }
  }

  private formatMessage(level: string, msg: string, context?: LoggerContext, defaultColor?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context 
      ? `${colors.gray}[${context.service || 'System'}${context.method ? `::${context.method}` : ''}]${colors.reset}` 
      : '';
    
    // Determine color: Priority 1: Service Color, Priority 2: Level Default
    const msgColor = context?.service ? this.getServiceColor(context.service) : (defaultColor || colors.reset);
    
    const levelColor = defaultColor || colors.reset;
    const levelLabel = `${levelColor}${colors.bright}[${level}]${colors.reset}`;
    const timeLabel = `${colors.dim}${timestamp}${colors.reset}`;
    
    return `${levelLabel} ${timeLabel} ${contextStr} ${msgColor}${msg}${colors.reset}`;
  }

  info(msg: string, context?: LoggerContext) {
    // Default INFO color is blue/cyan, but service color overrides message content
    console.log(this.formatMessage('INFO', msg, context, colors.blue));
  }

  error(msg: string, context?: LoggerContext) {
    console.log(this.formatMessage('ERROR', msg, context, colors.red));
  }

  warn(msg: string, context?: LoggerContext) {
    console.log(this.formatMessage('WARN', msg, context, colors.yellow));
  }

  debug(msg: string, context?: LoggerContext) {
    if (process.env.DEBUG) {
      console.log(this.formatMessage('DEBUG', msg, context, colors.magenta));
    }
  }
  
  success(msg: string, context?: LoggerContext) {
    console.log(this.formatMessage('SUCCESS', msg, context, colors.green));
  }
}

export default new Logger();
