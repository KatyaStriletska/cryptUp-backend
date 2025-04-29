import * as bcrypt from 'bcrypt';

export class PasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(
      `${process.env.PASSWORD_SALT_PREFIX}.${password}.${process.env.PASSWORD_SALT_SUFFIX}`,
      process.env.PASSWORD_SALT_ROUNDS || 10,
    );
  }

  async compare(password: string, hash: string | null | undefined): Promise<boolean> {
    return (
      hash !== null &&
      hash !== undefined &&
      Boolean(hash.trim()) &&
      (await bcrypt.compare(
        `${process.env.PASSWORD_SALT_PREFIX}.${password}.${process.env.PASSWORD_SALT_SUFFIX}`,
        hash,
      ))
    );
  }
}

export default new PasswordService();
