// Server-side utilities for affiliate fraud detection and calculations

export function isGoogleProvider(accounts: Array<{ providerId: string }>): boolean {
  return accounts.some((a) => a.providerId === 'google');
}

export function isSelfReferral(affiliateUserId: string, newUserId: string): boolean {
  return affiliateUserId === newUserId;
}

export function isTempEmail(email: string): boolean {
  const tempDomains = [
    'mailinator.com', 'guerrillamail.com', 'temp-mail.org', 'throwaway.email',
    'yopmail.com', 'sharklasers.com', 'guerrillamail.info', 'spam4.me',
    'trashmail.com', 'mailnesia.com', 'mailnull.com', 'dispostable.com',
    '10minutemail.com', 'tempmail.com', 'throwam.com',
  ];
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  return tempDomains.includes(domain);
}

export function calculateMonetaryValue(credits: number, currency: 'INR' | 'USD'): number {
  if (currency === 'INR') return parseFloat((credits * 0.05).toFixed(2));
  return parseFloat((credits * 0.001).toFixed(4));
}

export const MIN_WITHDRAWAL_CREDITS: Record<'INR' | 'USD', number> = {
  INR: 20000, // 20000 credits = ₹1000
  USD: 20000, // 20000 credits ≈ $20
};

export const AFFILIATE_CREDITS_PER_SIGNUP = 5;
export const AFFILIATE_TO_USAGE_RATE = 20; // 20 affiliate credits = 1 usage credit
