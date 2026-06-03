"use client";

import { IconHourglassHigh, IconCheck, IconSearch, IconNotes } from "@tabler/icons-react";

export function PendingStatusCard({
  application,
}: {
  application: {
    status: string;
    channelLink?: string | null;
    niche?: string | null;
    createdAt: Date;
  };
}) {
  return (
    <div className="w-full max-w-3xl mx-auto py-12 flex flex-col items-center justify-center space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full" />
        <div className="relative bg-zinc-950/80 border border-zinc-800 p-6 rounded-full">
          <IconHourglassHigh className="w-12 h-12 text-amber-400 animate-pulse" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-zinc-100">Application Under Review</h2>
        <p className="text-zinc-400 max-w-md mx-auto">
          We've received your application and our team is currently reviewing it. We typically respond within 2-3 business days.
        </p>
      </div>

      <div className="w-full bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 md:p-8">
        <h3 className="text-lg font-semibold text-zinc-200 mb-6 flex items-center gap-2">
          <IconNotes className="w-5 h-5 text-indigo-400" />
          Application Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-1">
            <span className="text-sm font-medium text-zinc-500">Niche</span>
            <p className="text-zinc-200">{application.niche || "Not specified"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm font-medium text-zinc-500">Channel Link</span>
            <p className="text-zinc-200 truncate">
              {application.channelLink ? (
                <a href={application.channelLink} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                  {application.channelLink}
                </a>
              ) : "Not provided"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-sm font-medium text-zinc-500">Applied On</span>
            <p className="text-zinc-200">{new Date(application.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-4 -translate-y-1/2 w-full h-0.5 bg-zinc-800 -z-10" />
            <div className="absolute left-0 top-4 -translate-y-1/2 w-1/2 h-0.5 bg-indigo-500 -z-10" />
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                <IconCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-zinc-300">Applied</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                <IconSearch className="w-4 h-4 animate-pulse" />
              </div>
              <span className="text-xs font-medium text-indigo-400">Reviewing</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center text-zinc-600">
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
              </div>
              <span className="text-xs font-medium text-zinc-500">Decision</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
