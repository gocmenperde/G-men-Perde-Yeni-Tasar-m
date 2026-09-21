--
-- PostgreSQL database dump
--

-- Dumped from database version 17.10 (986efc8)
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
--

SET default_tablespace = '';

SET default_table_access_method = heap;

--
--

--
--

--
--

--
--

--
--

--
--

--
--

--
--

--
--

--
-- Name: Account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


--
-- Name: Address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Address" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    "fullName" text NOT NULL,
    phone text NOT NULL,
    city text NOT NULL,
    district text NOT NULL,
    address text NOT NULL,
    "zipCode" text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Banner; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Banner" (
    id text NOT NULL,
    title text NOT NULL,
    subtitle text,
    badge text,
    "ctaText" text,
    "ctaHref" text,
    "cta2Text" text,
    "cta2Href" text,
    "imageUrl" text,
    gradient text DEFAULT 'amber'::text NOT NULL,
    "darkText" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BarcodeImage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BarcodeImage" (
    id text NOT NULL,
    barcode text NOT NULL,
    images text[],
    source text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BotJob; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BotJob" (
    id text DEFAULT 'singleton'::text NOT NULL,
    status text DEFAULT 'idle'::text NOT NULL,
    mode text DEFAULT 'both'::text NOT NULL,
    delay integer DEFAULT 8 NOT NULL,
    "offset" integer DEFAULT 0 NOT NULL,
    total integer DEFAULT 0 NOT NULL,
    processed integer DEFAULT 0 NOT NULL,
    saved integer DEFAULT 0 NOT NULL,
    skipped integer DEFAULT 0 NOT NULL,
    errors integer DEFAULT 0 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Brand; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Brand" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Cart" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CartItem" (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL
);


--
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    image text,
    "parentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Coupon; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Coupon" (
    id text NOT NULL,
    code text NOT NULL,
    type text NOT NULL,
    value numeric(10,2) NOT NULL,
    "minOrderAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "maxUses" integer,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: DeletedProduct; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DeletedProduct" (
    id text NOT NULL,
    slug text NOT NULL,
    name text,
    "deletedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    shipping numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    "couponId" text,
    "addressId" text,
    "stripeId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "adminNote" text,
    "trackingCompany" text,
    "trackingNumber" text
);


--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL
);


