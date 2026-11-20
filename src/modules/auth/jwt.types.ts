import { UserRole } from 'src/generated/prisma/enums';

interface JwtPayload {
  id: string;
  email?: string | null;
  role: UserRole;
}

export type { JwtPayload };
