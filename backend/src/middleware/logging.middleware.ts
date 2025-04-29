import { NextFunction, Request, Response } from "express";

export const applicationLogger = (request: Request, response: Response, next: NextFunction) => {
  const datetime = new Date().toISOString();
  const method = request.method;
  const url = request.url;
  const ip = request.ip;

  response.on('finish', () => {
    console.log(`[${datetime}] ${method}:${url} ${response.statusCode} - IP: ${ip}`);
  });

  return next();
}