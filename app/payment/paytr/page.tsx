import PaytrFrameClient from "./paytr-frame-client";

interface PaytrPaymentPageProps {
  searchParams: Promise<{ orderId?: string; payment_amount?: string; user_email?: string; user_name?: string; user_address?: string; user_phone?: string }>;
}

export default async function PaytrPaymentPage({ searchParams }: PaytrPaymentPageProps) {
  const { orderId = "", payment_amount = "", user_email = "", user_name = "", user_address = "", user_phone = "" } = await searchParams;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 space-y-4">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">PayTR Ödeme</h1>
        <p className="text-zinc-500 text-sm">Siparişiniz için güvenli ödeme ekranı aşağıda açılacaktır.</p>
        <PaytrFrameClient payload={{ merchant_oid: orderId, payment_amount, user_email, user_name, user_address, user_phone }} />
      </div>
    </div>
  );
}
