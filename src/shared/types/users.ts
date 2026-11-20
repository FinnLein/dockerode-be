import { UserRole } from 'src/generated/prisma/enums';

interface UserRequest {
  id: string;
  email?: string | null;
  role: UserRole;
}

export type { UserRequest };
