"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { createUser, updateUser } from "@/lib/actions/user-actions"

interface Role {
  id: string
  name: string
}

interface User {
  id: string
  name: string
  email: string
  roleId: string
  active: boolean
}

interface UserFormProps {
  user: User | null
  roles: Role[]
  isNewUser: boolean
}

export default function UserForm({ user, roles, isNewUser }: UserFormProps) {
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [password, setPassword] = useState("")
  const [roleId, setRoleId] = useState(user?.roleId || "")
  const [active, setActive] = useState(user?.active ?? true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isNewUser) {
        if (!password) {
          setError("Password is required for new users")
          setLoading(false)
          return
        }

        await createUser({
          name,
          email,
          password,
          roleId,
          active,
        })
      } else if (user) {
        await updateUser(user.id, {
          name,
          email,
          password: password || undefined,
          roleId,
          active,
        })
      }

      router.push("/dashboard/users")
      router.refresh()
    } catch (err) {
      setError("Failed to save user")
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="password">{isNewUser ? "Password" : "Password (leave blank to keep current)"}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={isNewUser}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="role">Role</Label>
              <Select value={roleId} onValueChange={setRoleId} required>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 sm:col-span-2">
              <Switch id="active" checked={active} onCheckedChange={setActive} />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/users")}>
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
