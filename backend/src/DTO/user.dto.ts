import { UserRoleEnum } from '../types/enums/user-role.enum';

export interface CreateUserDto {
  walletId: string;
  username: string;
  password?: string | null;
  email: string;
  role?: UserRoleEnum[];
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserDto {
  walletId?: string;
  username?: string;
  email?: string;
  role?: UserRoleEnum[];
  password?: string;
  avatar?: string | null;
  bio?: string | null;
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  nationality?: string;
  country?: string;
  state?: string;
  city?: string;
  street?: string;
  zipCode?: string;
  phone?: string;
}
