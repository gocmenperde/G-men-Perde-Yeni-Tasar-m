export type CurtainMeasurementKind = "tul" | "fon" | "area" | "meter" | "none";

export type CurtainDimensions = {
  width?: number;
  height?: number;
  area?: number;
  pile?: string;
  pileFactor?: number;
  unit?: string;
};

const PILE_OPTIONS = [
  { value: "1.5", label: "Az pile (1,5)" },
  { value: "2", label: "Orta pile (2)" },
  { value: "2.5", label: "Sık pile (2,5)" },
  { value: "3", label: "Çok sık pile (3)" },
] as const;

export function getPileOptions() {
  return PILE_OPTIONS;
}

export function getCurtainMeasurementKind(product: {
  category?: { slug?: string | null; name?: string | null } | null;
  isMeter?: boolean | null;
  isSquareMeter?: boolean | null;
}): CurtainMeasurementKind {
  const slug = product.category?.slug ?? "";
  if (slug === "tul-perde") return "tul";
  if (slug === "fonperdeler") return "fon";
  if (["stor-perde", "zebra-perde", "plise-perde"].includes(slug)) return "area";
  if (product.isSquareMeter) return "area";
  if (product.isMeter) return "meter";
  return "none";
}

export function getCurtainMeasurementRequirements(product: {
  category?: { slug?: string | null; name?: string | null } | null;
  isMeter?: boolean | null;
  isSquareMeter?: boolean | null;
  requiresWidth?: boolean | null;
  requiresHeight?: boolean | null;
}) {
  const kind = getCurtainMeasurementKind(product);
  if (kind === "tul") {
    return {
      kind,
      requiresWidth: true,
      requiresHeight: true,
      requiresPile: true,
      title: "Tül perde ölçüsü",
      description: "En × pile × metre fiyatı üzerinden hesaplanır.",
    };
  }
  if (kind === "fon") {
    return {
      kind,
      requiresWidth: false,
      requiresHeight: true,
      requiresPile: false,
      title: "Fon perde boyu",
      description: "Boy bilgisi sipariş için alınır; netleştirmek için sizinle iletişime geçilir.",
    };
  }
  if (kind === "area") {
    return {
      kind,
      requiresWidth: true,
      requiresHeight: true,
      requiresPile: false,
      title: "En ve boy ölçüsü",
      description: "En × boy × m² fiyatı üzerinden hesaplanır.",
    };
  }
  if (kind === "meter") {
    return {
      kind,
      requiresWidth: Boolean(product.requiresWidth || product.isMeter),
      requiresHeight: Boolean(product.requiresHeight),
      requiresPile: false,
      title: "Özel ölçü",
      description: "Metre fiyatı üzerinden hesaplanır.",
    };
  }
  return {
    kind,
    requiresWidth: Boolean(product.requiresWidth),
    requiresHeight: Boolean(product.requiresHeight),
    requiresPile: false,
    title: product.requiresWidth || product.requiresHeight ? "Özel ölçü" : "",
    description: product.requiresWidth || product.requiresHeight ? "Sipariş için ölçü bilgisi alınır." : "",
  };
}

export function calculateCurtainPrice(
  product: { price: unknown; category?: { slug?: string | null } | null; isMeter?: boolean | null; isSquareMeter?: boolean | null },
  dimensions: CurtainDimensions = {},
) {
  const basePrice = Number(product.price);
  const kind = getCurtainMeasurementKind(product);
  const width = Number(dimensions.width);
  const height = Number(dimensions.height);
  const pileFactor = Number(dimensions.pileFactor ?? 2);

  if (!Number.isFinite(basePrice) || basePrice <= 0) return 0;
  if (kind === "tul" && width > 0 && pileFactor > 0) return basePrice * width * pileFactor;
  if (kind === "area" && width > 0 && height > 0) return basePrice * width * height;
  if (kind === "meter" && width > 0) return basePrice * width;
  return basePrice;
}

export function dimensionsAreComplete(
  product: {
    category?: { slug?: string | null; name?: string | null } | null;
    isMeter?: boolean | null;
    isSquareMeter?: boolean | null;
    requiresWidth?: boolean | null;
    requiresHeight?: boolean | null;
  },
  dimensions: CurtainDimensions = {},
) {
  const requirements = getCurtainMeasurementRequirements(product);
  const width = Number(dimensions.width);
  const height = Number(dimensions.height);
  const pileFactor = Number(dimensions.pileFactor);
  return (
    (!requirements.requiresWidth || (Number.isFinite(width) && width > 0)) &&
    (!requirements.requiresHeight || (Number.isFinite(height) && height > 0)) &&
    (!requirements.requiresPile || (Number.isFinite(pileFactor) && pileFactor > 0))
  );
}