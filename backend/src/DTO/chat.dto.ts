export interface ChatUserDto {
  id: string;
}

export interface CreateChatDto {
  name?: string | null;
  image?: string | null;
  description?: string | null;
  isGroup?: boolean;
  usersToAdd?: ChatUserDto[];
}

export interface UpdateChatDto {
  name?: string | null;
  image?: string | null;
  description?: string | null;
  isGroup?: boolean;
  updatedAt?: Date | null;
  removedAt?: Date | null;
  addArchivedBy?: ChatUserDto[];
  addFavouriteFor?: ChatUserDto[];
  removeArchivedBy?: ChatUserDto[];
  removeFavouriteFor?: ChatUserDto[];
  usersToAdd?: ChatUserDto[];
  usersToUpdate?: ChatUserDto[];
  usersToRemove?: ChatUserDto[];
}
