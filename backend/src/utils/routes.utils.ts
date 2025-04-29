import { Request, Response, NextFunction } from "express";

// To "unpack" promise that is going to be returned to the client 
// to catch any exceptions and to be handled in exceptions filter
export const asyncHandler = (action: (request: Request, response: Response, next: NextFunction) => Promise<any>) => 
  (request: Request, response: Response, next: NextFunction) => {
    return Promise.resolve(action(request, response, next)).catch(next);
};