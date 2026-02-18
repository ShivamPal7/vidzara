import { headers } from "next/headers";

interface GeoInfo {
  country: string;
  currency: "INR" | "USD";
}

export async function getGeoInfo(): Promise<GeoInfo> {
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country") || "US";

  const isIndia = country === "IN";

  return {
    country,
    currency: isIndia ? "INR" : "USD",
  };
}
