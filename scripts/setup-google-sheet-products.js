// Google Sheet Setup Instructions for Products

const productHeaders = [
  "ID",
  "Name",
  "Price",
  "Image",
  "Images (JSON)",
  "Description",
  "Detailed Description",
  "Features (JSON)",
  "Specifications (JSON)",
  "Materials (JSON)",
  "Care Instructions (JSON)",
  "Sizes (JSON)",
  "Colors (JSON)",
  "Stock", // New column for stock
]

// Sample data based on your app/page.tsx, with added stock
const sampleProducts = [
  {
    id: 1,
    name: "Jarik Batik",
    price: 11.0,
    image: "https://drive.google.com/file/d/1fW0-P7dU5mimR0V5rq6K30uAMDquyoMH/view?usp=sharing",
    images: [
      "https://drive.google.com/file/d/1fW0-P7dU5mimR0V5rq6K30uAMDquyoMH/view?usp=sharing",
      "https://drive.google.com/file/d/10Qr4IuPWWuyu9k0O7btMlrz7ezyTNib9/view?usp=sharing",
      "https://drive.google.com/file/d/1lLSvTnbfY2p9M-9IhJkRsr3YazZ8HqKv/view?usp=sharing",
      "https://drive.google.com/file/d/1OMOJ7Eqb1vsXpq5ogEH-lGUbUtpCvhPc/view?usp=sharing",
      "https://drive.google.com/file/d/1uvemzAknWqSwJoQyPOTC8h3pOuVoNp3a/view?usp=sharing",
      "https://drive.google.com/file/d/1835MmxUWaengsiL3sWlrAra3CqbqckzX/view?usp=sharing",
      "https://drive.google.com/file/d/1YJp6fwnI6x2Q1AM9iMUbqIWzDsWZUtX9/view?usp=sharing",
    ],
    description: "Stylish canvas totebag featuring traditional Indonesian Wayang (shadow puppet) designs",
    detailedDescription:
      "Our premium Wayang totebag celebrates Indonesia's rich cultural heritage through traditional shadow puppet art. Each bag features authentic wayang motifs arranged in a beautiful grid pattern, combining centuries-old Indonesian storytelling tradition with modern functionality. Perfect for students, professionals, and anyone who appreciates cultural significance in their everyday accessories.",
    features: [
      "100% cotton canvas construction",
      "Authentic Indonesian Wayang shadow puppet designs",
      "Traditional cultural motifs in modern grid layout",
      "Reinforced handles for durability",
      "Spacious main compartment",
      "Perfect for daily use or cultural events",
      "Conversation starter with cultural significance",
    ],
    materials: ["100% Cotton Canvas", "Reinforced Stitching"],
    specifications: {
      Dimensions: "38cm x 42cm x 10cm",
      "Handle Length": "65cm",
      Weight: "200g",
      Capacity: "15L",
      "Design Theme": "Traditional Wayang (Shadow Puppet)",
    },
    careInstructions: ["Hand wash in cold water", "Air dry only", "Do not bleach", "Iron on low heat if needed"],
    colors: ["Ambonia", "Atjeh", "Bandoeng", "Borneo", "Djogjakarta"],
    stock: 50, // Example stock
  },
  {
    id: 2,
    name: "Batik Outer",
    price: 14.0,
    image: "https://drive.google.com/file/d/1la8WgRt1RruPnMZ2qZEbisXrTIGJ2Cpo/view?usp=drive_link",
    images: [
      "https://drive.google.com/file/d/1la8WgRt1RruPnMZ2qZEbisXrTIGJ2Cpo/view?usp=drive_link",
      "https://drive.google.com/file/d/1soJYVejgJqEuqCmu4RC4gSU-SbEPaAF6/view?usp=drive_link",
      "https://drive.google.com/file/d/1SLCn73UsltCxj8FyW-Ub-fAdDCU5lc9y/view?usp=drive_link",
      "https://drive.google.com/file/d/19pS8ZHjdw0-v3kB-zA_jyEg2fyEJHUpg/view?usp=drive_link",
      "https://drive.google.com/file/d/1mBUiUM1LDXvGLO6Dy-GIgbGkUTbRYC3B/view?usp=drive_link",
      "https://drive.google.com/file/d/1iI41Yw9_eAyNqqcG2jnMOVltmqXNj5Ie/view?usp=drive_link",
    ],
    description: "Comfortable oversized t-shirt featuring traditional Indonesian Nasi Tumpeng design",
    detailedDescription:
      "Celebrate Indonesian culinary heritage with this unique oversized t-shirt featuring the iconic Nasi Tumpeng. This traditional cone-shaped rice dish symbolizes gratitude and celebration in Indonesian culture.",
    features: [
      "Premium cotton blend fabric",
      "Oversized relaxed fit",
      "Unique Nasi Tumpeng artwork",
      "Soft and breathable material",
      "Unisex design",
    ],
    materials: ["60% Cotton", "40% Polyester"],
    specifications: {
      Fit: "Oversized",
      "Fabric Weight": "180 GSM",
      "Print Method": "Screen Print",
      Collar: "Crew Neck",
    },
    careInstructions: ["Machine wash cold", "Tumble dry low", "Do not iron directly on print", "Wash inside out"],
    colors: ["Kembang Legi", "Luruh Praja", "Parang Ayu", "Rahayu", "Sekar Tirta"],
    stock: 30, // Example stock
  },
  {
    id: 3,
    name: "Aksara Oversized T-Shirt",
    price: 12.0,
    image: "https://drive.google.com/file/d/1FzJrKLbrORg7pE1BYpVR_beHJR0bGhmy/view?usp=sharing",
    images: [
      "/placeholder.svg?height=400&width=400&text=Aksara+Front",
      "/placeholder.svg?height=400&width=400&text=Aksara+Back",
      "/placeholder.svg?height=400&width=400&text=Aksara+Worn",
    ],
    description: "Modern oversized t-shirt with beautiful Indonesian script (Aksara) design",
    detailedDescription:
      "Showcase the beauty of Indonesian traditional script with this contemporary t-shirt. The Aksara design represents the rich literary and cultural heritage of Indonesia, making it a perfect conversation starter.",
    features: [
      "Premium cotton blend fabric",
      "Authentic Aksara script design",
      "Comfortable oversized fit",
      "Cultural significance",
      "Modern streetwear style",
    ],
    materials: ["60% Cotton", "40% Polyester"],
    specifications: {
      Fit: "Oversized",
      "Fabric Weight": "180 GSM",
      "Print Method": "Screen Print",
      Collar: "Crew Neck",
    },
    careInstructions: ["Machine wash cold", "Tumble dry low", "Do not iron directly on print", "Wash inside out"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Navy", "Forest Green"],
    stock: 25, // Example stock
  },
  {
    id: 4,
    name: "Soto Lamongan Oversized T-Shirt",
    price: 12.0,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FB_IMG_1733780798687.jpg-hUgnf5lT5spgMrseBNfTouGlj9FdXu.jpeg",
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FB_IMG_1733780798687.jpg-hUgnf5lT5spgMrseBNfTouGlj9FdXu.jpeg",
      "1FzJrKLbrORg7pE1BYpVR_beHJR0bGhmy",
      "/placeholder.svg?height=400&width=400&text=Soto+Front+Design",
      "/placeholder.svg?height=400&width=400&text=Soto+Back+Design",
      "/placeholder.svg?height=400&width=400&text=Soto+Detail+View",
    ],
    description: "Trendy oversized t-shirt celebrating the famous Soto Lamongan dish",
    detailedDescription:
      "Pay homage to one of Indonesia's most beloved comfort foods with this stylish t-shirt. Soto Lamongan, a traditional soup from East Java, represents the warmth and richness of Indonesian culinary culture. This Chapter II design from Aachen Studio showcases authentic Indonesian street food culture with modern urban aesthetics.",
    features: [
      "Premium cotton blend fabric",
      "Vibrant Soto Lamongan illustration",
      "Comfortable oversized cut",
      "Food culture appreciation",
      "Perfect for food enthusiasts",
      "Authentic Indonesian street food design",
      "Urban lifestyle aesthetic",
    ],
    materials: ["60% Cotton", "40% Polyester"],
    specifications: {
      Fit: "Oversized",
      "Fabric Weight": "180 GSM",
      "Print Method": "Screen Print",
      Collar: "Crew Neck",
    },
    careInstructions: ["Machine wash cold", "Tumble dry low", "Do not iron directly on print", "Wash inside out"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Navy"],
    stock: 0, // Example: out of stock
  },
]

console.log("Google Sheet Setup Instructions for Products:")
console.log("============================================")
console.log("")
console.log("1. Open your existing Google Sheet.")
console.log('2. Add a new sheet and rename it to "Products".')
console.log("3. Add the following headers to row 1 of the 'Products' sheet:")
console.log("")
productHeaders.forEach((header, index) => {
  console.log(`Column ${String.fromCharCode(65 + index)}: ${header}`)
})
console.log("")
console.log("4. Populate the 'Products' sheet with your product data.")
console.log("   Here's sample data based on your current `app/page.tsx` products, including a 'Stock' column:")
console.log("   (Note: JSON fields like 'Images', 'Features', etc., should be valid JSON strings in the cells)")
console.log("")

sampleProducts.forEach((product) => {
  const row = [
    product.id,
    product.name,
    product.price,
    product.image,
    JSON.stringify(product.images || []),
    product.description,
    product.detailedDescription || "",
    JSON.stringify(product.features || []),
    JSON.stringify(product.specifications || {}),
    JSON.stringify(product.materials || []),
    JSON.stringify(product.careInstructions || []),
    JSON.stringify(product.sizes || []),
    JSON.stringify(product.colors || []),
    product.stock,
  ]
  console.log(row.map((item) => (typeof item === "string" ? `"${item}"` : item)).join("\t")) // Use tab for easy copy-paste
})

console.log("")
console.log("5. Ensure your Google Service Account has 'Editor' permissions for this entire Google Sheet.")
console.log("   (This is the same service account you use for the 'Orders' and 'Order_Items' sheets).")
console.log("")
console.log("After setting up the sheet, you can proceed with the code changes.")
