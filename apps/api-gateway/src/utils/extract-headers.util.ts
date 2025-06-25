import { Request } from 'express';

export function extractForwardHeaders(req: Request): Record<string, string> {
  const { authorization, cookie } = req.headers;

  const headers: Record<string, string> = {};

  if (authorization) headers['authorization'] = authorization;
  if (cookie) headers['cookie'] = cookie;

  return headers;
}

