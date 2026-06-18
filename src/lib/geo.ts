import { headers } from "next/headers";

interface GeoInfo {
  country: string;
  currency: "INR" | "USD";
}

export async function getGeoInfo(): Promise<GeoInfo> {
  const headersList = await headers();
  let country = headersList.get("x-vercel-ip-country");

  if (!country && process.env.NODE_ENV !== "production") {
    // Local development fallback based on timezone
    const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (systemTimeZone === "Asia/Calcutta" || systemTimeZone === "Asia/Kolkata") {
      country = "IN";
    }
  }

  country = country || "US";
  const isIndia = country === "IN";

  return {
    country,
    currency: isIndia ? "INR" : "USD",
  };
}
