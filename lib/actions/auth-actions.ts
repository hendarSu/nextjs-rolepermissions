"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { queryOne } from "../db"
import { createSession, verifyPassword, hashPassword } from "../auth"

export async function login(email: string, password: string) {
  try {
    // Find user by email
    const user = await queryOne<{
      id: string
      password: string
      active: boolean
    }>("SELECT id, password, active FROM users WHERE email = $1", [email])

    // Check if user exists and is active
    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    if (!user.active) {
      return { success: false, error: "Your account is inactive" }
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      return { success: false, error: "Invalid email or password" }
    }

    // Create session and set cookie
    const token = await createSession(user.id)
    cookies().set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An error occurred during login" }
  }
}

export async function register(name: string, email: string, password: string) {
  try {
    // Check if email already exists
    const existingUser = await queryOne<{ id: string }>("SELECT id FROM users WHERE email = $1", [email])

    if (existingUser) {
      return { success: false, error: "Email already in use" }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Get default user role (User)
    const userRole = await queryOne<{ id: string }>("SELECT id FROM roles WHERE name = 'User'", [])

    if (!userRole) {
      return { success: false, error: "Default role not found" }
    }

    // Create user
    await queryOne(
      `
      INSERT INTO users (name, email, password, role_id, active)
      VALUES ($1, $2, $3, $4, true)
      RETURNING id
      `,
      [name, email, hashedPassword, userRole.id],
    )

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "An error occurred during registration" }
  }
}

export async function logout() {
  cookies().delete("auth_token")
  redirect("/login")
}
