import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ShieldCheck } from "lucide-react"

export default async function Home() {
  const session = await getSession()

  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-6 w-6" />
            <span>User Management System</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  User Management System
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  A complete role-based access control system with user management, roles, and permissions.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/login">
                  <Button size="lg" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full bg-gray-100 py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Key Features</h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our user management system provides a comprehensive solution for managing users, roles, and permissions.
              </p>
            </div>
            <div className="grid gap-6 lg:gap-10">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold">User Management</h3>
                <p className="text-gray-500">
                  Create, update, and delete users with ease. Assign roles and manage user access.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold">Role-Based Access Control</h3>
                <p className="text-gray-500">
                  Define roles with specific permissions to control access to different parts of your application.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold">Permission Management</h3>
                <p className="text-gray-500">
                  Granular permission control allows you to define exactly what each role can do.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-background">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="text-sm text-gray-500">© 2023 User Management System. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
