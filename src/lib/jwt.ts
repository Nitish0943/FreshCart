import { SignJWT, jwtVerify } from "jose";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
};

export async function signJWT(payload: any, expires = "2h") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(getJwtSecretKey());
}

export async function verifyJWT<T = any>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload as T;
  } catch {
    return null;
  }
}

