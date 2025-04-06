import { UserRole } from 'src/interfaces/user';

export const roleOptions = [
  { label: 'User', value: UserRole.User },
  { label: 'Admin', value: UserRole.Admin },
];

export const roleLabels = {
  [UserRole.User]: 'User',
  [UserRole.Admin]: 'Admin',
};