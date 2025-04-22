import { getRoles } from "@/lib/actions/role-actions"
import { getSession } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import RoleTable from "@/components/role-table"
import { Plus } from "lucide-react"

export default async function RolesPage() {
  const session = await getSession()
  const canManageRoles = await hasPermission(session?.user.id, "manage_roles")

  if (!canManageRoles) {
    redirect("/dashboard")
  }

  const roles = await getRoles()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage roles and their associated permissions</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/roles/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Link>
        </Button>
      </div>

      <RoleTable roles={roles} />
    </div>
  )
}
