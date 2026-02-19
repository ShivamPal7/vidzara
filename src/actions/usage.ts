"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { getPlanLimit } from "@/constants/limits"
import { startOfDay } from "date-fns"

export interface UsageData {
  used: number
  limit: number
  remaining: number
}

export async function getUsageData(): Promise<UsageData> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error("Unauthorized")
  }

  const [subscription, usageRecords] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.usageRecord.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfDay(new Date()),
        },
      },
    }),
  ])

  const plan = subscription?.plan || "FREE"
  const totalUsage = usageRecords.reduce((acc, record) => acc + record.count, 0)
  const limit = getPlanLimit(plan)
  const remaining = Math.max(0, limit - totalUsage)

  return { used: totalUsage, limit, remaining }
}
