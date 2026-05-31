import { createClient, Client } from '@libsql/client';
import path from 'path';

let _client: Client | null = null;

function getDb(): Client {
  if (!_client) {
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (tursoUrl && tursoToken) {
      // Production: Turso hosted database
      _client = createClient({ url: tursoUrl, authToken: tursoToken });
    } else {
      // Local development: SQLite file
      const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
      _client = createClient({ url: `file:${dbPath}` });
    }
  }
  return _client;
}

export const db = {
  execute(sql: string, args?: unknown[]) {
    return getDb().execute({ sql, args: (args as any[]) ?? [] });
  },
};

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  createdAt: string;
};

export type TeacherProfile = {
  id: string;
  userId: string;
  bio: string | null;
  phone: string | null;
  subjects: string;
  priceRange: string | null;
  photoUrl: string | null;
  isApproved: number;
  rating: number;
};
