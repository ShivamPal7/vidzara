"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconSparkles, IconAlertCircle } from "@tabler/icons-react";
import { applyForAffiliate } from "@/actions/affiliates";

export function AffiliateApplyForm({
  rejectedApplication,
}: {
  rejectedApplication?: { adminNotes?: string | null };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      niche: formData.get("niche") as string,
      channelLink: (formData.get("channelLink") as string) || undefined,
      motivation: (formData.get("motivation") as string) || undefined,
      socialLinks: {
        instagram: (formData.get("instagram") as string) || undefined,
        twitter: (formData.get("twitter") as string) || undefined,
        youtube: (formData.get("youtube") as string) || undefined,
      },
    };

    if (!data.niche) {
      toast.error("Please select a content niche.");
      setLoading(false);
      return;
    }

    const res = await applyForAffiliate(data);
    if (res.success) {
      toast.success("Application submitted successfully!");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to submit application.");
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
          Join the Vidzara Earn Program
        </h1>
        <p className="text-zinc-400 text-lg">
          Share your referral link and earn commissions for every subscriber.
        </p>
      </div>

      <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <IconSparkles className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            Earn up to 50% commission per referral. The more you refer, the more you earn!
          </p>
        </div>

        {rejectedApplication && (
          <div className="flex gap-3 mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <IconAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold mb-1">Your previous application was rejected</p>
              {rejectedApplication.adminNotes && (
                <p className="text-sm opacity-90">{rejectedApplication.adminNotes}</p>
              )}
              <p className="text-sm mt-2">You can update your details below and re-apply.</p>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="niche">Content Niche *</Label>
              <Select name="niche" required>
                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                  <SelectValue placeholder="Select your primary niche" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gaming">Gaming</SelectItem>
                  <SelectItem value="Tech & AI">Tech & AI</SelectItem>
                  <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Health">Health & Fitness</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channelLink">YouTube Channel URL</Label>
              <Input
                id="channelLink"
                name="channelLink"
                type="url"
                placeholder="https://youtube.com/@yourchannel"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram Handle</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  placeholder="@yourhandle"
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter/X Handle</Label>
                <Input
                  id="twitter"
                  name="twitter"
                  placeholder="@yourhandle"
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivation">Why do you want to join? (Optional)</Label>
              <Textarea
                id="motivation"
                name="motivation"
                placeholder="Tell us a bit about your audience and how you plan to promote Vidzara..."
                className="bg-zinc-900 border-zinc-800 min-h-[100px]"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
            disabled={loading}
          >
            {loading ? "Submitting..." : "Apply Now"}
          </Button>
        </form>
      </div>
    </div>
  );
}
