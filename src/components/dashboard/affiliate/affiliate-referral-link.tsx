"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IconCopy,
  IconCheck,
  IconUsers,
  IconPencil,
  IconX,
  IconLoader2,
  IconLink,
  IconAlertCircle,
} from "@tabler/icons-react";
import { updateReferralHandle } from "@/actions/affiliates";

export function AffiliateReferralLink({
  referralCode,
  referrals,
}: {
  referralCode: string;
  referrals: any[];
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [handle, setHandle] = useState(referralCode);
  const [editValue, setEditValue] = useState(referralCode);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const referralUrl = `https://vidzara.com/ref/${handle}`;
  const creditedSignups = referrals.filter(
    (r) => r.status === "CREDITED" || r.status === "PAID"
  ).length;

  useEffect(() => {
    if (editing) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setEditValue(handle);
      setValidationError(null);
    }
  }, [editing, handle]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Client-side format validation
  const validateHandle = (value: string): string | null => {
    const v = value.trim().toLowerCase();
    if (!v) return "Handle cannot be empty.";
    if (v.length < 3) return "Must be at least 3 characters.";
    if (v.length > 40) return "Must be 40 characters or fewer.";
    if (!/^[a-z0-9][a-z0-9_-]*[a-z0-9]$/.test(v))
      return "Only lowercase letters, numbers, hyphens, underscores. Must start & end with a letter or number.";
    return null;
  };

  const handleEditChange = (value: string) => {
    setEditValue(value);
    // Live validation feedback
    const err = validateHandle(value);
    setValidationError(err);
  };

  const handleSave = async () => {
    const err = validateHandle(editValue);
    if (err) {
      setValidationError(err);
      return;
    }

    setSaving(true);
    const result = await updateReferralHandle(editValue);
    setSaving(false);

    if (result.success && result.handle) {
      setHandle(result.handle);
      setEditing(false);
      toast.success("Referral handle updated!", {
        description: `Your new link: vidzara.com/ref/${result.handle}`,
      });
    } else {
      setValidationError(result.error ?? "Failed to update.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditing(false);
      setValidationError(null);
    }
  };

  return (
    <div className="relative overflow-hidden bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-4 sm:p-6 md:p-8 space-y-5">
      {/* Glow blobs */}
      <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-0 top-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header row */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-zinc-100">Your Referral Link</h3>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            Share this link with your audience. You earn affiliate credits for every
            new user who signs up through your link.
          </p>
        </div>

        {/* Credited signups badge */}
        <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 shrink-0">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            <IconUsers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-100 leading-none">{creditedSignups}</div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">
              Credited Signups
            </div>
          </div>
        </div>
      </div>

      {/* URL / Edit section */}
      <div className="relative z-10 space-y-3">
        {!editing ? (
          /* ── View mode ── */
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* URL display */}
            <div className="flex-1 flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 h-11 min-w-0">
              <IconLink className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="font-mono text-sm text-zinc-300 truncate">
                vidzara.com/ref/
                <span className="text-indigo-400 font-semibold">{handle}</span>
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="h-11 px-3 border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-indigo-500/40 rounded-xl transition-all duration-200 gap-1.5"
              >
                <IconPencil className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-semibold">Edit Handle</span>
              </Button>
              <Button
                size="sm"
                onClick={copyToClipboard}
                className={`h-11 px-4 rounded-xl text-xs font-semibold transition-all duration-200 gap-1.5 ${
                  copied
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {copied ? (
                  <IconCheck className="w-4 h-4" />
                ) : (
                  <IconCopy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        ) : (
          /* ── Edit mode ── */
          <div className="space-y-2">
            {/* Row 1: prefix + input */}
            <div className="flex items-center">
              {/* Static prefix */}
              <div className="shrink-0 flex items-center h-11 px-2 sm:px-3 rounded-l-xl border border-r-0 border-zinc-700 bg-zinc-900/50 text-zinc-500 text-[11px] sm:text-xs font-mono select-none whitespace-nowrap">
                vidzara.com/ref/
              </div>

              {/* Handle input */}
              <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => handleEditChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={handle}
                className={`flex-1 min-w-0 h-11 rounded-l-none rounded-r-xl bg-zinc-900 border font-mono text-sm text-zinc-100 focus-visible:ring-1 focus-visible:ring-indigo-500/50 transition-colors ${
                  validationError
                    ? "border-red-500/60 focus-visible:ring-red-500/30"
                    : "border-zinc-700 focus-visible:border-indigo-500/60"
                }`}
                maxLength={40}
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {/* Row 2: Save + Cancel (full-width on mobile, inline on sm+) */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !!validationError}
                className="flex-1 sm:flex-none h-10 sm:h-11 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white gap-1.5"
              >
                {saving ? (
                  <IconLoader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <IconCheck className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setValidationError(null);
                }}
                disabled={saving}
                className="h-10 sm:h-11 px-4 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800"
              >
                <IconX className="w-4 h-4 mr-1.5" />
                Cancel
              </Button>
            </div>

            {/* Validation / hint row */}
            <div className="flex items-start gap-2 min-h-[20px]">
              {validationError ? (
                <p className="text-xs text-red-400 flex items-start gap-1">
                  <IconAlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {validationError}
                </p>
              ) : (
                <p className="text-xs text-zinc-500">
                  Lowercase letters, numbers, hyphens and underscores only. You can change
                  your handle <span className="text-zinc-400 font-semibold">once every 10 days</span>.
                </p>
              )}
              <span className="ml-auto text-[10px] text-zinc-600 shrink-0 tabular-nums">
                {editValue.length}/40
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
