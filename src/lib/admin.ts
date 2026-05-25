export const isAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const adminEmails = process.env.ADMIN_EMAILS || "";
  const emails = adminEmails.split(",").map((e) => e.trim().toLowerCase());
  return emails.includes(email.toLowerCase());
};
