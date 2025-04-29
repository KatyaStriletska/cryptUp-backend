import { UserRoleEnum } from '../types/enums/user-role.enum';

export interface AccountRegistrationData {
  walletId: string;
  username: string;
  email: string;
  role: UserRoleEnum[];
  password?: string;
  firstName?: string;
  lastName?: string;
}
