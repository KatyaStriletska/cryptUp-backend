export interface CreateSessionDto {
  sessionId: string;
  userId: string;
  expiresAt: Date;
}

export interface UpdateSessionDto {
  sessionId?: string;
  userId?: string;
  expiresAt?: Date;
}
