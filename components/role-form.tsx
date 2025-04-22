"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { createRole, updateRole } from "@/lib/actions/role-actions"

interface Permission {
  id: string
  name: string
  description: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

interface RoleFormProps {
  role: Role | null
  allPermissions: Permission[]
  isNewRole: boolean
}

export default function RoleForm({ role, allPermissions, isNewRole }: RoleFormProps) {
  const [name, setName] = useState(role?.name || "")
  const [description, setDescription] = useState(role?.description || "")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role?.permissions.map((p) => p.id) || [])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId])
    } else {
      setSelectedPermissions(selectedPermissions.filter((id) => id !== permissionId))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isNewRole) {
        await createRole({
          name,
          description,
          permissionIds: selectedPermissions,
        })
      } else if (role) {
        await updateRole(role.id, {
          name,
          description,
          permissionIds: selectedPermissions,
        })
      }

      router.push("/dashboard/roles")
      router.refresh()
    } catch (err) {
      setError("Failed to save role")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-4 pt-6">
          {error && <div className="rounded-md bg-red-50 p-2 text-sm text-red-500">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              {allPermissions.map((permission) => (
                <div key={permission.id} className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted/50">
                  <Checkbox
                    id={`permission-${permission.id}`}
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={(checked) => handlePermissionChange(permission.id, checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor={`permission-${permission.id}`} className="text-sm font-medium">
                      {permission.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">{permission.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/roles")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
