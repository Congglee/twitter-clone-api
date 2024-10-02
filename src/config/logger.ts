import chalk from 'chalk'

const logLevels = {
  success: chalk.green.bold,
  error: chalk.bold.red,
  warn: chalk.keyword('orange'),
  info: chalk.blue,
  debug: chalk.cyan
}

const environment = process.env.NODE_ENV || 'development'

const logger = {
  log(level: 'error' | 'warn' | 'info' | 'success' | 'debug', message: string) {
    const colorize = logLevels[level] || chalk.white
    const logMessage = colorize(`${level.toUpperCase()}: ${message}`)

    // Only show debug logs in development
    if (environment !== 'development' && level === 'debug') return

    if (level === 'error') {
      console.error(logMessage)
    } else {
      console.log(logMessage)
    }
  },

  error(message: string) {
    this.log('error', message)
  },

  warn(message: string) {
    this.log('warn', message)
  },

  info(message: string) {
    this.log('info', message)
  },

  success(message: string) {
    this.log('success', message)
  },

  debug(message: string) {
    this.log('debug', message)
  }
}

export default logger
