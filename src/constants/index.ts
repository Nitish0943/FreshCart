export const COOKIE_KEYS = {
  AUTH_TOKEN: "auth_token",
} as const;

export const ROLES = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
  DELIVERY_BOY: "DELIVERY_BOY",
} as const;

export const ORDER_STATUSES = {
  RECEIVED: "RECEIVED",
  PACKING: "PACKING",
  READY: "READY",
  ASSIGNED: "ASSIGNED",
  DISPATCHED: "DISPATCHED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;
