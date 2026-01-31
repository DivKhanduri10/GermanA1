import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

const SESSION_COOKIE = "goethe_session";
const SESSION_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE);
  if (existing?.value) {
    return existing.value;
  }
  // This shouldn't happen if middleware is working, but fallback
  const newId = uuidv4();
  return newId;
}

export function generateSessionId(): string {
  return uuidv4();
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE;
