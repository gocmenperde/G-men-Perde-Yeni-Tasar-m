import Navbar from "@/components/store/navbar";
import Footer from "@/components/store/footer";
import CartProvider from "@/components/store/cart-provider";
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
