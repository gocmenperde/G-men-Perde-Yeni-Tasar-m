-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "trackingCompany" TEXT,
ADD COLUMN     "trackingNumber" TEXT;

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "badge" TEXT,
    "ctaText" TEXT,
    "ctaHref" TEXT,
    "cta2Text" TEXT,
    "cta2Href" TEXT,
    "imageUrl" TEXT,
    "gradient" TEXT NOT NULL DEFAULT 'amber',
    "darkText" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarcodeImage" (
    "id" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "images" TEXT[],
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BarcodeImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "siteName" TEXT NOT NULL DEFAULT 'Göçmen Kırtasiye',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "announcementText" TEXT,
    "announcementActive" BOOLEAN NOT NULL DEFAULT false,
    "announcementColor" TEXT NOT NULL DEFAULT 'amber',
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "heroBadge" TEXT,
    "heroDesc" TEXT,
    "heroCtaPrimaryText" TEXT,
    "heroCtaPrimaryHref" TEXT,
    "heroCtaSecText" TEXT,
    "heroCtaSecHref" TEXT,
    "trustBadge1Text" TEXT,
    "trustBadge1Sub" TEXT,
    "trustBadge2Text" TEXT,
    "trustBadge2Sub" TEXT,
    "trustBadge3Text" TEXT,
    "trustBadge3Sub" TEXT,
    "stat1Value" TEXT,
    "stat1Label" TEXT,
    "stat2Value" TEXT,
    "stat2Label" TEXT,
    "stat3Value" TEXT,
    "stat3Label" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "address" TEXT,
    "socialInstagram" TEXT,
    "socialFacebook" TEXT,
    "socialTwitter" TEXT,
    "popularSetsJson" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotJob" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "status" TEXT NOT NULL DEFAULT 'idle',
    "mode" TEXT NOT NULL DEFAULT 'both',
    "delay" INTEGER NOT NULL DEFAULT 8,
    "offset" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "saved" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_productId_key" ON "Wishlist"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "BarcodeImage_barcode_key" ON "BarcodeImage"("barcode");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Product_isActive_createdAt_idx" ON "Product"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "Product_isActive_isFeatured_idx" ON "Product"("isActive", "isFeatured");

-- CreateIndex
CREATE INDEX "Product_isActive_categoryId_idx" ON "Product"("isActive", "categoryId");

-- CreateIndex
CREATE INDEX "Product_isActive_brandId_idx" ON "Product"("isActive", "brandId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");

-- CreateIndex
CREATE INDEX "Product_isActive_updatedAt_idx" ON "Product"("isActive", "updatedAt");

-- CreateIndex
CREATE INDEX "Product_isActive_stock_idx" ON "Product"("isActive", "stock");

-- CreateIndex
CREATE INDEX "Product_isActive_comparePrice_idx" ON "Product"("isActive", "comparePrice");

-- CreateIndex
CREATE INDEX "Product_isActive_price_idx" ON "Product"("isActive", "price");

-- CreateIndex
CREATE INDEX "Product_barcode_idx" ON "Product"("barcode");

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
