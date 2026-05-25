"use client";

import { useState, useEffect } from "react";
import { CreditBalance } from "./_components/credit-balance";
import { PricingTiers } from "./_components/pricing-tiers";
import { CreditTopUp } from "./_components/credit-top-up";

export default function BillingPage() {
  const [region, setRegion] = useState<"IN" | "GL">("GL"); // India vs Global

  useEffect(() => {
    // Auto-detect location for pricing based on IP API
    async function detectLocation() {
      // 2. IP-Based Detection
      try {
        // Try GeoJS first (very reliable and VPN friendly)
        let res = await fetch("https://get.geojs.io/v1/ip/country.json");
        let countryCode = null;

        if (res.ok) {
          const data = await res.json();
          countryCode = data.country;
        } else {
          // Fallback to country.is
          res = await fetch("https://api.country.is/");
          if (res.ok) {
             const data = await res.json();
             countryCode = data.country;
          }
        }

        if (countryCode) {

          if (countryCode === "IN") {
            setRegion("IN");
            return;
          } else {
            setRegion("GL");
            return;
          }
        }
      } catch (e) {
        console.warn("[Location Engine] IP-based location detection failed:", e);
      }

      // 3. Fallback to timezone if IP fetch fails or adblocker blocks it
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz.includes("Kolkata") || tz.includes("Calcutta") || tz.includes("Colombo") || tz.includes("Dhaka") || tz.includes("Karachi")) {
          setRegion("IN");
        }
      } catch (e) {
        console.warn("Timezone detection failed, defaulting to Global:", e);
      }
    }
    
    detectLocation();
  }, []);

  const isIndia = region === "IN";

  return (
    <div className="flex flex-1 flex-col space-y-6 md:space-y-8 w-full px-1 md:px-0 pt-4 md:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Billing & Credits</h1>
        <p className="text-muted-foreground">
          Manage your usage, view your current balance, and top up your credits.
        </p>
      </div>

      {/* Credit Balance Section */}
      <CreditBalance />

      {/* Pricing Tiers */}
      <PricingTiers isIndia={isIndia} />

      {/* Credit Top Up */}
      <CreditTopUp isIndia={isIndia} />
    </div>
  );
}
