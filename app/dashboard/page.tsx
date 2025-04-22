import { getSession } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { hasPermission } from "@/lib/permissions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, ShieldCheck, Settings } from "lucide-react"

export default async function DashboardPage() {
  const session = await getSession()
  const canManageUsers = await hasPermission(session?.user.id, "manage_users")
  const canManageRoles = await hasPermission(session?.user.id, "manage_roles")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session?.user.name}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {canManageUsers && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Management</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Users</div>
              <p className="text-xs text-muted-foreground">Manage system users</p>
              <Button asChild className="mt-4 w-full">
                <Link href="/dashboard/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {canManageRoles && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role Management</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Roles & Permissions</div>
              <p className="text-xs text-muted-foreground">Configure roles and permissions</p>
              <Button asChild className="mt-4 w-full">
                <Link href="/dashboard/roles">Manage Roles</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Settings</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Profile</div>
            <p className="text-xs text-muted-foreground">Update your account settings</p>
            <Button asChild className="mt-4 w-full">
              <Link href="/dashboard/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
