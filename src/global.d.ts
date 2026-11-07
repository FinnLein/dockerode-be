import { UserRequest } from '@shared/types/users';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends UserRequest {}
  }
}

export {};
