import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode: code },
    });

    if (affiliate && affiliate.enabled) {
      // Increment click count
      await prisma.affiliate.update({
        where: { id: affiliate.id },
        data: { clicks: { increment: 1 } },
      });

      // Set cookie for 30 days
      const cookieStore = await cookies();
      cookieStore.set("vidzara_ref", code, {
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }
  } catch (error) {
    console.error("Error in /ref/[code] redirect route:", error);
  }

  // Redirect to "/"
  return NextResponse.redirect(new URL("/", request.url));
}
