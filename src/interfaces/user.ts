export enum UserRole {
  User = 'user',
  Admin = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  imgUrl?: string;
  role: UserRole;
}

export interface NewUser {
  email: string;
  password: string;
}
