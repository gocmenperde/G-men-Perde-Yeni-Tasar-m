const requiredPaytrKeys = [
  'PAYTR_MERCHANT_ID',
  'PAYTR_MERCHANT_KEY',
  'PAYTR_MERCHANT_SALT',
] as const;

type PaytrKey = (typeof requiredPaytrKeys)[number];

export type PaytrEnv = {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  okUrl?: string;
  failUrl?: string;
  testMode: boolean;
};

function getRequiredEnv(key: PaytrKey) {
  const value = process.env[key]?.trim();
  if (value) {
    return value;
  }

  throw new Error(`${key} is not set. Configure it in Vercel Environment Variables.`);
}

export function getPaytrEnv(): PaytrEnv {
  return {
    merchantId: getRequiredEnv('PAYTR_MERCHANT_ID'),
    merchantKey: getRequiredEnv('PAYTR_MERCHANT_KEY'),
    merchantSalt: getRequiredEnv('PAYTR_MERCHANT_SALT'),
    okUrl: process.env.PAYTR_OK_URL?.trim(),
    failUrl: process.env.PAYTR_FAIL_URL?.trim(),
    testMode: process.env.PAYTR_TEST_MODE === '1' || process.env.PAYTR_TEST_MODE === 'true',
  };
}
