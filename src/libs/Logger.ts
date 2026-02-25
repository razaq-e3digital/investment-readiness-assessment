import pino from 'pino';
import pretty from 'pino-pretty';

// Simple pino logger — errors are tracked via Sentry in production
const stream = pretty({ colorize: true });

export const logger = pino({ base: undefined }, stream);
