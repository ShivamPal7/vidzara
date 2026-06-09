import { getUsers } from "@/actions/admin/users";
import { UsersManagementClient } from "./users-client";

export default async function AdminUsersPage() {
  const users = await getUsers();

  // Map dates to strings to ensure clean serialization between Server and Client Components
  const serializedUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    subscription: user.subscription
      ? {
          ...user.subscription,
          trialEndsAt: user.subscription.trialEndsAt?.toISOString() || null,
          currentPeriodEnd: user.subscription.currentPeriodEnd?.toISOString() || null,
          createdAt: user.subscription.createdAt.toISOString(),
          updatedAt: user.subscription.updatedAt.toISOString(),
        }
      : null,
    userProfile: user.userProfile
      ? {
          ...user.userProfile,
          createdAt: user.userProfile.createdAt.toISOString(),
          updatedAt: user.userProfile.updatedAt.toISOString(),
        }
      : null,
    affiliate: user.affiliate
      ? {
          ...user.affiliate,
          commissionRate: user.affiliate.commissionRate.toString(),
          createdAt: user.affiliate.createdAt.toISOString(),
          updatedAt: user.affiliate.updatedAt.toISOString(),
        }
      : null,
    creditLogs: user.creditLogs?.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    })) || [],
  }));

  return (
    <div className="py-6">
      <UsersManagementClient users={serializedUsers} />
    </div>
  );
}
