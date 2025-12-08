import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getUserProfile } from "./actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default async function ProfilePage() {
    const { success, user } = await getUserProfile()

    if (!success || !user) {
        return (
            <div className="p-8 text-center text-slate-500">
                Please log in to view your profile.
            </div>
        )
    }

    const initials = user.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : '??'

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback className="text-xl bg-slate-100 text-slate-600">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl">{user.name}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                            <Badge variant="secondary" className="mt-2">
                                {user.role}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" defaultValue={user.name || ""} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" defaultValue={user.email || ""} disabled />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600">
                        <p>
                            Profile updating is currently disabled. Contact an administrator to update your details.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
