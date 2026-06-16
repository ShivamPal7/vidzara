"use client";

import { useState, useEffect } from "react";
import { getCoupons, createCoupon, toggleCouponActive, deleteCoupon } from "@/actions/admin/coupons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Plus, Calendar, Tag, Percent, Users, Globe, Trash2 } from "lucide-react";

interface CouponData {
  id: string;
  code: string;
  discountPercent: number;
  expiresAt: Date | string | null;
  maxUses: number | null;
  usedCount: number;
  perUserLimit: number | null;
  country: string | null;
  active: boolean;
  createdAt: Date | string;
}

export function CouponManagerTab() {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("1");
  const [country, setCountry] = useState("GLOBAL");

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await getCoupons();
      setCoupons(data as unknown as CouponData[]);
    } catch (error: any) {
      toast.error("Failed to load coupons: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("Coupon code cannot be empty.");
      return;
    }

    if (discountPercent < 1 || discountPercent > 100) {
      toast.error("Discount percent must be between 1 and 100.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        code: cleanCode,
        discountPercent,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        perUserLimit: perUserLimit ? Number(perUserLimit) : null,
        country: country === "GLOBAL" ? null : country,
      };

      const res = await createCoupon(payload);

      if (res.success) {
        toast.success(`Coupon ${cleanCode} created successfully!`);
        // Reset form
        setCode("");
        setDiscountPercent(10);
        setExpiresAt("");
        setMaxUses("");
        setPerUserLimit("1");
        setCountry("GLOBAL");
        // Reload list
        loadCoupons();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const newActive = !currentActive;
      
      // Optimistic update
      setCoupons((prev) => 
        prev.map((c) => c.id === id ? { ...c, active: newActive } : c)
      );

      const res = await toggleCouponActive(id, newActive);
      if (res.success) {
        toast.success(`Coupon status updated.`);
      }
    } catch (error: any) {
      toast.error("Failed to update status: " + error.message);
      // Revert status
      setCoupons((prev) => 
        prev.map((c) => c.id === id ? { ...c, active: currentActive } : c)
      );
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${couponCode}?`)) return;

    try {
      const res = await deleteCoupon(id);
      if (res.success) {
        toast.success(`Coupon ${couponCode} deleted.`);
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error: any) {
      toast.error("Failed to delete coupon: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Create Coupon Card */}
        <Card className="bg-zinc-950/40 border-zinc-800/80 backdrop-blur-sm shadow-xl md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Generate Coupon
            </CardTitle>
            <CardDescription>Create promotional and location-restricted discounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              {/* Code */}
              <div className="space-y-1.5">
                <Label htmlFor="coupon-code" className="text-zinc-400 text-xs">Coupon Code</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="coupon-code"
                    placeholder="E.g., SAVE20, CHANNELS30"
                    className="bg-zinc-950 border-zinc-800 pl-10 uppercase"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Discount Percent */}
              <div className="space-y-1.5">
                <Label htmlFor="coupon-discount" className="text-zinc-400 text-xs">Discount Percent (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="coupon-discount"
                    type="number"
                    min={1}
                    max={100}
                    className="bg-zinc-950 border-zinc-800 pl-10"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              {/* Country Limitation */}
              <div className="space-y-1.5">
                <Label htmlFor="coupon-country" className="text-zinc-400 text-xs">Regional Restriction</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="coupon-country" className="bg-zinc-950 border-zinc-800">
                    <SelectValue placeholder="Select restriction" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                    <SelectItem value="GLOBAL" className="focus:bg-zinc-800">Global (No Restriction)</SelectItem>
                    <SelectItem value="IN" className="focus:bg-zinc-800">India Only (INR - ₹)</SelectItem>
                    <SelectItem value="US" className="focus:bg-zinc-800">Global Only (USD - $)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Expiration Date */}
              <div className="space-y-1.5">
                <Label htmlFor="coupon-expiry" className="text-zinc-400 text-xs">Expiration Date (Optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="coupon-expiry"
                    type="date"
                    className="bg-zinc-950 border-zinc-800 pl-10 text-zinc-300"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>

              {/* Max Uses */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="coupon-max-uses" className="text-zinc-400 text-xs">Max Uses (Total)</Label>
                  <Input
                    id="coupon-max-uses"
                    type="number"
                    placeholder="Infinite"
                    className="bg-zinc-950 border-zinc-800 text-sm"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="coupon-user-limit" className="text-zinc-400 text-xs">Per-User Limit</Label>
                  <Input
                    id="coupon-user-limit"
                    type="number"
                    className="bg-zinc-950 border-zinc-800 text-sm"
                    value={perUserLimit}
                    onChange={(e) => setPerUserLimit(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md transition-all mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Coupon Code"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Coupons Table Card */}
        <Card className="bg-zinc-950/40 border-zinc-800/80 backdrop-blur-sm shadow-xl md:col-span-2 overflow-hidden">
          <CardHeader className="border-b border-zinc-900 pb-4">
            <CardTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-400" />
              Active Coupons
            </CardTitle>
            <CardDescription>Manage your active promo codes, view campaign metrics and trigger active switches.</CardDescription>
          </CardHeader>
          <div className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2 text-zinc-500">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-xs">Loading campaign coupons...</p>
              </div>
            ) : coupons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-2">
                <Tag className="w-8 h-8 text-zinc-700" />
                <p className="text-sm">No coupons found. Create your first one on the left.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-zinc-900/40">
                  <TableRow className="border-b border-zinc-800/80">
                    <TableHead className="text-zinc-400 font-semibold tracking-wider text-xs uppercase pl-6">Code</TableHead>
                    <TableHead className="text-zinc-400 font-semibold tracking-wider text-xs uppercase">Discount</TableHead>
                    <TableHead className="text-zinc-400 font-semibold tracking-wider text-xs uppercase">Uses</TableHead>
                    <TableHead className="text-zinc-400 font-semibold tracking-wider text-xs uppercase">Restr.</TableHead>
                    <TableHead className="text-zinc-400 font-semibold tracking-wider text-xs uppercase">Expiry</TableHead>
                    <TableHead className="text-zinc-400 font-semibold tracking-wider text-xs uppercase">Active</TableHead>
                    <TableHead className="text-zinc-400 font-semibold tracking-wider text-xs uppercase pr-6 text-right">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => {
                    const isExpired = coupon.expiresAt && new Date() > new Date(coupon.expiresAt);
                    const isLimitReached = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses;
                    
                    let expiryLabel = "Never";
                    if (coupon.expiresAt) {
                      expiryLabel = new Date(coupon.expiresAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      });
                    }

                    return (
                      <TableRow key={coupon.id} className="hover:bg-zinc-900/10 border-b border-zinc-800/50 transition-colors">
                        {/* Code */}
                        <TableCell className="font-semibold py-3.5 pl-6">
                          <Badge variant="outline" className="bg-indigo-500/5 text-indigo-400 border-indigo-500/20 font-mono tracking-wide text-xs">
                            {coupon.code}
                          </Badge>
                        </TableCell>
                        
                        {/* Discount */}
                        <TableCell className="font-medium text-zinc-200">
                          {coupon.discountPercent}% OFF
                        </TableCell>

                        {/* Uses */}
                        <TableCell className="text-zinc-300 text-sm">
                          <span className="font-bold text-zinc-100">{coupon.usedCount}</span>
                          <span className="text-zinc-500"> / {coupon.maxUses ?? "∞"}</span>
                        </TableCell>

                        {/* Restriction */}
                        <TableCell className="text-zinc-400 text-xs">
                          {coupon.country ? (
                            <Badge variant="secondary" className="bg-sky-500/10 text-sky-400 border-none text-[10px] px-1.5 flex items-center gap-1 w-fit">
                              <Globe className="w-2.5 h-2.5" />
                              {coupon.country}
                            </Badge>
                          ) : (
                            <span className="text-zinc-500">-</span>
                          )}
                        </TableCell>

                        {/* Expiry */}
                        <TableCell className={`text-xs ${isExpired ? "text-rose-500 font-medium" : "text-zinc-400"}`}>
                          {expiryLabel}
                          {isExpired && <span className="block text-[10px] text-rose-500/80">Expired</span>}
                        </TableCell>

                        {/* Active Toggle */}
                        <TableCell className="py-3.5">
                          <Switch
                            checked={coupon.active && !isExpired && !isLimitReached}
                            disabled={isExpired || isLimitReached}
                            onCheckedChange={() => handleToggleActive(coupon.id, coupon.active)}
                          />
                        </TableCell>

                        {/* Delete Button */}
                        <TableCell className="py-3.5 pr-6 text-right">
                          <button
                            onClick={() => handleDelete(coupon.id, coupon.code)}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
