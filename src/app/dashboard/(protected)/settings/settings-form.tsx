"use client";

import { useState } from "react";
import { updateProfile, deleteAccount, type ProfileData } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  Loader2,
  Trash2,
  Monitor,
  Moon,
  Sun,
  Laptop,
  Check,
  User,
  Youtube,
  AlertTriangle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NICHES = [
  "Gaming",
  "Technology & AI",
  "Lifestyle & Vlogs",
  "Education & Tutorials",
  "Finance & Business",
  "Health & Fitness",
  "Entertainment & Comedy",
  "Other",
];

interface SettingsFormProps {
  user: any;
  profile: any;
  hasGoogle: boolean;
}

export function SettingsForm({ user, profile, hasGoogle }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { theme, setTheme } = useTheme();

  const [formData, setFormData] = useState<ProfileData>({
    displayName: profile?.displayName || user.name || "",
    niche: profile?.niche || "",
    avatar: profile?.avatar || user.image || "",
    youtubeChannelId: profile?.youtubeChannelId || "",
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount();
      // Redirect handled in server action
    } catch (error) {
      toast.error("Failed to delete account");
      console.error(error);
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card className="glass-1 border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your public profile details and content niche.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 border-2 border-border">
                <AvatarImage src={formData.avatar} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {formData.displayName?.slice(0, 2).toUpperCase() || "ME"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1">
                <Label>Avatar URL</Label>
                <Input
                  value={formData.avatar || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.value })
                  }
                  placeholder="https://example.com/avatar.jpg"
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  placeholder="Your Name"
                  className="bg-background/50"
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Content Niche</Label>
                <Select
                  value={formData.niche}
                  onValueChange={(val) =>
                    setFormData({ ...formData, niche: val })
                  }
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select a niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHES.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="min-w-[120px]">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card className="glass-1 border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            Connected Accounts
          </CardTitle>
          <CardDescription>
            Manage your linked social accounts and integrations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-background/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium">Google</div>
                <div className="text-sm text-muted-foreground">
                  {hasGoogle ? "Connected" : "Not connected"}
                </div>
              </div>
            </div>
            {hasGoogle ? (
               <Button variant="outline" size="sm" disabled>Connected</Button>
            ) : (
                <Button variant="outline" size="sm" disabled>Connect</Button> // TODO: Add connect logic
            )}
          </div>

          <div className="space-y-3">
             <div className="flex items-center gap-2 text-sm font-medium">
                <Youtube className="w-4 h-4 text-red-500" />
                YouTube Channel
             </div>
             <div className="flex gap-2">
                <Input 
                   value={formData.youtubeChannelId || ""}
                   onChange={(e) => setFormData({...formData, youtubeChannelId: e.target.value})}
                   placeholder="https://youtube.com/@yourchannel"
                   className="bg-background/50"
                />
                 <Button onClick={handleUpdateProfile} disabled={loading} size="sm">Save</Button>
             </div>
             <p className="text-xs text-muted-foreground">
                Connecting your channel helps us track growth and generate better ideas.
             </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="glass-1 border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Sun className="w-5 h-5 text-primary" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how Vidzara looks on your device.
          </CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid grid-cols-3 gap-4 max-w-md">
                 <button 
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted'}`}
                 >
                    <div className="p-2 rounded-full bg-background border shadow-sm">
                       <Sun className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Light</span>
                 </button>
                 <button 
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted'}`}
                 >
                    <div className="p-2 rounded-full bg-background border shadow-sm">
                       <Moon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Dark</span>
                 </button>
                 <button 
                    onClick={() => setTheme("system")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted'}`}
                 >
                    <div className="p-2 rounded-full bg-background border shadow-sm">
                       <Laptop className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">System</span>
                 </button>
             </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20 bg-red-500/5 shadow-none">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-600/80 dark:text-red-400/80">
            Irreversible actions. Proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Delete Account</div>
              <div className="text-sm text-muted-foreground">
                Permanently remove your account and all data.
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                   <Trash2 className="w-4 h-4 mr-2" />
                   Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="border-red-500/20">
                <DialogHeader>
                  <DialogTitle className="text-red-600">Delete Account?</DialogTitle>
                  <DialogDescription>
                    This is absolutely irreversible. This will permanently delete your
                    account, connected channels, generation history, and remove
                    you from our servers.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                   <Button variant="ghost" onClick={() => {}}>Cancel</Button>
                   <Button 
                     variant="destructive" 
                     onClick={handleDeleteAccount}
                     disabled={deleteLoading}
                    >
                      {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete Everything"}
                   </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
