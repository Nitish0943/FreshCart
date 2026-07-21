export interface SessionUser {
  id: string;
  email: string;
  role: "ADMIN" | "CUSTOMER" | "DELIVERY_BOY";
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

export interface JWTPayload extends Record<string, any> {
  user: SessionUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

