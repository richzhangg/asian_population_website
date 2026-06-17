import type { City } from "@/types/city";

export const CITIES: City[] = [
  {
    id: "1",
    name: "Tokyo",
    slug: "tokyo",
    country: "Japan",
    countryCode: "JPN",
    region: "East Asia",
    latitude: 35.6762,
    longitude: 139.6503,
    isMegacity: true,
    cityTier: 1,
    description:
      "The world's largest metropolitan area, pioneering aging-society urban policy.",
    summary:
      "Tokyo is one of Asia's most important megacities and a key case for studying aging, low fertility, and changing urban lifestyles. As Japan's political, economic, and cultural center, Tokyo continues to attract people from across the country, yet it also faces shrinking household size, rising single-person living, delayed marriage, and a growing elderly population. Tokyo's demographic patterns reflect the tensions between economic concentration, high living costs, work-centered lifestyles, and changing family expectations in a highly developed Asian city.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
  },
  {
    id: "2",
    name: "Seoul",
    slug: "seoul",
    country: "South Korea",
    countryCode: "KOR",
    region: "East Asia",
    latitude: 37.5665,
    longitude: 126.978,
    isMegacity: true,
    cityTier: 1,
    description:
      "A hyper-connected capital navigating record-low fertility and soaring housing costs.",
    summary:
      "Seoul is the core of South Korea's modernization and a major example of rapid urbanization in East Asia. A large share of the country's population, talent, and resources is concentrated in Seoul and its surrounding metropolitan area, making it the center of education, employment, technology, and popular culture. At the same time, Seoul faces very low birth rates, strong housing pressure, intense educational competition, and delayed family formation. Its population trends offer insight into how opportunity, social mobility, and cultural change interact in contemporary Korean society.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&q=80",
  },
  {
    id: "3",
    name: "Shanghai",
    slug: "shanghai",
    country: "China",
    countryCode: "CHN",
    region: "East Asia",
    latitude: 31.2304,
    longitude: 121.4737,
    isMegacity: true,
    cityTier: 1,
    description:
      "China's financial powerhouse undergoing rapid demographic restructuring post one-child policy.",
    summary:
      "Shanghai is one of China's most globalized and influential cities, shaped by migration, commerce, and urban transformation. As a leading center of finance, trade, technology, and culture, it has long attracted workers and professionals from across China, creating a highly diverse urban population. Shanghai's demographic trends reflect broader issues in Chinese urbanization, including internal migration, aging, housing pressure, educational competition, and the relationship between local identity and international lifestyle. It is an important case for understanding how economic openness reshapes population and culture.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1537944434965-cf4679d1a598?w=800&q=80",
  },
  {
    id: "4",
    name: "Hong Kong",
    slug: "hong-kong",
    country: "China (SAR)",
    countryCode: "HKG",
    region: "East Asia",
    latitude: 22.3193,
    longitude: 114.1694,
    isMegacity: false,
    cityTier: 1,
    description:
      "A global financial hub with some of the world's most extreme housing unaffordability.",
    summary:
      "Hong Kong is a dense, international city shaped by migration, trade, and its unique historical development. Its population structure is closely connected to cross-border mobility, global finance, limited land supply, and a highly urban way of life. The city offers an important perspective on how housing costs, aging, family change, and migration influence everyday life in a compact metropolitan setting. Hong Kong's blend of Cantonese culture, international business culture, and long-standing global connections makes it especially valuable for cultural and demographic study.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?w=800&q=80",
  },
  {
    id: "5",
    name: "Singapore",
    slug: "singapore",
    country: "Singapore",
    countryCode: "SGP",
    region: "Southeast Asia",
    latitude: 1.3521,
    longitude: 103.8198,
    isMegacity: false,
    cityTier: 1,
    description:
      "A city-state model for housing policy and managed migration in Southeast Asia.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
  },
  {
    id: "6",
    name: "Bangkok",
    slug: "bangkok",
    country: "Thailand",
    countryCode: "THA",
    region: "Southeast Asia",
    latitude: 13.7563,
    longitude: 100.5018,
    isMegacity: true,
    cityTier: 1,
    description:
      "A primate city absorbing rural-urban migrants while Thailand ages rapidly.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
  },
  {
    id: "7",
    name: "Jakarta",
    slug: "jakarta",
    country: "Indonesia",
    countryCode: "IDN",
    region: "Southeast Asia",
    latitude: -6.2088,
    longitude: 106.8456,
    isMegacity: true,
    cityTier: 1,
    description:
      "A sinking megacity being replaced by Nusantara as Indonesia's capital.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=800&q=80",
  },
  {
    id: "8",
    name: "Mumbai",
    slug: "mumbai",
    country: "India",
    countryCode: "IND",
    region: "South Asia",
    latitude: 19.076,
    longitude: 72.8777,
    isMegacity: true,
    cityTier: 1,
    description:
      "India's financial capital with extreme density, migration pressure and informal housing.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&q=80",
  },
  {
    id: "9",
    name: "Manila",
    slug: "manila",
    country: "Philippines",
    countryCode: "PHL",
    region: "Southeast Asia",
    latitude: 14.5995,
    longitude: 120.9842,
    isMegacity: true,
    cityTier: 2,
    description:
      "One of the world's densest cities, driven by remittance economics and young demographics.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1607873637041-2aecc9ef8f18?w=800&q=80",
  },
  {
    id: "10",
    name: "Shenzhen",
    slug: "shenzhen",
    country: "China",
    countryCode: "CHN",
    region: "East Asia",
    latitude: 22.5431,
    longitude: 114.0579,
    isMegacity: true,
    cityTier: 1,
    description:
      "From fishing village to tech megacity in 40 years — the fastest urbanization in history.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1591988942778-c38a7c956c49?w=800&q=80",
  },
];
