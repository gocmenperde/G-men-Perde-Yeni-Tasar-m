/**
 * Curated public image sources for taxonomy surfaces.
 *
 * Category imagery uses Unsplash editorial photos that match the category
 * rather than the old demo slugs. Brand imagery prefers official/Wikimedia
 * assets; initials are used only where a reachable public logo is not
 * available, so the brand name is still represented instead of a random icon.
 */
export const CATEGORY_IMAGES: Record<string, string> = {
  "kalemler-yazi-gerecleri": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=900&h=720&fit=crop&auto=format&q=88",
  "defterler-ajandalar": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=900&h=720&fit=crop&auto=format&q=88",
  "sanat-malzemeleri": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&h=720&fit=crop&auto=format&q=88",
  "okul-gerecleri": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&h=720&fit=crop&auto=format&q=88",
  "ofis-malzemeleri": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900&h=720&fit=crop&auto=format&q=88",
  "boyalar-renkler": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900&h=720&fit=crop&auto=format&q=88",
  "kagit-karton": "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=900&h=720&fit=crop&auto=format&q=88",
  "dosyalama-duzenleme": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=900&h=720&fit=crop&auto=format&q=88",
  "kesici-yapistirici": "https://images.unsplash.com/photo-1568667256549-094345857637?w=900&h=720&fit=crop&auto=format&q=88",
  "cizim-teknik": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&h=720&fit=crop&auto=format&q=88",
  "keceli-kalem": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&h=560&fit=crop&auto=format&q=88",
  "kuru-boya-kalemi": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700&h=560&fit=crop&auto=format&q=88",
  "versatil-kalem": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&h=560&fit=crop&auto=format&q=88",
  "tukenmez-kalem": "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=700&h=560&fit=crop&auto=format&q=88",
  "dolma-kalem": "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=700&h=560&fit=crop&auto=format&q=88",
  "fineliner": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&h=560&fit=crop&auto=format&q=88",
  "spiralli-defter": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=700&h=560&fit=crop&auto=format&q=88",
  "gunluk-ajanda": "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=700&h=560&fit=crop&auto=format&q=88",
  "dikis-defteri": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=700&h=560&fit=crop&auto=format&q=88",
  "kuru-boya": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700&h=560&fit=crop&auto=format&q=88",
  "sulu-boya": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=700&h=560&fit=crop&auto=format&q=88",
  "yagli-boya": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=700&h=560&fit=crop&auto=format&q=88",
  "pastel-boya": "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=700&h=560&fit=crop&auto=format&q=88",
  "akrilik-boya": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=700&h=560&fit=crop&auto=format&q=88",
  "zimba-delgec": "https://images.unsplash.com/photo-1568667256549-094345857637?w=700&h=560&fit=crop&auto=format&q=88",
  "zimba": "https://images.unsplash.com/photo-1568667256549-094345857637?w=700&h=560&fit=crop&auto=format&q=88",
  "delgec": "https://images.unsplash.com/photo-1568667256549-094345857637?w=700&h=560&fit=crop&auto=format&q=88",
  "yapiskali-not": "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=700&h=560&fit=crop&auto=format&q=88",
  "fotokopi-kagidi": "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=700&h=560&fit=crop&auto=format&q=88",
  "renkli-karton": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700&h=560&fit=crop&auto=format&q=88",
  "silgi": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&h=560&fit=crop&auto=format&q=88",
  "cetvel-gonye": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&h=560&fit=crop&auto=format&q=88",
  "makas": "https://images.unsplash.com/photo-1568667256549-094345857637?w=700&h=560&fit=crop&auto=format&q=88",
  "pergel": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&h=560&fit=crop&auto=format&q=88",
};

