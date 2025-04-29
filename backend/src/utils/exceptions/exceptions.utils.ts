export class Exception extends Error {
  constructor(
    message: string,
    public readonly cause: Error | string = 'unknown',
  ) {
    super(message);
    this.name = 'Exception';
  }
}

export class RabbitMQException extends Exception {
  constructor(message: string, cause?: Error | string) {
    super(message, cause);
    this.name = 'RabbitMQException';
  }
}

export class AuthException extends Exception {
  constructor(message: string, cause?: Error | string) {
    super(message, cause);
    this.name = 'AuthException';
  }
}

export class GoogleAuthException extends AuthException {
  constructor(message: string, cause?: Error | string) {
    super(message, cause);
    this.name = 'GoogleAuthException';
  }
}

export class ForbiddenException extends Exception {
  constructor(message: string, cause?: Error | string) {
    super(message, cause);
    this.name = 'ForbiddenException';
  }
}

export class DatabaseException extends Exception {
  constructor(message: string, cause?: Error | string) {
    super(message, cause);
    this.name = 'DatabaseException';
  }
}

export class NotFoundException extends Exception {
  constructor(message: string, cause?: Error | string) {
    super(message, cause);
    this.name = 'NotFoundException';
  }
}

export class ConflictException extends Exception {
  constructor(message: string, cause?: Error | string) {
    super(message, cause);
    this.name = 'ConflictException';
  }
}

export class ServerException extends Exception {
  constructor(message: string, cause?: Error | string) {
    super(message, cause);
    this.name = 'ServerException';
  }
}

export class MintNftException extends Exception {
  constructor(message: string, cause?: Error | string) {
    super(message, cause);
    this.name = 'MintNftException';
  }
}