--
-- Name: Product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    sku text,
    description text,
    price numeric(10,2) NOT NULL,
    "comparePrice" numeric(10,2),
    stock integer DEFAULT 0 NOT NULL,
    images text[],
    "isFeatured" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    barcode text,
    weight numeric(10,3),
    tags text[],
    "metaTitle" text,
    "metaDescription" text,
    "categoryId" text,
    "brandId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: RestockNotification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RestockNotification" (
    id text NOT NULL,
    "productId" text NOT NULL,
    email text NOT NULL,
    "notifiedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Review; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    rating integer NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: SiteSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SiteSettings" (
    id text DEFAULT 'global'::text NOT NULL,
    "siteName" text DEFAULT 'Göçmen Kırtasiye'::text NOT NULL,
    "logoUrl" text,
    "faviconUrl" text,
    "announcementText" text,
    "announcementActive" boolean DEFAULT false NOT NULL,
    "announcementColor" text DEFAULT 'amber'::text NOT NULL,
    "heroTitle" text,
    "heroSubtitle" text,
    "heroBadge" text,
    "heroDesc" text,
    "heroCtaPrimaryText" text,
    "heroCtaPrimaryHref" text,
    "heroCtaSecText" text,
    "heroCtaSecHref" text,
    "trustBadge1Text" text,
    "trustBadge1Sub" text,
    "trustBadge2Text" text,
    "trustBadge2Sub" text,
    "trustBadge3Text" text,
    "trustBadge3Sub" text,
    "stat1Value" text,
    "stat1Label" text,
    "stat2Value" text,
    "stat2Label" text,
    "stat3Value" text,
    "stat3Label" text,
    phone text,
    whatsapp text,
    email text,
    address text,
    "socialInstagram" text,
    "socialFacebook" text,
    "socialTwitter" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "homepageVideoSource" text,
    "homepageVideoUrl" text,
    "popularSetsJson" text
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    image text,
    password text,
    role text DEFAULT 'USER'::text NOT NULL,
    "isBlocked" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: Wishlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Wishlist" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
--

--
--

--
--

--
--

--
--

--
--

--
--

--
--

--
--

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Address; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Banner; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: BarcodeImage; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: BotJob; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Brand; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: DeletedProduct; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: RestockNotification; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: SiteSettings; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: -
--

--
-- Data for Name: Wishlist; Type: TABLE DATA; Schema: public; Owner: -
--

--
--

--
--

--
--

--
--

--
--

--
--

--
--

--
--

--
--

--
--

--
--

--
--

--
--

--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- Name: Banner Banner_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Banner"
    ADD CONSTRAINT "Banner_pkey" PRIMARY KEY (id);


--
-- Name: BarcodeImage BarcodeImage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BarcodeImage"
    ADD CONSTRAINT "BarcodeImage_pkey" PRIMARY KEY (id);


--
-- Name: BotJob BotJob_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BotJob"
    ADD CONSTRAINT "BotJob_pkey" PRIMARY KEY (id);


--
-- Name: Brand Brand_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Brand"
    ADD CONSTRAINT "Brand_pkey" PRIMARY KEY (id);


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Coupon Coupon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY (id);


--
-- Name: DeletedProduct DeletedProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DeletedProduct"
    ADD CONSTRAINT "DeletedProduct_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: RestockNotification RestockNotification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RestockNotification"
    ADD CONSTRAINT "RestockNotification_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: SiteSettings SiteSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SiteSettings"
    ADD CONSTRAINT "SiteSettings_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Wishlist Wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_pkey" PRIMARY KEY (id);


--
--

--
--

--
--

--
--

--
--

--
--

--
--

--
--

--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: BarcodeImage_barcode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BarcodeImage_barcode_key" ON public."BarcodeImage" USING btree (barcode);


--
-- Name: Brand_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Brand_slug_key" ON public."Brand" USING btree (slug);


--
-- Name: Cart_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Cart_userId_key" ON public."Cart" USING btree ("userId");


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Coupon_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Coupon_code_key" ON public."Coupon" USING btree (code);


--
-- Name: DeletedProduct_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DeletedProduct_slug_idx" ON public."DeletedProduct" USING btree (slug);


--
-- Name: DeletedProduct_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "DeletedProduct_slug_key" ON public."DeletedProduct" USING btree (slug);


--
-- Name: Order_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_createdAt_idx" ON public."Order" USING btree ("createdAt");


--
-- Name: Order_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_status_idx" ON public."Order" USING btree (status);


--
-- Name: Order_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_userId_idx" ON public."Order" USING btree ("userId");


--
-- Name: Product_barcode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_barcode_idx" ON public."Product" USING btree (barcode);


--
-- Name: Product_brandId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_brandId_idx" ON public."Product" USING btree ("brandId");


--
-- Name: Product_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_categoryId_idx" ON public."Product" USING btree ("categoryId");


--
-- Name: Product_isActive_brandId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_isActive_brandId_idx" ON public."Product" USING btree ("isActive", "brandId");


--
-- Name: Product_isActive_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_isActive_categoryId_idx" ON public."Product" USING btree ("isActive", "categoryId");


--
-- Name: Product_isActive_comparePrice_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_isActive_comparePrice_idx" ON public."Product" USING btree ("isActive", "comparePrice");


--
-- Name: Product_isActive_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_isActive_createdAt_idx" ON public."Product" USING btree ("isActive", "createdAt");


--
-- Name: Product_isActive_isFeatured_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_isActive_isFeatured_idx" ON public."Product" USING btree ("isActive", "isFeatured");


--
-- Name: Product_isActive_price_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_isActive_price_idx" ON public."Product" USING btree ("isActive", price);


--
-- Name: Product_isActive_stock_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_isActive_stock_idx" ON public."Product" USING btree ("isActive", stock);


--
-- Name: Product_isActive_updatedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_isActive_updatedAt_idx" ON public."Product" USING btree ("isActive", "updatedAt");


--
-- Name: Product_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Product_sku_key" ON public."Product" USING btree (sku);


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: RestockNotification_notifiedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RestockNotification_notifiedAt_idx" ON public."RestockNotification" USING btree ("notifiedAt");


--
-- Name: RestockNotification_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RestockNotification_productId_idx" ON public."RestockNotification" USING btree ("productId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: Wishlist_userId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Wishlist_userId_productId_key" ON public."Wishlist" USING btree ("userId", "productId");


--
--

--
--

--
--

--
--

--
--

--
--

--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Cart Cart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public."Coupon"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public."Brand"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Review Review_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Wishlist Wishlist_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Wishlist Wishlist_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--