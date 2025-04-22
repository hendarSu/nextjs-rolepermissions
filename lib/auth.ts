import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"
import { queryOne } from "./db"
import bcrypt from "bcryptjs"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-at-least-32-characters")

export interface UserSession {
  user: {
    id: string
    name: string
    email: string
    role: {
      id: string
      name: string
    }
  }
  exp: number
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as UserSession
  } catch (error) {
    console.error("Invalid token:", error)
    return null
  }
}

export async function createSession(userId: string): Promise<string> {
  // Get user with role information
  const user = await queryOne<{
    id: string
    name: string
    email: string
    role_id: string
    role_name: string
  }>(
    `
    SELECT u.id, u.name, u.email, r.id as role_id, r.name as role_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = $1 AND u.active = true
  `,
    [userId],
  )

  if (!user) {
    throw new Error("User not found or inactive")
  }

  // Create session payload
  const session: UserSession = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: {
        id: user.role_id,
        name: user.role_name,
      },
    },
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
  }

  // Sign JWT
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET)

  return token
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword)
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}
