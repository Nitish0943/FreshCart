import { UserRepository } from "@/repositories/user.repository";
import { signJWT } from "@/lib/jwt";
import { COOKIE_KEYS } from "@/constants";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { z } from "zod";

const userRepository = new UserRepository();

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export class AuthService {
  async register(data: any) {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(JSON.stringify(parsed.error.format()));
    }

    const { email, password, firstName, lastName, phone } = parsed.data;
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new Error("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepository.create({
      id: crypto.randomUUID(),
      email,
      passwordHash,
      role: "CUSTOMER",
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null,
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(data: any) {
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(JSON.stringify(parsed.error.format()));
    }

    const { email, password } = parsed.data;
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = await signJWT({ user: sessionUser }, "24h");

    // Persist session to DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours

    await userRepository.createSession({
      id: crypto.randomUUID(),
      userId: user.id,
      token,
      expiresAt: expiresAt.toISOString(),
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_KEYS.AUTH_TOKEN, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return { user: sessionUser, token };
  }

  async logout(token?: string) {
    if (token) {
      await userRepository.deleteSession(token);
    }
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_KEYS.AUTH_TOKEN);
  }
}
