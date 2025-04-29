import 'reflect-metadata';
import { asyncHandler } from '../utils/routes.utils';

export const Controller = () => {
  return (target: any) => {
    const propertyNames = Object.getOwnPropertyNames(target.prototype);

    for (const key of propertyNames) {
      const originalMethod = target.prototype[key];

      if (typeof originalMethod === 'function' && key !== 'constructor') {
        target.prototype[key] = asyncHandler(originalMethod);
      }
    }
  };
}