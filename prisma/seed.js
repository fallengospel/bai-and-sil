const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const LOCATIONS = [
  'Makati City', 'Taguig City', 'Quezon City', 'Pasig City',
  'Mandaluyong City', 'Manila City', 'Las Piñas City', 'Parañaque City',
  'Muntinlupa City', 'Pasay City', 'Caloocan City', 'Malabon City',
  'Navotas City', 'Valenzuela City', 'San Juan City', 'Marikina City',
  'Cebu City', 'Mandaue City', 'Lapu-Lapu City', 'Davao City',
  'General Santos City', 'Iloilo City', 'Bacolod City', 'Zamboanga City',
  'Baguio City', ' Angeles City', 'Tacloban City', 'Olongapo City',
];

const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair'];

function randomCondition() {
  return CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
}

function randomLocation() {
  return LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
}

function pexelsUrl(id) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&dpr=1`;
}

const listingsData = {
  electronics: [
    { title: 'iPhone 15 Pro 256GB', imgId: 29020349, price: 52000, desc: 'Brand new iPhone 15 Pro, 256GB Natural Titanium. Sealed box, never opened.' },
    { title: 'iPhone 14 Pro Max 256GB', imgId: 18525574, price: 42000, desc: 'Used iPhone 14 Pro Max in excellent condition. Battery health at 93%.' },
    { title: 'Samsung Galaxy S24 Ultra', imgId: 4071887, price: 55000, desc: 'Samsung flagship with S Pen. 256GB, like new with box and accessories.' },
    { title: 'MacBook Pro 14-inch M3', imgId: 129208, price: 95000, desc: 'M3 Pro chip, 18GB RAM, 512GB SSD. Perfect for professionals.' },
    { title: 'MacBook Air M2 13-inch', imgId: 2506947, price: 52000, desc: 'Lightweight and powerful M2 MacBook Air. 8GB RAM, 256GB SSD, midnight color.' },
    { title: 'iPad Air M1 64GB', imgId: 205421, price: 28000, desc: 'iPad Air with M1 chip. Great for note-taking and light creative work.' },
    { title: 'Sony WH-1000XM5 Headphones', imgId: 3780681, price: 15000, desc: 'Industry-leading noise cancelling. Barely used, comes with case and cables.' },
    { title: 'AirPods Pro 2nd Gen', imgId: 234527, price: 10500, desc: 'Active noise cancellation with USB-C charging. Works perfectly.' },
    { title: 'Canon EOS R5 Mirrorless Camera', imgId: 238118, price: 165000, desc: 'Professional full-frame mirrorless. 45MP sensor, 8K video capable.' },
    { title: 'Logitech MX Master 3S Mouse', imgId: 574086, price: 4500, desc: 'Ergonomic wireless mouse. USB-C charging, works on any surface.' },
    { title: 'Dell 27-inch 4K Monitor', imgId: 331684, price: 14000, desc: 'USB-C connectivity, perfect for laptop docking. Excellent for productivity.' },
    { title: 'JBL Flip 6 Bluetooth Speaker', imgId: 196657, price: 5500, desc: 'Portable waterproof speaker. Powerful bass, 12-hour battery life.' },
    { title: 'GoPro Hero 12 Black', imgId: 6893384, price: 22000, desc: 'Action camera with HyperSmooth stabilization. Includes waterproof housing.' },
    { title: 'Kindle Paperwhite 11th Gen', imgId: 7789310, price: 7000, desc: '6.8-inch display, warm light, waterproof. Perfect for avid readers.' },
    { title: 'Samsung Galaxy Tab S9 FE', imgId: 5052840, price: 18000, desc: '10.9-inch display, S Pen included. Great for entertainment and light work.' },
    { title: 'Razer DeathAdder V3 Gaming Mouse', imgId: 11621728, price: 3800, desc: 'Ergonomic gaming mouse with 30K DPI sensor. Lightweight design.' },
    { title: 'Mechanical Keyboard RGB', imgId: 8068269, price: 4200, desc: 'Hot-swappable switches, per-key RGB lighting. Excellent typing experience.' },
    { title: 'Logitech C920 Webcam', imgId: 2148217, price: 2800, desc: '1080p HD webcam with auto-focus. Great for video calls and streaming.' },
    { title: 'Anker 20000mAh Power Bank', imgId: 4523026, price: 1800, desc: 'Fast charging power bank with dual USB ports. Charges phone 4 times.' },
    { title: 'Apple Watch Series 9 45mm', imgId: 3822337, price: 18000, desc: 'GPS only, midnight aluminum case. Always-on display, health sensors.' },
  ],

  fashion: [
    { title: 'Nike Air Max 90', imgId: 18946644, price: 6500, desc: 'Classic white colorway. Size 10, worn twice only. Authentic from Nike.' },
    { title: 'Adidas Ultraboost 22', imgId: 18368121, price: 5800, desc: 'Comfortable running shoes with Boost cushioning. Size 9.5.' },
    { title: "Levi's 501 Original Jeans", imgId: 1124466, price: 2200, desc: 'Classic straight-fit denim. Size 32x30, no tears or fading.' },
    { title: 'Ray-Ban Aviator Classic', imgId: 18202583, price: 8500, desc: 'Gold frame with green lenses. Authentic with original case.' },
    { title: 'Nike Heritage Backpack', imgId: 5726925, price: 1800, desc: 'Durable polyester backpack. Multiple compartments, adjustable straps.' },
    { title: 'Genuine Leather Wallet', imgId: 28879459, price: 1500, desc: 'Full-grain leather bifold wallet. RFID blocking, 8 card slots.' },
    { title: 'Casio G-Shock Digital Watch', imgId: 18188498, price: 4500, desc: 'Classic G-Shock durability. Water resistant to 200m.' },
    { title: '18K Gold Plated Chain Necklace', imgId: 787593, price: 800, desc: 'Minimalist chain necklace. Hypoallergenic, tarnish-resistant.' },
    { title: 'Polo Ralph Lauren Classic Fit Shirt', imgId: 18188496, price: 2500, desc: 'Cotton oxford shirt. Size Large, barely worn. Great for office.' },
    { title: 'Denim Jacket Classic', imgId: 3670208, price: 3000, desc: 'Medium wash denim jacket. Perfect for layering. Size M.' },
    { title: 'Nike Tech Fleece Hoodie', imgId: 28879459, price: 3200, desc: 'Comfortable and stylish hoodie. Size L, like new condition.' },
    { title: 'Asics Gel-Kayano Running Shoes', imgId: 18946644, price: 4500, desc: 'Stability running shoes. Size 9.5, used for 3 months only.' },
    { title: 'New Era 59FIFTY Cap', imgId: 18368121, price: 1200, desc: 'Structured fitted cap. Size 7 1/4, adjustable strap at back.' },
    { title: 'Sterling Silver Bracelet', imgId: 1124466, price: 650, desc: '925 sterling silver chain bracelet. Lobster clasp, 8 inches.' },
    { title: 'Italian Leather Belt', imgId: 18202583, price: 1500, desc: 'Genuine Italian leather belt. Silver buckle, size 34.' },
    { title: 'Canvas Crossbody Bag', imgId: 5726925, price: 900, desc: 'Water-resistant canvas bag. Adjustable strap, multiple pockets.' },
    { title: 'Floral Summer Dress', imgId: 28879459, price: 1800, desc: 'Lightweight cotton dress with floral print. Size Small.' },
    { title: 'Quick-Dry Swim Trunks', imgId: 18188498, price: 800, desc: 'Drawstring swim trunks. Mesh lining, zippered pocket. Size M.' },
    { title: 'Compression Sports Shorts', imgId: 787593, price: 600, desc: 'Moisture-wicking compression shorts. Size L, perfect for workouts.' },
    { title: 'Slim Fit Formal Blazer', imgId: 3670208, price: 5000, desc: 'Navy blue blazer. Slim fit, fully lined. Great for formal events.' },
  ],

  'home-living': [
    { title: 'IKEA KALLAX Shelf Unit 4x4', imgId: 1957477, price: 3500, desc: 'White shelf unit. Some minor scratches but structurally perfect.' },
    { title: 'Xiaomi Robot Vacuum X10+', imgId: 5691603, price: 12000, desc: 'Self-emptying robot vacuum. Laser navigation, mopping function.' },
    { title: 'Blueair Air Purifier HEPA', imgId: 36665794, price: 8500, desc: 'HEPA H13 filtration, covers up to 30 sqm. Whisper quiet operation.' },
    { title: 'Yankee Candle Large Jar', imgId: 3266700, price: 900, desc: 'MidSummer Night scent. 65+ hour burn time. Barely used.' },
    { title: 'Knit Throw Blanket', imgId: 4210860, price: 650, desc: 'Soft cotton knit blanket. 130x170cm, cream color. Very cozy.' },
    { title: 'Minimalist Wall Clock', imgId: 6981411, price: 800, desc: 'Silent sweep movement. 12-inch, black frame. Modern design.' },
    { title: 'Arc Floor Lamp', imgId: 5838439, price: 3200, desc: 'Adjustable arc lamp with linen shade. Dimmable LED compatible.' },
    { title: 'Solid Wood Coffee Table', imgId: 1550688, price: 5500, desc: 'Acacia wood coffee table. 120x60cm, rustic finish. Heavy duty.' },
    { title: 'Ceramic Plant Pot 6-inch', imgId: 1078958, price: 350, desc: 'Glazed ceramic pot with drainage hole. Comes with saucer.' },
    { title: 'Blackout Curtains Pair', imgId: 6489083, price: 1500, desc: 'Thermal insulated curtains. 140x210cm, navy blue color.' },
    { title: 'Round Wall Mirror 60cm', imgId: 4033324, price: 2800, desc: 'Frameless round mirror. 60cm diameter, easy wall mount included.' },
    { title: 'Boho Area Rug 5x7ft', imgId: 6474471, price: 4500, desc: 'Hand-tufted cotton rug. Bohemian pattern, tasseled edges.' },
    { title: 'Velvet Throw Pillow Set of 2', imgId: 6477813, price: 700, desc: 'Luxury velvet pillows. 45x45cm, gold color. Inserts included.' },
    { title: 'Kitchen Counter Organizer', imgId: 6474809, price: 1200, desc: 'Bamboo 3-tier organizer. Perfect for spices and condiments.' },
    { title: 'Fabric Storage Box Large', imgId: 6474773, price: 450, desc: 'Collapsible storage box. 50x40x30cm, grey linen fabric.' },
    { title: 'Bamboo Laundry Basket', imgId: 6474753, price: 1800, desc: 'Handwoven bamboo basket with lid. Large capacity, breathable.' },
    { title: 'Wall-Mount Coat Rack', imgId: 6474733, price: 600, desc: '5-hook wooden coat rack. 60cm wide, rustic brown finish.' },
    { title: 'Welcome Doormat', imgId: 6474713, price: 350, desc: 'Coir doormat with "Welcome" text. Non-slip backing, 60x40cm.' },
    { title: 'Stainless Steel Trash Can 30L', imgId: 6474693, price: 1500, desc: 'Step-on pedal bin. Fingerprint-resistant finish, soft close lid.' },
    { title: 'Velvet Hangers Set of 30', imgId: 6474673, price: 500, desc: 'Non-slip velvet hangers. Slim design, saves closet space.' },
  ],

  vehicles: [
    { title: 'Honda Click 160', imgId: 2100738, price: 95000, desc: '2023 model, single owner. Low mileage, regularly serviced. Complete papers.' },
    { title: 'Yamaha NMAX 155', imgId: 1166782, price: 105000, desc: 'ABS version, 2023. One owner, garage kept. All maintenance records.' },
    { title: 'Suzuki Jimny GLX', imgId: 3580707, price: 1150000, desc: '2023 4-door variant. Off-road ready, low mileage. Metallic gray.' },
    { title: 'Toyota Vios 1.3 XE', imgId: 3593922, price: 580000, desc: '2022 sedan, manual transmission. One owner, well maintained.' },
    { title: 'Honda Wave 110 RSX', imgId: 2100738, price: 45000, desc: '2023 model. Fuel-efficient, perfect for daily commute. Complete docs.' },
    { title: 'Full Face Motorcycle Helmet', imgId: 1166782, price: 3500, desc: 'DOT certified, size Large. Visor anti-scratch coating, good condition.' },
    { title: 'Mountain Bike 29er', imgId: 100650, price: 12000, desc: 'Aluminum frame, 21-speed Shimano. Front suspension, disc brakes.' },
    { title: 'Electric Kick Scooter', imgId: 6894519, price: 15000, desc: '30km range, foldable design. LED display, 3 speed modes.' },
    { title: '4K Dash Cam', imgId: 2036544, price: 3500, desc: 'Front and rear recording, parking mode. 170-degree wide angle lens.' },
    { title: 'Universal Car Phone Mount', imgId: 3580707, price: 450, desc: 'Dashboard and windshield mount. 360-degree rotation, one-hand operation.' },
    { title: 'Waterproof Car Cover Sedan', imgId: 3593922, price: 2500, desc: 'UV-resistant, fits sedans up to 4.8m. Elastic hem, mirror pockets.' },
    { title: '17-inch Alloy Wheel Rims Set', imgId: 1166782, price: 18000, desc: 'Flow-formed alloy wheels. 4x114.3 bolt pattern, gunmetal finish.' },
    { title: 'Car Vacuum Cleaner 12V', imgId: 5691603, price: 1200, desc: 'Corded car vacuum with HEPA filter. Strong suction, compact design.' },
    { title: 'Digital Tire Pressure Gauge', imgId: 3580707, price: 350, desc: 'LCD display, accurate to 0.1 PSI. LED backlight, AAA batteries included.' },
    { title: 'Portable Jump Starter', imgId: 3593922, price: 2800, desc: '2000A peak, 20000mAh battery. USB charging, emergency flashlight.' },
    { title: 'Roof Rack Cross Bars', imgId: 2100738, price: 4500, desc: 'Universal fit, adjustable width. Aluminum construction, lockable.' },
    { title: 'Heavy Duty Bike Lock', imgId: 100650, price: 800, desc: '14mm hardened steel U-lock. Pick-resistant cylinder, includes bracket.' },
    { title: 'Polarized Driving Sunglasses', imgId: 2100738, price: 1200, desc: 'UV400 protection, polarized lenses. Lightweight frame, anti-glare.' },
    { title: 'Leather Car Seat Covers Pair', imgId: 3580707, price: 6500, desc: 'PU leather, universal fit. Airbag compatible, waterproof, black.' },
    { title: 'Steering Wheel Cover Leather', imgId: 3593922, price: 500, desc: 'Breathable leather cover. Anti-slip grip, fits 37-38cm wheels.' },
  ],

  beauty: [
    { title: 'Chanel No. 5 Eau de Parfum', imgId: 963740, price: 6500, desc: '100ml bottle, 90% full. Authentic, bought from duty-free.' },
    { title: 'Korean Skincare 10-Step Set', imgId: 3762879, price: 3500, desc: 'Complete Korean skincare routine. Includes cleanser, toner, serum, moisturizer.' },
    { title: 'Professional Makeup Brush Set', imgId: 2693529, price: 1200, desc: '15-piece brush set with travel case. Synthetic bristles, soft touch.' },
    { title: 'MAC Matte Lipstick Ruby Woo', imgId: 2693529, price: 950, desc: 'Classic red matte lipstick. Full size, barely used.' },
    { title: 'Biore UV Aqua Rich SPF50+', imgId: 3762879, price: 550, desc: 'Lightweight sunscreen with no white cast. 50ml tube, sealed.' },
    { title: 'Dyson Airwrap Complete', imgId: 3065209, price: 18000, desc: 'Multi-styler with all attachments. Used 5 times, comes with box.' },
    { title: 'CeraVe Facial Cleanser', imgId: 3762879, price: 650, desc: 'Gentle foaming cleanser. 236ml, 80% full. Good for sensitive skin.' },
    { title: 'Cetaphil Moisturizing Cream', imgId: 3762879, price: 480, desc: 'Rich moisturizer for face and body. 453g tub, unopened.' },
    { title: 'OPI Nail Polish Collection', imgId: 2693529, price: 300, desc: 'Set of 3 mini polishes. Classic red, nude, and pink shades.' },
    { title: 'Urban Decay Eyeshadow Palette', imgId: 2693529, price: 2200, desc: '12-shade palette with mirror. Shimmer and matte finishes, like new.' },
    { title: 'Beautyblender Original', imgId: 2693529, price: 550, desc: 'Original pink beauty sponge. Washed once, still in great shape.' },
    { title: 'Mediheal Sheet Mask Set', imgId: 3762879, price: 600, desc: 'Set of 10 assorted masks. Hydrating, brightening, and calming formulas.' },
    { title: 'TruSkin Vitamin C Serum', imgId: 3762879, price: 850, desc: 'Anti-aging serum with vitamin C, E, and hyaluronic acid. 30ml.' },
    { title: 'Fenty Beauty Lip Gloss', imgId: 2693529, price: 900, desc: 'Fenty Glow shade. High shine, non-sticky formula. 9ml, used once.' },
    { title: 'Maybelline Lash Sensational Mascara', imgId: 2693529, price: 350, desc: 'Full fan effect mascara. Washable formula, jet black color.' },
    { title: 'Maybelline Fit Me Foundation', imgId: 2693529, price: 450, desc: 'Liquid foundation, shade 220 Natural Beige. 30ml, 70% full.' },
    { title: 'NARS Radiant Concealer', imgId: 2693529, price: 1200, desc: 'Medium coverage concealer. Shade Vanilla, 6ml, lightly used.' },
    { title: 'Anastasia Beverly Hills Brow Wiz', imgId: 2693529, price: 900, desc: 'Slim brow pencil with spoolie. Shade Medium Brown, almost new.' },
    { title: 'Urban Decay All Nighter Spray', imgId: 2693529, price: 1100, desc: 'Long-lasting setting spray. 120ml, used a few times only.' },
    { title: 'Jergens Ultra Healing Lotion', imgId: 3762879, price: 350, desc: 'Intensive moisturizer with vitamins C, E, and B5. 621ml bottle.' },
  ],

  sports: [
    { title: 'Yoga Mat 6mm Premium', imgId: 4056532, price: 800, desc: 'Non-slip TPE material. 183x61cm, carrying strap included.' },
    { title: 'Bowflex SelectTech Dumbbells', imgId: 841130, price: 15000, desc: 'Adjustable 5-52.5 lbs per dumbbell. Replaces 15 sets of weights.' },
    { title: 'Resistance Bands Set', imgId: 4056532, price: 500, desc: 'Set of 5 bands with different resistance levels. Carrying bag included.' },
    { title: 'Speed Jump Rope', imgId: 4056532, price: 350, desc: 'Adjustable steel cable rope. Ball bearing handles, 3m length.' },
    { title: 'Hydro Flask 32oz Wide Mouth', imgId: 1484154, price: 1500, desc: 'Stainless steel insulated bottle. Keeps drinks cold 24hrs, hot 12hrs.' },
    { title: 'Running Armband iPhone', imgId: 2524874, price: 400, desc: 'Waterproof armband for iPhone 14/15. Touchscreen compatible, reflective.' },
    { title: 'Knee Support Brace', imgId: 2524874, price: 600, desc: 'Compression knee sleeve. Breathable fabric, suitable for running and gym.' },
    { title: 'Speedo Swim Goggles', imgId: 863974, price: 800, desc: 'Anti-fog, UV protection. Comfortable silicone gaskets, adjustable strap.' },
    { title: 'Spalding Official Basketball', imgId: 2077012, price: 1200, desc: 'Size 7 composite leather ball. Official NBA size, good grip.' },
    { title: 'Nike Premier League Football', imgId: 2077012, price: 1500, desc: 'Match ball with thermal bonding. Excellent flight stability.' },
    { title: 'Wilson Pro Staff Tennis Racket', imgId: 2077012, price: 5500, desc: '16x19 string pattern, 98 sq in head. Great for intermediate players.' },
    { title: 'Yonex Badminton Racket Set', imgId: 2077012, price: 2500, desc: 'Set of 2 rackets with 3 shuttlecocks. Lightweight graphite frame.' },
    { title: 'Everlast Boxing Gloves 14oz', imgId: 4754148, price: 1800, desc: 'Synthetic leather, wrist wrap support. Perfect for bag training.' },
    { title: 'Nike Gym Duffel Bag', imgId: 2524874, price: 2200, desc: 'Large capacity sports bag. Separate shoe compartment, water-resistant.' },
    { title: 'Xiaomi Mi Band 8 Pro', imgId: 4056532, price: 1800, desc: 'Fitness tracker with heart rate and SpO2. 14-day battery life.' },
    { title: 'Compression Shirt Long Sleeve', imgId: 2524874, price: 700, desc: 'Moisture-wicking compression top. UPF 50+ protection, size L.' },
    { title: '65cm Exercise Stability Ball', imgId: 4056532, price: 600, desc: 'Anti-burst ball with air pump. Great for core workouts and posture.' },
    { title: 'Doorway Pull-Up Bar', imgId: 4754148, price: 1200, desc: 'Multi-grip pull-up bar. Fits 62-80cm doorways, supports 150kg.' },
    { title: 'Ab Roller Wheel', imgId: 4754148, price: 450, desc: 'Dual-wheel ab roller with knee pad. Foam grip handles.' },
    { title: 'High-Density Foam Roller', imgId: 4056532, price: 650, desc: '18-inch EVA foam roller. Muscle recovery and deep tissue massage.' },
  ],

  gaming: [
    { title: 'PlayStation 5 Disc Edition', imgId: 5072119, price: 22000, desc: 'PS5 console with disc drive. Excellent condition, with original box.' },
    { title: 'Xbox Series X 1TB', imgId: 4429186, price: 20000, desc: 'Microsoft flagship console. 1TB SSD, 4K gaming ready.' },
    { title: 'HyperX Cloud II Gaming Headset', imgId: 4429186, price: 3500, desc: '7.1 surround sound. Detachable mic, memory foam ear cushions.' },
    { title: 'Secretlab TITAN Evo Gaming Chair', imgId: 7915258, price: 18000, desc: 'Premium ergonomic chair. Size Regular, softweave fabric, like new.' },
    { title: 'Razer Huntsman V3 Pro Keyboard', imgId: 2582932, price: 12000, desc: 'Analog optical switches, adjustable actuation. RGB backlight.' },
    { title: 'Logitech G Pro X Superlight Mouse', imgId: 2582932, price: 5500, desc: 'Ultra-lightweight 63g. HERO 25K sensor, wireless.' },
    { title: 'Govee RGB LED Strip Lights 10m', imgId: 4429186, price: 1200, desc: 'Wi-Fi and Bluetooth control. Music sync mode, 16 million colors.' },
    { title: 'PS5 DualSense Controller', imgId: 5072119, price: 2800, desc: 'Midnight Black color. Haptic feedback, adaptive triggers. New.' },
    { title: 'ASUS ROG 27-inch Gaming Monitor', imgId: 7915258, price: 22000, desc: '240Hz refresh rate, 1ms response. IPS panel, G-Sync compatible.' },
    { title: 'Steam Deck 512GB', imgId: 4429186, price: 25000, desc: 'Handheld gaming PC. 7-inch LCD screen, carrying case included.' },
    { title: 'Nintendo Switch OLED White', imgId: 4429186, price: 16000, desc: '7-inch OLED screen, dockable. Includes Joy-Cons and charger.' },
    { title: 'Gaming Desk 140x60cm', imgId: 7915258, price: 6500, desc: 'Carbon fiber surface, RGB lighting. Cable management, cup holder.' },
    { title: 'XXL Extended Mouse Pad', imgId: 2582932, price: 600, desc: '900x400mm desk mat. Stitched edges, non-slip rubber base.' },
    { title: 'Blue Yeti USB Microphone', imgId: 7915258, price: 6000, desc: 'Professional condenser mic. 4 pickup patterns, headphone output.' },
    { title: 'Meta Quest 3 128GB', imgId: 4429186, price: 24000, desc: 'Mixed reality headset. Snapdragon XR2 Gen 2, inside-out tracking.' },
    { title: 'Retro Mini Classic Console', imgId: 4429186, price: 1500, desc: 'Built-in 620 classic games. HDMI output, two wired controllers.' },
    { title: 'Blue Light Gaming Glasses', imgId: 2582932, price: 800, desc: 'Anti-blue light lenses. Lightweight frame, reduces eye strain.' },
    { title: 'Headset Stand RGB', imgId: 7915258, price: 900, desc: 'USB headset holder with RGB lighting. Non-slip base, cable organizer.' },
    { title: 'Cable Management Kit', imgId: 2582932, price: 400, desc: 'Velcro straps, cable sleeves, and clips. Keep your desk tidy.' },
    { title: 'Elgato HD60 X Capture Card', imgId: 7915258, price: 10000, desc: '4K passthrough, 1080p60 capture. Zero-lag passthrough, VRR support.' },
  ],

  collectibles: [
    { title: 'Funko Pop Marvel Spider-Man', imgId: 6474471, price: 800, desc: 'Exclusive edition. Mint in box, collector grade condition.' },
    { title: 'Pokemon Trading Cards Booster Box', imgId: 6474773, price: 4500, desc: 'Scarlet & Violet base set. 36 packs, sealed box.' },
    { title: 'Vintage Silver Coins Collection', imgId: 6474809, price: 8000, desc: '10 silver coins from 1960s-1980s. Philippines and US minted.' },
    { title: 'Stamp Collection Album', imgId: 6474753, price: 2500, desc: 'Complete Philippine stamp album 1970-2000. Over 200 stamps.' },
    { title: 'Marvel Legends Action Figure', imgId: 6474733, price: 1200, desc: '6-inch scale, multiple points of articulation. Complete with accessories.' },
    { title: 'LEGO Technic Porsche 911', imgId: 6474713, price: 8500, desc: '1,800 pieces, built and displayed. All parts and instructions included.' },
    { title: 'Hot Wheels Redline Collection', imgId: 6474693, price: 15000, desc: '5 vintage redline Hot Wheels. 1960s originals, excellent condition.' },
    { title: 'Funko Pop Anime Dragon Ball', imgId: 6474673, price: 650, desc: 'Goku Super Saiyan. Box in good condition, limited edition.' },
    { title: 'One Piece Manga Box Set', imgId: 369409, price: 3500, desc: 'Volumes 1-23 in original box. Light yellowing on spines.' },
    { title: 'Vintage Pocket Watch Silver', imgId: 3780681, price: 3000, desc: 'Mechanical wind-up, working condition. Engraved case, 1950s.' },
    { title: 'Natural Crystal Collection', imgId: 963740, price: 2000, desc: '12 assorted crystals. Includes amethyst, quartz, and rose quartz.' },
    { title: 'Gemstone Specimen Set', imgId: 963740, price: 5500, desc: '8 polished gemstones with display case. Includes ruby, sapphire, emerald.' },
    { title: 'Fossil Specimen Trilobite', imgId: 369409, price: 4000, desc: 'Authentic trilobite fossil. 400 million years old, display ready.' },
    { title: 'Philippine Coin Collection', imgId: 6474809, price: 1500, desc: 'Complete set of Philippine coins 1970-2020. 45 coins in holder.' },
    { title: 'NBA Trading Card Series', imgId: 6474773, price: 2000, desc: '2023-24 Prizm pack. 10 cards per pack, sealed.' },
    { title: 'Vintage Movie Poster Original', imgId: 369409, price: 6000, desc: 'Original 1977 Star Wars one-sheet. Rolled, some edge wear.' },
    { title: 'Signed Baseball MLB', imgId: 2077012, price: 5000, desc: 'Official MLB ball with autograph. Comes with certificate of authenticity.' },
    { title: 'Bronze Buddha Statue', imgId: 963740, price: 3500, desc: 'Hand-cast bronze, 8 inches tall. Intricate detailing, heavy.' },
    { title: 'Gundam MGEX Strike Freedom', imgId: 6474713, price: 7500, desc: '1/100 scale model kit. Built by expert, display condition.' },
    { title: 'Signed Michael Jordan Jersey', imgId: 2077012, price: 50000, desc: 'Authentic Bulls #23 jersey. Signed in person, PSA authenticated.' },
  ],

  appliances: [
    { title: 'Philips Airfryer XXL', imgId: 4210860, price: 7500, desc: '7.3L capacity. Rapid Air technology, 5 preset cooking modes.' },
    { title: 'Instant Pot Duo 7-in-1', imgId: 5691603, price: 5500, desc: '6-quart pressure cooker. Slow cook, steam, sauté, and more.' },
    { title: 'Nespresso Vertuo Next', imgId: 3065209, price: 8500, desc: 'Coffee and espresso maker. Centrifusion brewing, 5 cup sizes.' },
    { title: 'NutriBullet Pro 900', imgId: 4210860, price: 3500, desc: '900W personal blender. Extracts nutrients from fruits and vegetables.' },
    { title: 'Breville Smart Toaster', imgId: 4210860, price: 4500, desc: '4-slice toaster with LED display. 7 browning levels, lift-and-look.' },
    { title: 'Panasonic Microwave 20L', imgId: 5691603, price: 3800, desc: '600W, 5 power levels. Dial control, compact countertop design.' },
    { title: 'Fellow Stagg EKG Kettle', imgId: 3065209, price: 6500, desc: 'Variable temperature electric kettle. 0.9L, precision pour spout.' },
    { title: 'Zojirushi Rice Cooker 5.5cup', imgId: 5691603, price: 12000, desc: 'Fuzzy logic technology. Multiple cooking settings, keep warm function.' },
    { title: 'Cuisinart Food Processor 14cup', imgId: 4210860, price: 5000, desc: '720W motor. Multiple blades, dishwasher-safe parts.' },
    { title: 'Omega Juicer Slow Masticating', imgId: 4210860, price: 15000, desc: 'Cold press juicer. Low-speed extraction preserves nutrients.' },
    { title: 'Rowenta Steam Iron 1700W', imgId: 5691603, price: 3500, desc: 'Powerful steam output. Auto shut-off, anti-drip system.' },
    { title: 'Shark Steam Mop S6003', imgId: 5691603, price: 6000, desc: 'Steam cleaning without chemicals. Washable pads, swivel steering.' },
    { title: 'Dyson Pure Cool Tower', imgId: 36665794, price: 22000, desc: 'Purifier and fan in one. HEPA filter, air quality display.' },
    { title: 'DeLonghi Oil Filled Radiator', imgId: 36665794, price: 5500, desc: '1500W, 3 heat settings. Silent operation, thermostat control.' },
    { title: 'Levoit Core 400S Humidifier', imgId: 36665794, price: 4500, desc: '4L tank, smart app control. Auto mode, 360-degree mist outlet.' },
    { title: 'Frigidaire Dehumidifier 50pt', imgId: 36665794, price: 12000, desc: 'Removes 50 pints/day. Continuous drain option, auto-humidistat.' },
    { title: 'Miele Complete C3 Vacuum', imgId: 5691603, price: 15000, desc: 'Bagged canister vacuum. HEPA filter, 6-step height adjustment.' },
    { title: 'LG Front Load Washer 7kg', imgId: 5691603, price: 18000, desc: 'Inverter direct drive. 6 motion wash, allergen removal cycle.' },
    { title: 'Samsung 2-Door Refrigerator', imgId: 5691603, price: 15000, desc: '178L capacity, Digital Inverter. Door alarm,, energy efficient.' },
    { title: 'Bosch Dishwasher Freestanding', imgId: 5691603, price: 25000, desc: '12 place settings, 6 programs. EcoSilence drive, half-load option.' },
  ],

  tools: [
    { title: 'DeWalt 20V Max Drill Driver', imgId: 5691629, price: 6500, desc: 'Cordless drill with 2 batteries. 2-speed transmission, LED light.' },
    { title: 'Makita Circular Saw 7-1/4', imgId: 5691629, price: 5500, desc: '15A motor, 5800 RPM. Magnesium base, built-in LED light.' },
    { title: 'Milwaukee M18 Impact Wrench', imgId: 5691629, price: 8500, desc: '1/2-inch drive, 1000 ft-lbs torque. Friction ring hog ring anvil.' },
    { title: 'Stanley 25ft Tape Measure', imgId: 5691629, price: 450, desc: 'MyLock mechanism, BladeArmor coating. 25-foot, easy-read markings.' },
    { title: 'Klein 11-in-1 Screwdriver Set', imgId: 5691629, price: 1200, desc: 'Multi-bit screwdriver with 11 tips. Cushion-grip handle.' },
    { title: 'Craftsman 20pc Wrench Set', imgId: 5691629, price: 3500, desc: 'Metric and SAE combination wrenches. Quick-release ratchet included.' },
    { title: 'Knipex Pliers Wrench Set', imgId: 5691629, price: 5000, desc: '2-piece set, 7-inch and 10-inch. Chrome-plated, German made.' },
    { title: 'Estwing 16oz Framing Hammer', imgId: 5691629, price: 800, desc: 'Solid steel, shock reduction grip. One-piece construction.' },
    { title: 'Empire 24-inch Magnetic Level', imgId: 5691629, price: 600, desc: 'Dual-view vials, magnetic edge. Aluminum body, lightweight.' },
    { title: 'Stud Finder Wall Scanner', imgId: 5691629, price: 1500, desc: '4-in-1 detector: wood, metal, AC wire, depth. LCD display.' },
    { title: 'Weller WE1010 Soldering Station', imgId: 5691629, price: 8000, desc: '70W digital station. Temperature control, sleep mode, tip storage.' },
    { title: 'Fluke 117 Multimeter', imgId: 5691629, price: 12000, desc: 'True-RMS digital multimeter. Auto-voltage detection, low impedance.' },
    { title: 'Knipex Wire Cutter', imgId: 5691629, price: 1500, desc: '8-inch diagonal cutter. Hardened cutting edges, two-component handles.' },
    { title: 'Stanley 40pc Socket Set', imgId: 5691629, price: 2500, desc: '3/8-inch drive, metric and SAE. Quick-release ratchet, carry case.' },
    { title: 'Wiha 9pc Allen Key Set', imgId: 5691629, price: 900, desc: 'Metric hex keys, ball end. Chrome-vanadium-molybdenum steel.' },
    { title: 'Bessey 6-inch Clamp Set', imgId: 5691629, price: 1200, desc: 'Set of 2 bar clamps. 6-inch, 300lb clamping force each.' },
    { title: 'LED Work Light 1000 lumens', imgId: 5691629, price: 800, desc: 'Rechargeable, magnetic base. 3 brightness levels, hang hook.' },
    { title: '50ft Heavy Duty Extension Cord', imgId: 5691629, price: 1200, desc: '12-gauge, 3-outlet. Indoor/outdoor, lighted end connector.' },
    { title: 'DeWalt Rolling Tool Box', imgId: 5691629, price: 5500, desc: 'Waterproof, telescoping handle. IP65 rated, removable tray.' },
    { title: '3M Safety Goggles', imgId: 5691629, price: 400, desc: 'Anti-fog, ANSI Z87.1 certified. indirect ventilation, fits over glasses.' },
  ],

  books: [
    { title: 'Atomic Habits by James Clear', imgId: 29272605, price: 500, desc: 'Bestselling self-help book. Hardcover, like new condition.' },
    { title: 'The Subtle Art of Not Giving a F*ck', imgId: 4006143, price: 400, desc: 'Mark Manson bestseller. Paperback, minimal wear.' },
    { title: 'One Piece Manga Vol 1-5', imgId: 369409, price: 1200, desc: 'First 5 volumes of One Piece. Paperback, good condition.' },
    { title: 'Harry Potter Complete Box Set', imgId: 369409, price: 4500, desc: 'All 7 books in hardcover box set. Minor shelf wear on box.' },
    { title: 'Calculus Early Transcendentals', imgId: 196657, price: 800, desc: 'James Stewart textbook. 8th edition, some highlighting inside.' },
    { title: 'Dune by Frank Herbert', imgId: 369409, price: 350, desc: 'Sci-fi classic. Paperback, creased spine, fully readable.' },
    { title: 'The Lord of the Rings 3-in-1', imgId: 369409, price: 1500, desc: 'Tolkien epic in one volume. Hardcover with box, some foxing.' },
    { title: 'Sapiens by Yuval Noah Harari', imgId: 29272605, price: 450, desc: 'Brief history of humankind. Paperback, like new.' },
    { title: 'Coffee Table Photography Book', imgId: 12743408, price: 2000, desc: 'Large format landscape photography. 200 pages, hardcover.' },
    { title: "Where the Wild Things Are", imgId: 196657, price: 200, desc: 'Maurice Sendak classic children book. Hardcover with dust jacket.' },
    { title: 'Leaves of Grass Walt Whitman', imgId: 369409, price: 600, desc: 'Penguin Classics edition. Paperback, unread condition.' },
    { title: 'Becoming by Michelle Obama', imgId: 29272605, price: 500, desc: 'Memoir, hardcover first edition. Signed bookplate included.' },
    { title: 'IT by Stephen King', imgId: 369409, price: 400, desc: 'Horror masterpiece. Mass market paperback, 1100+ pages.' },
    { title: 'The Adventures of Sherlock Holmes', imgId: 369409, price: 300, desc: 'Classic mystery collection. Penguin paperback, good condition.' },
    { title: 'Pride and Prejudice Jane Austen', imgId: 369409, price: 250, desc: 'Wordsworth Classics edition. Paperback, very clean pages.' },
    { title: 'Marvel Comics Encyclopedia', imgId: 6474471, price: 1800, desc: 'Updated and expanded. Hardcover, over 1000 characters covered.' },
    { title: 'Lonely Planet Japan Guide', imgId: 2148217, price: 600, desc: '10th edition, comprehensive travel guide. Paperback, some notes inside.' },
    { title: 'Oxford Advanced Learners Dictionary', imgId: 196657, price: 1500, desc: '10th edition with CD-ROM. Hardcover, like new condition.' },
    { title: 'Handmade Leather Journal', imgId: 4523026, price: 800, desc: 'Genuine leather cover, refillable. 200 unlined pages, brass clasp.' },
    { title: 'Adult Coloring Book Animals', imgId: 8534385, price: 250, desc: '50 detailed animal designs. Perforated pages, stress-relieving art.' },
  ],

  other: [
    { title: 'Orthopedic Memory Foam Pet Bed', imgId: 5938111, price: 1500, desc: 'Large size, waterproof liner. Removable washable cover, grey.' },
    { title: 'Retractable Dog Leash 5m', imgId: 2467239, price: 500, desc: 'For dogs up to 20kg. One-button brake, ergonomic handle.' },
    { title: 'Interactive Cat Feather Toy', imgId: 28802825, price: 350, desc: 'Electronic rotating feather toy. USB rechargeable, 3 speed modes.' },
    { title: 'Monstera Deliciosa Plant', imgId: 1078958, price: 1200, desc: 'Mature Monstera in 8-inch pot. Fenestrated leaves, healthy roots.' },
    { title: 'Glass Geometric Terrarium', imgId: 1078958, price: 800, desc: 'Brass frame, 20cm. Perfect for succulents and air plants.' },
    { title: 'Catan Board Game', imgId: 2148217, price: 1500, desc: 'Base game, complete set. Played twice, all pieces included.' },
    { title: '1000 Piece Jigsaw Puzzle', imgId: 2148217, price: 500, desc: 'National Geographic world map. Finished size 68x48cm.' },
    { title: 'Kala Concert Ukulele', imgId: 369409, price: 2500, desc: 'Mahogany body, Aquila strings. Starter pack with tuner and bag.' },
    { title: 'Bosu Ball Balance Trainer', imgId: 4056532, price: 2000, desc: 'Original Bosu, 65cm. Includes pump and workout guide.' },
    { title: 'Premium Dog Food 15kg', imgId: 2467239, price: 3500, desc: 'Chicken and rice formula. Sealed bag, expiration 2027.' },
    { title: 'Fluval 20 Gallon Aquarium Kit', imgId: 1078958, price: 6500, desc: 'Complete setup with filter, heater, and LED light. Tank only.' },
    { title: 'Large Parrot Bird Cage', imgId: 1078958, price: 4500, desc: 'Wrought iron cage with stand. Multiple perches, slide-out tray.' },
    { title: 'Double Camping Hammock', imgId: 2100738, price: 1800, desc: 'Holds up to 250kg. Ripstop nylon, tree straps included.' },
    { title: '4-Person Camping Tent', imgId: 2100738, price: 4500, desc: 'Waterproof dome tent. Easy setup, mesh windows, carry bag.' },
    { title: 'Cold Weather Sleeping Bag', imgId: 2100738, price: 2500, desc: 'Rated to -10°C. Mummy style, compression sack included.' },
    { title: 'YETI Tundra 45 Cooler', imgId: 2100738, price: 12000, desc: 'Rotomolded cooler, holds 54 cans. Bear-resistant, 3-day ice retention.' },
    { title: 'Wicker Picnic Basket Set', imgId: 2100738, price: 3500, desc: 'Service for 4. Includes plates, cutlery, and wine glasses.' },
    { title: 'Ugly Stik Fishing Rod Combo', imgId: 2100738, price: 2000, desc: '6.5ft medium action rod with reel. Mono line, tackle included.' },
    { title: 'Celestron PowerSeeker Telescope', imgId: 2100738, price: 5500, desc: '70mm refractor telescope. 3 eyepieces, tripod, astronomy software.' },
    { title: 'Nikon Aculon A211 Binoculars', imgId: 2100738, price: 3500, desc: '10x42 magnification. Multi-coated lenses, waterproof, with case.' },
  ],
};

const bcrypt = require('bcryptjs');

async function seedBase() {
  console.log('Seeding base data (categories + users)...\n');

  const categories = [
    { name: 'Electronics', slug: 'electronics', icon: 'Smartphone' },
    { name: 'Fashion', slug: 'fashion', icon: 'Shirt' },
    { name: 'Home & Living', slug: 'home-living', icon: 'Home' },
    { name: 'Vehicles', slug: 'vehicles', icon: 'Car' },
    { name: 'Beauty', slug: 'beauty', icon: 'Sparkles' },
    { name: 'Sports', slug: 'sports', icon: 'Dumbbell' },
    { name: 'Gaming', slug: 'gaming', icon: 'Gamepad2' },
    { name: 'Collectibles', slug: 'collectibles', icon: 'Gem' },
    { name: 'Appliances', slug: 'appliances', icon: 'Refrigerator' },
    { name: 'Tools', slug: 'tools', icon: 'Wrench' },
    { name: 'Books', slug: 'books', icon: 'BookOpen' },
    { name: 'Other', slug: 'other', icon: 'Package' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('  Categories: seeded');

  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    { email: 'admin@baiandsil.ph', name: 'Bai the Admin', isAdmin: true, bio: 'Platform administrator. Keeping the marketplace safe.' },
    { email: 'seller@baiandsil.ph', name: 'Sil the Seller', isAdmin: false, bio: 'Pro seller since 2024. Fast shipping, fair prices.' },
    { email: 'buyer@baiandsil.ph', name: 'Bay the Buyer', isAdmin: false, bio: 'Always looking for great deals!' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: passwordHash },
    });
  }
  console.log('  Users: seeded');
  console.log('  Base data complete!\n');
}

async function main() {
  await seedBase();

  console.log('Seeding listings with images...\n');

  const seller = await prisma.user.findUnique({ where: { email: 'seller@baiandsil.ph' } });

  const categoryMap = {};
  const categorySlugs = [
    'electronics', 'fashion', 'home-living', 'vehicles',
    'beauty', 'sports', 'gaming', 'collectibles',
    'appliances', 'tools', 'books', 'other',
  ];

  for (const slug of categorySlugs) {
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (cat) categoryMap[slug] = cat;
  }

  const summary = {};
  let totalCreated = 0;
  let totalSkipped = 0;

  for (const [catSlug, items] of Object.entries(listingsData)) {
    const category = categoryMap[catSlug];
    if (!category) {
      console.log(`Category "${catSlug}" not found, skipping...`);
      continue;
    }

    let catCreated = 0;
    let catSkipped = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const slug = toSlug(item.title);

      const existing = await prisma.listing.findUnique({ where: { slug } });
      if (existing) {
        catSkipped++;
        totalSkipped++;
        continue;
      }

      const listing = await prisma.listing.create({
        data: {
          title: item.title,
          slug,
          description: item.desc,
          price: item.price,
          categoryId: category.id,
          condition: randomCondition(),
          location: randomLocation(),
          sellerId: seller.id,
          status: 'Active',
        },
      });

      await prisma.listingImage.create({
        data: {
          listingId: listing.id,
          imageUrl: pexelsUrl(item.imgId),
          sortOrder: 0,
        },
      });

      catCreated++;
      totalCreated++;
    }

    summary[catSlug] = { created: catCreated, skipped: catSkipped };
    console.log(`${category.name}: +${catCreated} created, ${catSkipped} skipped`);
  }

  console.log('\n--- Summary ---');
  console.log(`Total listings created: ${totalCreated}`);
  console.log(`Total skipped (duplicates): ${totalSkipped}`);
  console.log('\nBy category:');
  for (const [cat, stats] of Object.entries(summary)) {
    console.log(`  ${cat}: ${stats.created} created, ${stats.skipped} skipped`);
  }

  console.log('\nSeeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
