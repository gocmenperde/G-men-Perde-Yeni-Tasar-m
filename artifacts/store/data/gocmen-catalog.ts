import categories from "./gocmen-categories.source.json";
import products from "./gocmen-products.source.json";

export type SourceCatalogProduct = (typeof products)[number];
export type SourceCatalogCategory = (typeof categories)[number];

export const GOCMEN_CATEGORIES = categories as SourceCatalogCategory[];
export const GOCMEN_PRODUCTS = products as SourceCatalogProduct[];

export const GOCMEN_MEASURE_GUIDE = {
  title: "Doğru Ölçü Nasıl Alınır?",
  contentHtml: `
    <p>Perde ölçüsü alırken <strong>kornişten mermer seviyesine</strong> ve kullanım senaryonuza göre net ölçü girmeniz gerekir.</p>
    <h4>1) En (Genişlik) Ölçüsü</h4>
    <ul>
      <li>Kornişin sağ ve sol bitiş noktaları arasını ölçün.</li>
      <li>Duvar taşması isteniyorsa her iki yanda +10/+20 cm pay bırakabilirsiniz.</li>
      <li>Fon perde için en ölçüsünü kanat başına ayrı değerlendirin.</li>
    </ul>
    <h4>2) Boy (Yükseklik) Ölçüsü</h4>
    <ul>
      <li>Korniş altından zemine/mermere kadar olan mesafeyi ölçün.</li>
      <li>Tül perde için zeminden 1-2 cm yukarıda kalacak boy önerilir.</li>
      <li>Stor/zebra modellerde kasa başlangıcından bitiş noktasına kadar ölçün.</li>
    </ul>
    <h4>3) Pratik Kontrol Listesi</h4>
    <ul>
      <li>Ölçüyü en az 2 farklı noktadan tekrar alın.</li>
      <li>Ölçüleri <strong>metre cinsinden</strong> ve ondalıklı (örn: 2.45) girin.</li>
      <li>Petek, pencere kolu veya süpürgelik engellerini not edin.</li>
    </ul>
  `,
  images: [
    {
      url: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto2.jpg",
      alt: "Perde ölçü alma şeması",
      sortOrder: 0,
    },
  ],
} as const;
