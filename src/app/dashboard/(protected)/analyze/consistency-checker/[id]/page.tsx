import { redirect } from "next/navigation";

// The consistency checker no longer uses sub-routes.
// Redirect any old bookmarked URLs back to the main page.
export default function ConsistencyCheckerLegacyRedirect() {
  redirect("/dashboard/analyze/consistency-checker");
}
