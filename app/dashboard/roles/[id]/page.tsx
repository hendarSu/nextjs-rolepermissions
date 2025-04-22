import { getRoleById, getAllPermissions } from "@/lib/actions/role-actions"
import { getSession } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import RoleForm from "@/components/role-form"

interface RoleEditPageProps {
  params: {
    id: string
  }
}

export default async function RoleEditPage({ params }: RoleEditPageProps) {
  const session = await getSession()
  const canManageRoles = await hasPermission(session?.user.id, "manage_roles")

  if (!canManageRoles) {
    redirect("/dashboard")
  }

  const isNewRole = params.id === "new"
  const role = isNewRole ? null : await getRoleById(params.id)
  const allPermissions = await getAllPermissions()

  if (!isNewRole && !role) {
    redirect("/dashboard/roles")
  }

  // Prevent editing system roles
  if (role?.isSystem) {
    redirect("/dashboard/roles")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{isNewRole ? "Create Role" : "Edit Role"}</h1>
        <p className="text-muted-foreground">
          {isNewRole ? "Add a new role with specific permissions" : `Update role and permissions for ${role?.name}`}
        </p>
      </div>

      <RoleForm role={role} allPermissions={allPermissions} isNewRole={isNewRole} />
    </div>
  )
}