const CATEGORY_IMAGE_ALIASES: Record<string, keyof typeof CATEGORY_IMAGES> = {
  kirtasiye: "kalemler-yazi-gerecleri",
  "kalem": "kalemler-yazi-gerecleri",
  "kalemler": "kalemler-yazi-gerecleri",
  "kareli-defter": "defterler-ajandalar",
  defter: "defterler-ajandalar",
  defterler: "defterler-ajandalar",
  "sulu-boyalar": "sanat-malzemeleri",
  sanat: "sanat-malzemeleri",
  boya: "boyalar-renkler",
  boyalar: "boyalar-renkler",
  "okul-gerecleri": "okul-gerecleri",
  okul: "okul-gerecleri",
  "ofis-kirtasiye": "ofis-malzemeleri",
  ofis: "ofis-malzemeleri",
  "fotokopi-kagidi": "kagit-karton",
  "kagit": "kagit-karton",
  "dosya-klasor": "dosyalama-duzenleme",
  dosyalama: "dosyalama-duzenleme",
  "kesici-yapistirici": "kesici-yapistirici",
};

const CATEGORY_KEYWORD_ALIASES: Array<[string, keyof typeof CATEGORY_IMAGES]> = [
  ["boya", "boyalar-renkler"],
  ["renk", "boyalar-renkler"],
  ["kalem", "kalemler-yazi-gerecleri"],
  ["defter", "defterler-ajandalar"],
  ["ajanda", "defterler-ajandalar"],
  ["okul", "okul-gerecleri"],
  ["ofis", "ofis-malzemeleri"],
  ["dosya", "dosyalama-duzenleme"],
  ["klasor", "dosyalama-duzenleme"],
  ["kagit", "kagit-karton"],
  ["karton", "kagit-karton"],
  ["makas", "kesici-yapistirici"],
  ["yapistir", "kesici-yapistirici"],
];

export function getCategoryImage(category: { slug?: string | null; image?: string | null }) {
  const slug = category.slug?.trim().toLocaleLowerCase("tr-TR") ?? "";
  const alias = CATEGORY_IMAGE_ALIASES[slug];
  const keywordAlias = CATEGORY_KEYWORD_ALIASES.find(([keyword]) => slug.includes(keyword))?.[1];
  const storedImage = category.image?.trim() || null;
  return storedImage
    ?? CATEGORY_IMAGES[slug]
    ?? (alias ? CATEGORY_IMAGES[alias] : null)
    ?? (keywordAlias ? CATEGORY_IMAGES[keywordAlias] : null)
    ?? CATEGORY_IMAGES["ofis-malzemeleri"];
}

export function getCuratedCategoryImage(slug?: string | null) {
  return getCategoryImage({ slug, image: null });
}

const initialsImage = (name: string, background: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=fff&size=128&bold=true&format=png`;

export const BRAND_IMAGES: Record<string, string> = {
  "sudor": "https://sudor.com.tr/wp-content/uploads/2021/08/sudorlogo-130x100-1.png",
  "mikro": "https://commons.wikimedia.org/wiki/Special:FilePath/Mikro%20Logo.png?width=320",
  "pensan": initialsImage("Pensan", "1d4ed8"),
  "fatih": "https://www.fatihkalem.com.tr/wp-content/uploads/2026/07/logo.png",
  "masis": initialsImage("Masis", "26353b"),
  "delta": initialsImage("Delta", "a86b24"),
  "keskin-color": initialsImage("Keskin Color", "7c3aed"),
  "globox": "https://icons.duckduckgo.com/ip3/helloglobo.com.ico",
  "faber-castell": "https://upload.wikimedia.org/wikipedia/commons/3/32/Faber-castell.png",
  "staedtler": "https://upload.wikimedia.org/wikipedia/commons/3/3d/Staedtler_head_mars_logo_1908.jpg",
  "pelikan": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Pelikan_logo_1921.png",
  "pentel": "https://upload.wikimedia.org/wikipedia/commons/d/db/Dtb_pentel_logo.png",
  "koh-i-noor": "https://icons.duckduckgo.com/ip3/www.koh-i-noor.cz.ico",
  "stabilo": "https://icons.duckduckgo.com/ip3/www.stabilo.com.ico",
  "moleskine": "https://icons.duckduckgo.com/ip3/www.moleskine.com.ico",
};