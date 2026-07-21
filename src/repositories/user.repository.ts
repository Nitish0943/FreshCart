import { db } from "@/db";
import { users, sessions, type User, type NewUser } from "@/db/schema";
import { eq } from "drizzle-orm";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const results = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return results[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const results = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return results[0] || null;
  }

  async create(user: NewUser): Promise<User> {
    const results = await db.insert(users).values(user).returning();
    return results[0];
  }

  async createSession(session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: string;
  }) {
    const results = await db.insert(sessions).values(session).returning();
    return results[0];
  }

  async findSessionByToken(token: string) {
    const results = await db
      .select({
        session: sessions,
        user: users,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, token))
      .limit(1);
    return results[0] || null;
  }

  async deleteSession(token: string) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async getAllCustomers(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "CUSTOMER"));
  }
}
