import { Suspense } from "react";
import Footer from "@/components/store/footer";
import Navbar from "@/components/store/navbar";
import AnnouncementBar from "@/components/store/announcement-bar";
import MobileBottomNav from "@/components/store/bottom-nav";
import BackToTop from "@/components/store/back-to-top";
import WhatsAppFAB from "@/components/store/whatsapp-fab";
import CookieConsent from "@/components/store/cookie-consent";
import PageProgress from "@/components/store/page-progress";
import { getCachedSettings } from "@/lib/settings";
import { getCachedMenuCategories } from "@/lib/homepage-data";

// Store settings stay cached until an admin mutation invalidates their tags or
// paths. Interactive client widgets remain client-side.
export const revalidate = false;

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getCachedSettings().catch(() => null);
  const menuCategories = await getCachedMenuCategories().catch(() => []);

  let announcementMessages: { icon: string; text: string }[] | null = null;
  if (settings?.announcementText) {
    try {
      const parsed = JSON.parse(settings.announcementText);
      if (Array.isArray(parsed)) announcementMessages = parsed;
      else announcementMessages = [{ icon: "Sparkles", text: settings.announcementText }];
    } catch {
      announcementMessages = [{ icon: "Sparkles", text: settings.announcementText }];
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--cream)]">
      <Suspense fallback={null}>
        <PageProgress />
      </Suspense>

      {/* Fixed header group — announcement(36px) + navbar(64px) = 100px when active. */}
      <div className="fixed inset-x-0 top-0 z-50 flex flex-col store-header-safe-area">
        <AnnouncementBar
          messages={announcementMessages}
          color={settings?.announcementColor ?? "amber"}
          active={settings?.announcementActive !== false}
        />
        <Navbar
          logoUrl={settings?.logoUrl ?? null}
          siteName={settings?.siteName ?? "Göçmen Perde"}
          categories={menuCategories}
        />
      </div>

      <div
        className={`store-header-spacer flex-shrink-0 ${
          settings?.announcementActive === false
            ? "store-header-spacer--compact"
            : "store-header-spacer--with-announcement"
        }`}
        aria-hidden="true"
      />

      <main className="flex-1 pb-mobile-nav">{children}</main>
      <Footer settings={settings} />

      <Suspense fallback={null}>
        <MobileBottomNav />
      </Suspense>
      <BackToTop />
      <WhatsAppFAB whatsapp={settings?.whatsapp} siteName={settings?.siteName} />
      <CookieConsent />
    </div>
  );
}
