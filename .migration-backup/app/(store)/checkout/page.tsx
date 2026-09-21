import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CheckoutClient from "@/components/store/checkout-client";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/checkout");
  return <CheckoutClient />;
}
