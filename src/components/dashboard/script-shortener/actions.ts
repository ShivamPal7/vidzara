"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { AIEngine } from "@/lib/ai/engine"
import { Feature } from "../../../../prisma/generated/prisma/enums"
import { deductCreditsAction } from "@/actions/credits"

export async function generateShorts(script: string, count: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    const response = await AIEngine.generate({
      feature: Feature.SCRIPT_SHORTENER,
      input: script,
      context: { count },
      userId: session.user.id
    })

    if (!response.success) {
      return { success: false, error: response.error }
    }

    // Deduct credits
    const creditRes = await deductCreditsAction(Feature.SCRIPT_SHORTENER, { count });
    if (!creditRes.success) {
      return { success: false, error: creditRes.error };
    }

    // Try parsing the JSON string output if it wasn't returned as an object
    let parsedData = response.data
    if (typeof parsedData === "string") {
      try {
        // Strip out markdown formatting if present
        const jsonMatch = parsedData.match(/```json\n([\s\S]*?)\n```/)
        const jsonString = jsonMatch ? jsonMatch[1] : parsedData
        parsedData = JSON.parse(jsonString)
      } catch (e) {
        console.error("Failed to parse JSON response:", parsedData)
        return { success: false, error: "Received invalid data format from AI" }
      }
    }

    return { success: true, data: parsedData, generationId: response.generationId }

  } catch (error: any) {
    console.error("Failed to generate shorts:", error)
    return { success: false, error: error.message || "Failed to generate shorts" }
  }
}
