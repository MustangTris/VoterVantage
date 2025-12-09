import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, GlassCardDescription } from "@/components/ui/glass-card"
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
            <h1 className="text-3xl font-bold tracking-tight text-white">My Profile</h1>

            <GlassCard>
                <GlassCardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-2 border-white/20 shadow-sm">
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback className="text-xl bg-slate-700 text-slate-300">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <GlassCardTitle className="text-2xl">{user.name}</GlassCardTitle>
                            <GlassCardDescription>{user.email}</GlassCardDescription>
                            <Badge variant="secondary" className="mt-2 bg-purple-500/20 text-purple-200 hover:bg-purple-500/30">
                                {user.role}
                            </Badge>
                        </div>
                    </div>
                </GlassCardHeader>
                <GlassCardContent className="space-y-6 pt-6">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                            <Input id="name" defaultValue={user.name || ""} disabled className="bg-white/5 border-white/10 text-white disabled:opacity-70" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                            <Input id="email" defaultValue={user.email || ""} disabled className="bg-white/5 border-white/10 text-white disabled:opacity-70" />
                        </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-lg text-sm text-slate-400 border border-white/10">
                        <p>
                            Profile updating is currently disabled. Contact an administrator to update your details.
                        </p>
                    </div>
                </GlassCardContent>
            </GlassCard>
        </div>
    )
}
