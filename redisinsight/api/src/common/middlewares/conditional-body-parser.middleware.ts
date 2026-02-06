import { NextFunction, Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import { get, Config } from 'src/utils';

const serverConfig = get('server') as Config['server'];

/**
 * Paths that should skip body parsing (for streaming proxy).
 * These routes use http-proxy which handles the request body as a stream.
 * Note: req.path includes the /api prefix from NestJS global prefix.
 */
const SKIP_BODY_PARSING_PATHS = [
  /^\/api\/rdi-proxy\/[^/]+\/.+/, // /api/rdi-proxy/:id/* - RDI proxy routes
];

/**
 * Check if the request path should skip body parsing.
 */
function shouldSkipBodyParsing(path: string): boolean {
  const skip = SKIP_BODY_PARSING_PATHS.some((pattern) => pattern.test(path));
  if (skip) {
    console.log(`[BodyParser] Skipping body parsing for: ${path}`);
  }
  return skip;
}

const jsonParser = bodyParser.json({ limit: serverConfig.maxPayloadSize });
const urlencodedParser = bodyParser.urlencoded({
  limit: serverConfig.maxPayloadSize,
  extended: true,
});

/**
 * Middleware that conditionally applies body parsing.
 * Skips parsing for proxy routes to allow streaming.
 */
export function conditionalJsonParser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (shouldSkipBodyParsing(req.path)) {
    return next();
  }
  return jsonParser(req, res, next);
}

export function conditionalUrlencodedParser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (shouldSkipBodyParsing(req.path)) {
    return next();
  }
  return urlencodedParser(req, res, next);
}
