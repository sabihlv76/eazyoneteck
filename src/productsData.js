const generatedAsset = (fileName) =>
  `/products/${fileName}${/\.[a-z0-9]+$/i.test(fileName) ? '' : '.png'}`;

const catalogueProduct = ({
  badge,
  category,
  color,
  description,
  id,
  image,
  name,
  price,
  size,
  subcategory,
}) => ({
  id,
  name,
  category,
  subcategory,
  price,
  size,
  badge,
  color,
  image: generatedAsset(image),
  extraImages: [],
  video: null,
  description,
  benefits: [
    `Built for reliable everyday use`,
    `See the full price in RWF`,
    `Ask us for the color or configuration you want`,
  ],
  ingredients: color,
  instructions: 'Choose your preferred color and configuration, then add it to your cart or order on WhatsApp.',
});

export const products = [
  // ========== SMARTPHONES ==========
  {
    id: "iphone-15-pro-max-256gb",
    name: "iPhone 15 Pro Max 256GB",
    category: "Smartphones",
    subcategory: "Apple",
    price: 1800000,
    size: "256GB | Natural Titanium / Black Titanium / White Titanium",
    badge: "New Arrival",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=90",
    extraImages: [
      "https://images.unsplash.com/photo-1695048132801-9fa69be8478d?auto=format&fit=crop&w=800&q=90",
      "https://images.unsplash.com/photo-1695048132961-4fa2c6114eb9?auto=format&fit=crop&w=800&q=90"
    ],
    video: null,
    description: "The most powerful iPhone ever. Forged in aerospace-grade titanium with the A17 Pro chip, a customizable Action button, and a 48MP Pro camera system with 5× Telephoto zoom.",
    benefits: [
      "A17 Pro chip – industry's fastest mobile chip",
      "48MP Main + 12MP Ultra Wide + 12MP 5× Telephoto",
      "Ceramic Shield front, textured matte glass back",
      "Emergency SOS via satellite",
      "All-day battery life"
    ],
    ingredients: "Aerospace-grade titanium frame, Ceramic Shield",
    instructions: "Choose your color, then add it to your cart or send your order on WhatsApp."
  },
  {
    id: "iphone-14-pro-128gb",
    name: "iPhone 14 Pro 128GB",
    category: "Smartphones",
    subcategory: "Apple",
    price: 1100000,
    size: "128GB | Deep Purple / Gold / Silver / Space Black",
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&w=800&q=90",
    extraImages: [
      "https://images.unsplash.com/photo-1663465373305-6fbf637f99ee?auto=format&fit=crop&w=800&q=90"
    ],
    video: null,
    description: "Experience Dynamic Island, Always-On display, and Apple's ProRAW 48MP camera. Powered by A16 Bionic — incredibly fast, impossibly beautiful.",
    benefits: [
      "Dynamic Island – a whole new interaction model",
      "Always-On display for at-a-glance information",
      "48MP ProRAW Main camera",
      "Crash Detection & Emergency SOS via satellite",
      "Surgical-grade stainless steel design"
    ],
    ingredients: "Surgical-grade stainless steel, Ceramic Shield",
    instructions: "Choose your preferred storage and color before you order."
  },
  {
    id: "samsung-s24-ultra",
    name: "Samsung Galaxy S24 Ultra 256GB",
    category: "Smartphones",
    subcategory: "Samsung",
    price: 1650000,
    size: "256GB | Titanium Black / Gray / Violet / Yellow",
    badge: "Hot Deal",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=90",
    extraImages: [
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=90"
    ],
    video: null,
    description: "The Galaxy S24 Ultra redefines what a smartphone can do. With the built-in S Pen, 200MP camera, and Snapdragon 8 Gen 3, it is built for those who demand more.",
    benefits: [
      "200MP QSXGA camera for jaw-dropping detail",
      "Built-in S Pen for note-taking and creativity",
      "Snapdragon 8 Gen 3 flagship performance",
      "5000 mAh battery with 45W SuperFast charging",
      "Titanium frame for premium build quality"
    ],
    ingredients: "Titanium frame, Corning Gorilla Glass Armor",
    instructions: "Available in all colors. Book now to secure your unit."
  },
  {
    id: "iphone-13-mini",
    name: "iPhone 13 Mini 128GB",
    category: "Smartphones",
    subcategory: "Apple",
    price: 750000,
    size: "128GB | Midnight / Starlight / Blue / Pink / Red",
    badge: "Great Value",
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=90",
    extraImages: [],
    video: null,
    description: "The world's smallest, thinnest 5G phone. Compact and powerful with the A15 Bionic chip. Perfect for one-handed use without sacrificing performance.",
    benefits: [
      "A15 Bionic chip for powerful performance",
      "12MP dual camera with Night mode & Deep Fusion",
      "Ceramic Shield toughness",
      "5G capable for faster connectivity",
      "Super Retina XDR display"
    ],
    ingredients: "Aerospace-grade aluminum, Ceramic Shield",
    instructions: "Compact powerhouse. Choose your color at checkout."
  },

  // ========== AUDIO ==========
  {
    id: "airpods-pro-2nd-gen",
    name: "AirPods Pro (2nd Generation)",
    category: "Audio",
    subcategory: "Earbuds",
    price: 280000,
    size: "One Size – MagSafe Charging Case (USB-C)",
    badge: "Top Rated",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=90",
    extraImages: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=90",
      "https://images.unsplash.com/photo-1588423772273-dfc9ea5313fd?auto=format&fit=crop&w=800&q=90"
    ],
    video: null,
    description: "H2 chip powers next-level Active Noise Cancellation and Transparency Mode. Personalized Spatial Audio surrounds you in every direction.",
    benefits: [
      "2× more Active Noise Cancellation than gen 1",
      "Personalized Spatial Audio with dynamic head tracking",
      "Adaptive Transparency for hearing the world around you",
      "Up to 6 hours of listening time (up to 30 with case)",
      "Sweat and water resistant (IPX4)"
    ],
    ingredients: "White polycarbonate, silicone ear tips (S/M/L/XS)",
    instructions: "Pairs instantly with all your Apple devices."
  },
  {
    id: "jbl-charge-5",
    name: "JBL Charge 5 Bluetooth Speaker",
    category: "Audio",
    subcategory: "Speakers",
    price: 185000,
    size: "One Size | Black / Blue / Red / Teal",
    badge: "Party Ready",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=90",
    extraImages: [],
    video: null,
    description: "Go anywhere the adventure takes you with the JBL Charge 5. With up to 20 hours of play time and a built-in power bank, the music never stops.",
    benefits: [
      "20 hours of play time",
      "IP67 dustproof and waterproof",
      "Built-in power bank to charge your devices",
      "PartyBoost to pair two JBL speakers",
      "Powerful JBL Pro Sound with punchy bass"
    ],
    ingredients: "Rubber-coated housing, woven speaker grille",
    instructions: "Charge via USB-C. Use JBL Connect app for settings."
  },

  // ========== ACCESSORIES ==========
  {
    id: "iphone-15-magsafe-case",
    name: "Premium Luxury MagSafe Case (iPhone 15 Series)",
    category: "Accessories",
    subcategory: "Phone Cases",
    price: 35000,
    size: "iPhone 15 / 15 Plus / 15 Pro / 15 Pro Max",
    badge: "Trending",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=90",
    extraImages: [],
    video: null,
    description: "Military-grade drop protection with built-in MagSafe compatibility and a luxurious finish. Your iPhone deserves the best armor.",
    benefits: [
      "Military-grade drop protection (MIL-STD-810H)",
      "MagSafe compatible for wireless charging",
      "Raised bezels protect screen and camera",
      "Slim profile adds minimal bulk",
      "Available in multiple luxe finishes"
    ],
    ingredients: "TPU + PC hybrid with soft microfiber lining",
    instructions: "Choose your iPhone model before adding to cart."
  },
  {
    id: "apple-20w-usb-c-charger",
    name: "Apple 20W USB-C Power Adapter",
    category: "Accessories",
    subcategory: "Chargers",
    price: 25000,
    size: "One Size – USB-C connector",
    badge: "Genuine",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=90",
    extraImages: [],
    video: null,
    description: "The official Apple 20W USB-C Power Adapter delivers fast-charge capability for iPhone 8 and later, and can also charge your iPad and Mac.",
    benefits: [
      "Fast-charge compatible with iPhone 8 and later",
      "20W output for fast, reliable charging",
      "Compact and foldable plug design",
      "USB-C port for universal compatibility",
      "100% genuine Apple product"
    ],
    ingredients: "White polycarbonate housing",
    instructions: "Compatible with any USB-C cable. Genuine Apple product."
  },
  {
    id: "3d-privacy-screen-protector",
    name: "3D Privacy Tempered Glass Screen Protector",
    category: "Accessories",
    subcategory: "Screen Protectors",
    price: 15000,
    size: "iPhone 15 / 14 / 13 / 12 Series",
    badge: "Must Have",
    image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=90",
    extraImages: [],
    video: null,
    description: "Double protection: ultrahard 9H tempered glass guards your screen from scratches and drops, while the privacy filter keeps prying eyes away.",
    benefits: [
      "9H hardness – maximum scratch protection",
      "Privacy filter: 60° viewing angle limit",
      "Bubble-free, dust-proof adhesive",
      "Case-friendly edge-to-edge coverage",
      "Oleophobic anti-fingerprint coating"
    ],
    ingredients: "Tempered glass with privacy PET layer",
    instructions: "Clean screen thoroughly before application. Use included alcohol wipe."
  },

  // ========== COMPUTERS ==========
  {
    id: "macbook-pro-14-m3",
    name: "MacBook Pro 14\" M3 – 8GB RAM / 512GB SSD",
    category: "Computers",
    subcategory: "Laptops",
    price: 1900000,
    size: "14-inch | Space Black / Silver",
    badge: "Pro Choice",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=90",
    extraImages: [
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=90"
    ],
    video: null,
    description: "Mind-bending performance. The M3 chip delivers up to 60% faster CPU than MacBook Pro with M1. With a stunning Liquid Retina XDR display and up to 22 hours battery.",
    benefits: [
      "M3 chip: blazing-fast performance",
      "Liquid Retina XDR display with ProMotion",
      "Up to 22 hours of battery life",
      "MagSafe 3 charging port",
      "Three Thunderbolt 4 ports + HDMI + SD card"
    ],
    ingredients: "100% recycled aluminum enclosure",
    instructions: "Choose your RAM, SSD and finish before you order."
  },

  // ========== WATCHES ==========
  {
    id: "apple-watch-ultra-2",
    name: "Apple Watch Ultra 2 (49mm) – GPS + Cellular",
    category: "Watches",
    subcategory: "Smart Watches",
    price: 950000,
    size: "49mm | Alpine Loop / Ocean Band / Trail Loop",
    badge: "Adventure Edition",
    image: "/products/apple-watch-ultra-2.jpg",
    extraImages: [
      "/products/apple-watch-ultra-2.jpg"
    ],
    video: null,
    description: "The most capable and rugged Apple Watch ever. Designed for endurance athletes and adventurers with a Precision dual-frequency GPS and the brightest outdoor display.",
    benefits: [
      "Brightest Apple Watch display ever – 3000 nits",
      "Precision dual-frequency GPS for accuracy",
      "Up to 36 hours battery / 60hrs in Low Power Mode",
      "Water resistant to 100 meters deep",
      "Rugged aerospace-grade titanium case"
    ],
    ingredients: "Aerospace-grade titanium, Sapphire crystal",
    instructions: "Choose your preferred band style before you order."
  },
  {
    id: "apple-watch-series-9",
    name: "Apple Watch Series 9 (45mm)",
    category: "Watches",
    subcategory: "Smart Watches",
    price: 480000,
    size: "45mm | Midnight / Starlight / Pink / Silver / Red",
    badge: "Popular",
    image: "/products/apple-watch-series-9.jpg",
    extraImages: [],
    video: null,
    description: "The Series 9 comes with the new S9 chip and a magical new Double Tap gesture. With the always-on Retina display and advanced health sensors, it's smarter than ever.",
    benefits: [
      "New S9 chip – fastest Apple Watch chip ever",
      "Double Tap gesture to control watch with one hand",
      "Always-on Retina display",
      "Blood oxygen & ECG sensors",
      "Carbon neutral when paired with Sport Loop"
    ],
    ingredients: "Aluminum case, Ion-X glass or Sapphire crystal",
    instructions: "Choose your case material and band type before you order."
  },

  // Generated catalogue expansion: Rwanda-ready pricing and coordinated imagery.
  ...[
    catalogueProduct({ id: 'iphone-16-pro-max-256', name: 'iPhone 16 Pro Max 256GB', category: 'Smartphones', subcategory: 'Apple', price: 2950000, size: '256GB | 6.9-inch', badge: 'Latest Flagship', color: 'Desert Titanium', image: 'titanium-flagship', description: 'Large-screen titanium flagship with pro camera controls, fast performance and all-day battery life.' }),
    catalogueProduct({ id: 'iphone-16-pro-256', name: 'iPhone 16 Pro 256GB', category: 'Smartphones', subcategory: 'Apple', price: 2550000, size: '256GB | 6.3-inch', badge: 'Pro Choice', color: 'Natural Titanium', image: 'titanium-flagship', description: 'Compact pro flagship with a titanium frame, advanced camera system and high-refresh display.' }),
    catalogueProduct({ id: 'iphone-16-plus-128', name: 'iPhone 16 Plus 128GB', category: 'Smartphones', subcategory: 'Apple', price: 1950000, size: '128GB | 6.7-inch', badge: 'Big Screen', color: 'Ultramarine', image: 'smartphone-value', description: 'A bright large-screen phone with strong battery life and dependable everyday performance.' }),
    catalogueProduct({ id: 'iphone-16-128', name: 'iPhone 16 128GB', category: 'Smartphones', subcategory: 'Apple', price: 1650000, size: '128GB | 6.1-inch', badge: 'New Arrival', color: 'Teal', image: 'smartphone-value', description: 'Balanced current-generation phone with an excellent camera, responsive performance and comfortable size.' }),
    catalogueProduct({ id: 'iphone-15-128', name: 'iPhone 15 128GB', category: 'Smartphones', subcategory: 'Apple', price: 1250000, size: '128GB | 6.1-inch', badge: 'Best Seller', color: 'Blue', image: 'titanium-flagship', description: 'Popular USB-C iPhone with a bright display, dependable battery and excellent everyday camera.' }),
    catalogueProduct({ id: 'iphone-14-128', name: 'iPhone 14 128GB', category: 'Smartphones', subcategory: 'Apple', price: 950000, size: '128GB | 6.1-inch', badge: 'Great Value', color: 'Midnight', image: 'titanium-flagship', description: 'Reliable dual-camera iPhone with smooth performance and strong long-term software support.' }),
    catalogueProduct({ id: 'iphone-13-128', name: 'iPhone 13 128GB', category: 'Smartphones', subcategory: 'Apple', price: 720000, size: '128GB | 6.1-inch', badge: 'Popular', color: 'Starlight', image: 'smartphone-value', description: 'A proven everyday iPhone with a sharp OLED display, capable cameras and 5G connectivity.' }),
    catalogueProduct({ id: 'iphone-12-128', name: 'iPhone 12 128GB', category: 'Smartphones', subcategory: 'Apple', price: 540000, size: '128GB | 6.1-inch', badge: 'Budget Pick', color: 'Blue', image: 'smartphone-value', description: 'Affordable OLED iPhone with 5G performance and a lightweight flat-edge design.' }),

    catalogueProduct({ id: 'galaxy-s25-ultra-512', name: 'Samsung Galaxy S25 Ultra 512GB', category: 'Smartphones', subcategory: 'Samsung', price: 2850000, size: '512GB | 12GB RAM', badge: 'Latest Flagship', color: 'Titanium Silverblue', image: 'android-ultra', description: 'Premium Android flagship with built-in stylus, advanced zoom cameras and a large high-refresh display.' }),
    catalogueProduct({ id: 'galaxy-s25-plus-256', name: 'Samsung Galaxy S25+ 256GB', category: 'Smartphones', subcategory: 'Samsung', price: 1950000, size: '256GB | 12GB RAM', badge: 'New Arrival', color: 'Navy', image: 'android-ultra', description: 'Large-screen flagship performance in a slim design with fast charging and versatile cameras.' }),
    catalogueProduct({ id: 'pixel-9-pro-xl-256', name: 'Google Pixel 9 Pro XL 256GB', category: 'Smartphones', subcategory: 'Google', price: 1650000, size: '256GB | 16GB RAM', badge: 'Camera Pick', color: 'Obsidian', image: 'android-ultra', description: 'Photography-focused Android flagship with clean software, AI tools and a bright premium display.' }),
    catalogueProduct({ id: 'oneplus-13-256', name: 'OnePlus 13 256GB', category: 'Smartphones', subcategory: 'OnePlus', price: 1350000, size: '256GB | 12GB RAM', badge: 'Performance', color: 'Black Eclipse', image: 'android-ultra', description: 'Fast flagship phone with a smooth display, rapid charging and excellent multitasking performance.' }),
    catalogueProduct({ id: 'galaxy-z-fold-6-512', name: 'Samsung Galaxy Z Fold6 512GB', category: 'Smartphones', subcategory: 'Samsung', price: 2750000, size: '512GB | 12GB RAM', badge: 'Foldable', color: 'Silver Shadow', image: 'foldable-phone', description: 'Book-style foldable with a tablet-sized inner display for productivity, multitasking and entertainment.' }),
    catalogueProduct({ id: 'galaxy-z-flip-6-256', name: 'Samsung Galaxy Z Flip6 256GB', category: 'Smartphones', subcategory: 'Samsung', price: 1450000, size: '256GB | 12GB RAM', badge: 'Foldable', color: 'Graphite', image: 'foldable-phone', description: 'Pocket-friendly foldable phone with a useful cover screen and flexible hands-free camera modes.' }),
    catalogueProduct({ id: 'xiaomi-14t-pro-512', name: 'Xiaomi 14T Pro 512GB', category: 'Smartphones', subcategory: 'Xiaomi', price: 1050000, size: '512GB | 12GB RAM', badge: 'Power User', color: 'Titan Gray', image: 'android-ultra', description: 'High-performance Android phone with generous storage, fast charging and a versatile camera setup.' }),
    catalogueProduct({ id: 'galaxy-a55-256', name: 'Samsung Galaxy A55 5G 256GB', category: 'Smartphones', subcategory: 'Samsung', price: 580000, size: '256GB | 8GB RAM', badge: 'Best Seller', color: 'Awesome Navy', image: 'smartphone-value', description: 'Well-rounded midrange 5G phone with a premium metal frame, strong battery and vivid display.' }),
    catalogueProduct({ id: 'galaxy-a35-256', name: 'Samsung Galaxy A35 5G 256GB', category: 'Smartphones', subcategory: 'Samsung', price: 445000, size: '256GB | 8GB RAM', badge: 'Great Value', color: 'Iceblue', image: 'smartphone-value', description: 'Dependable midrange phone with optical image stabilization, expandable storage and long battery life.' }),
    catalogueProduct({ id: 'redmi-note-14-pro-256', name: 'Redmi Note 14 Pro 256GB', category: 'Smartphones', subcategory: 'Xiaomi', price: 395000, size: '256GB | 8GB RAM', badge: 'Value Choice', color: 'Midnight Black', image: 'smartphone-value', description: 'Feature-rich value phone with a sharp camera, vivid display and fast charging.' }),
    catalogueProduct({ id: 'tecno-camon-30-pro-256', name: 'Tecno Camon 30 Pro 256GB', category: 'Smartphones', subcategory: 'Tecno', price: 345000, size: '256GB | 8GB RAM', badge: 'Camera Value', color: 'Alps Snowy Silver', image: 'smartphone-value', description: 'Affordable camera-focused phone with ample storage, smooth display and stylish finish.' }),
    catalogueProduct({ id: 'infinix-note-40-pro-256', name: 'Infinix Note 40 Pro 256GB', category: 'Smartphones', subcategory: 'Infinix', price: 310000, size: '256GB | 8GB RAM', badge: 'Budget Pick', color: 'Vintage Green', image: 'smartphone-value', description: 'Accessible everyday smartphone with generous storage, fast charging and a bright curved display.' }),

    catalogueProduct({ id: 'galaxy-watch-ultra-2', name: 'Samsung Galaxy Watch Ultra2', category: 'Watches', subcategory: 'Samsung', price: 950000, size: '47mm | LTE | 64GB', badge: 'Latest Ultra', color: 'Titanium Gray', image: 'galaxy-watch-ultra2.jpg', description: 'Samsung premium adventure watch with dual-frequency GPS, a bright AMOLED display, titanium construction and extended battery life.' }),
    catalogueProduct({ id: 'apple-watch-series-10-46mm', name: 'Apple Watch Series 10 (46mm)', category: 'Watches', subcategory: 'Apple', price: 595000, size: '46mm | GPS', badge: 'Popular', color: 'Jet Black', image: 'apple-watch-series-10.jpg', description: 'A thin Apple Watch with a wide-angle OLED display, fast charging, health insights and useful everyday notifications.' }),
    catalogueProduct({ id: 'redmi-watch-5-active', name: 'Redmi Watch 5 Active', category: 'Watches', subcategory: 'Xiaomi', price: 65000, size: '2-inch LCD | Bluetooth Calling', badge: 'Fitness Value', color: 'Midnight Black', image: 'redmi-watch-5-active.jpg', description: 'Affordable Redmi smartwatch with a large display, Bluetooth calling, more than 140 workout modes and up to 18 days of battery life.' }),
    catalogueProduct({ id: 'apple-watch-se-3-44mm', name: 'Apple Watch SE 3 (44mm)', category: 'Watches', subcategory: 'Apple', price: 375000, size: '44mm | GPS', badge: 'Everyday Pick', color: 'Starlight', image: 'apple-watch-se-3.jpg', description: 'Accessible Apple Watch with an Always-On display, activity and sleep tracking, safety features and fast charging.' }),

    catalogueProduct({ id: 'airbook-13-m3-256', name: 'AirBook 13 M3 8GB / 256GB', category: 'Computers', subcategory: 'Laptops', price: 1550000, size: '13-inch | 8GB RAM | 256GB SSD', badge: 'Everyday Pro', color: 'Midnight', image: 'premium-laptops', description: 'Thin and quiet premium laptop with excellent battery life for study, work and travel.' }),
    catalogueProduct({ id: 'airbook-15-m3-512', name: 'AirBook 15 M3 16GB / 512GB', category: 'Computers', subcategory: 'Laptops', price: 2250000, size: '15-inch | 16GB RAM | 512GB SSD', badge: 'Creator Pick', color: 'Space Gray', image: 'premium-laptops', description: 'Large-screen lightweight laptop with fast performance for creative and professional workloads.' }),
    catalogueProduct({ id: 'creator-pro-16-rtx4060', name: 'Creator Pro 16 RTX 4060', category: 'Computers', subcategory: 'Laptops', price: 2450000, size: '16-inch | 32GB RAM | 1TB SSD', badge: 'Creator Pro', color: 'Graphite', image: 'performance-laptops', description: 'High-performance creator laptop with dedicated graphics, color-rich display and generous memory.' }),
    catalogueProduct({ id: 'gaming-core-15-rtx4070', name: 'Gaming Core 15 RTX 4070', category: 'Computers', subcategory: 'Laptops', price: 2750000, size: '15.6-inch | 16GB RAM | 1TB SSD', badge: 'Gaming', color: 'Shadow Black', image: 'performance-laptops', description: 'Powerful gaming laptop with high-refresh display, dedicated graphics and advanced cooling.' }),
    catalogueProduct({ id: 'workmate-14-i7-512', name: 'WorkMate 14 Core i7 16GB / 512GB', category: 'Computers', subcategory: 'Laptops', price: 1150000, size: '14-inch | 16GB RAM | 512GB SSD', badge: 'Business Pick', color: 'Silver', image: 'premium-laptops', description: 'Practical business laptop with a compact chassis, fast SSD and comfortable all-day keyboard.' }),

    catalogueProduct({ id: 'studio-buds-anc', name: 'Studio Buds ANC', category: 'Audio', subcategory: 'Earbuds', price: 185000, size: 'ANC | USB-C Case', badge: 'Top Rated', color: 'Matte Black', image: 'wireless-earbuds', description: 'Compact noise-cancelling earbuds with balanced sound, clear calls and pocket-friendly charging case.' }),
    catalogueProduct({ id: 'freepods-lite', name: 'FreePods Lite', category: 'Audio', subcategory: 'Earbuds', price: 18000, size: '40-hour playtime', badge: 'Budget Audio', color: 'White', image: 'wireless-earbuds', description: 'Affordable wireless earbuds for calls, commuting and everyday listening.' }),
    catalogueProduct({ id: 'quietmax-headphones', name: 'QuietMax Wireless Headphones', category: 'Audio', subcategory: 'Headphones', price: 260000, size: 'ANC | 45-hour battery', badge: 'Premium Sound', color: 'Warm Silver', image: 'wireless-headphones', description: 'Comfortable over-ear headphones with active noise cancellation and long battery life.' }),
    catalogueProduct({ id: 'boompod-10w', name: 'BoomPod 10W Speaker', category: 'Audio', subcategory: 'Speakers', price: 48000, size: '10W | IPX6', badge: 'Portable', color: 'Orange', image: 'portable-speakers', description: 'Compact portable speaker with lively sound, splash resistance and easy wireless pairing.' }),
    catalogueProduct({ id: 'soundbarrel-30w', name: 'SoundBarrel 30W Speaker', category: 'Audio', subcategory: 'Speakers', price: 135000, size: '30W | 18-hour battery', badge: 'Party Ready', color: 'Black', image: 'portable-speakers', description: 'Rugged wireless speaker with deeper bass, long playtime and outdoor-ready construction.' }),
    catalogueProduct({ id: 'openair-n2', name: 'OpenAir N2 Earbuds', category: 'Audio', subcategory: 'Earbuds', price: 30000, size: 'Open-ear | Bluetooth', badge: 'New Arrival', color: 'Graphite', image: 'wireless-earbuds', description: 'Open-ear wireless buds designed for comfortable listening while staying aware of surroundings.' }),

    catalogueProduct({ id: 'clear-magnetic-case', name: 'Clear Magnetic Protection Case', category: 'Accessories', subcategory: 'Phone Cases', price: 22000, size: 'Current iPhone and Android models', badge: 'Essential', color: 'Clear', image: 'mobile-accessories', description: 'Slim transparent case with magnetic charging support and reinforced corners.' }),
    catalogueProduct({ id: 'gan-charger-30w', name: 'Compact GaN USB-C Charger 30W', category: 'Accessories', subcategory: 'Chargers', price: 32000, size: '30W | USB-C', badge: 'Fast Charge', color: 'White', image: 'mobile-accessories', description: 'Travel-friendly fast charger for modern phones, earbuds and small tablets.' }),
    catalogueProduct({ id: 'braided-usbc-cable-2m', name: 'Braided USB-C Cable 2m', category: 'Accessories', subcategory: 'Cables', price: 12000, size: '2 metres | 60W', badge: 'Durable', color: 'Natural', image: 'mobile-accessories', description: 'Long reinforced charging cable with durable woven exterior and fast power support.' }),
    catalogueProduct({ id: 'powerbank-10000-slim', name: 'Slim Power Bank 10,000mAh', category: 'Accessories', subcategory: 'Power Banks', price: 45000, size: '10,000mAh | USB-C', badge: 'Travel Pick', color: 'White', image: 'mobile-accessories', description: 'Compact everyday backup battery with USB-C charging and clear battery indicators.' }),
    catalogueProduct({ id: 'powerbank-20000-fast', name: 'Fast Power Bank 20,000mAh', category: 'Accessories', subcategory: 'Power Banks', price: 72000, size: '20,000mAh | 22.5W', badge: 'High Capacity', color: 'Black', image: 'mobile-accessories', description: 'High-capacity portable charger for multiple phone recharges during travel and power interruptions.' }),
  ]
];
