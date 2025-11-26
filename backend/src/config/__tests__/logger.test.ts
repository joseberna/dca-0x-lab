import logger from '../../config/logger';

describe('Logger', () => {

  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {

    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('info', () => {
    it('should log info messages with cyan color', () => {
      logger.info('Test message');
      expect(consoleSpy).toHaveBeenCalled();
      const loggedMessage = consoleSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[INFO]');
      expect(loggedMessage).toContain('Test message');
    });

    it('should include context when provided', () => {
      logger.info('Test message', { service: 'logger.test', method: 'info' });
      const loggedMessage = consoleSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[logger.test::info]');
    });
  });

  describe('error', () => {
    it('should log error messages with red color', () => {
      logger.error('Error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[ERROR]');
      expect(loggedMessage).toContain('Error message');
    });
  });

  describe('warn', () => {
    it('should log warning messages with yellow color', () => {
      logger.warn('Warning message');
      expect(consoleWarnSpy).toHaveBeenCalled();
      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[WARN]');
      expect(loggedMessage).toContain('Warning message');
    });
  });

  describe('success', () => {
    it('should log success messages with green color', () => {
      logger.success('Success message');
      expect(consoleSpy).toHaveBeenCalled();
      const loggedMessage = consoleSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[SUCCESS]');
      expect(loggedMessage).toContain('Success message');
    });
  });
});
