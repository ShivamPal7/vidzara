import { prisma } from "./prisma"
import { Feature, Plan } from "./prisma"
import { startOfDay } from "date-fns"
import { getPlanLimit } from "../constants/limits"

export async function getUserPlan(userId: string): Promise<Plan> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true }
  })
  return sub?.plan || Plan.FREE
}

export async function checkUsage(userId: string, feature: Feature) {
  const plan = await getUserPlan(userId)
  const limit = getPlanLimit(plan, feature)
  const today = startOfDay(new Date())

  const usageRecord = await prisma.usageRecord.findUnique({
    where: {
      userId_feature_date: {
        userId,
        feature,
        date: today
      }
    }
  })

  const usage = usageRecord?.count || 0
  const remaining = Math.max(0, limit - usage)

  return {
    allowed: usage < limit,
    feature,
    remaining,
    limit,
    usage,
    plan
  }
}

export async function incrementUsage(userId: string, feature: Feature) {
  const today = startOfDay(new Date())
  
  // Create or update the usage record
  // We use upsert to handle race conditions better than find+update
  const record = await prisma.usageRecord.upsert({
    where: {
      userId_feature_date: {
        userId,
        feature,
        date: today
      }
    },
    update: {
      count: { increment: 1 }
    },
    create: {
      userId,
      feature,
      date: today,
      count: 1
    }
  })
  
  return record
}

export interface UsageSummary {
  [key: string]: {
    used: number
    limit: number
    remaining: number
  }
}

export async function getUsageSummary(userId: string): Promise<UsageSummary> {
  const plan = await getUserPlan(userId)
  const today = startOfDay(new Date())
  
  const usages = await prisma.usageRecord.findMany({
    where: {
      userId,
      date: today
    }
  })

  const summary: UsageSummary = {}

  // Iterate over all features to ensure we return 0 for unused ones
  for (const feature of Object.values(Feature)) {
     const limit = getPlanLimit(plan, feature)
     const record = usages.find(u => u.feature === feature)
     const used = record?.count || 0
     
     summary[feature] = {
       used,
       limit,
       remaining: Math.max(0, limit - used)
     }
  }

  return summary
}
