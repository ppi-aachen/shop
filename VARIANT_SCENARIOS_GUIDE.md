# Variant Scenarios Guide - All Product Combinations

## Overview

The variant-based stock management system handles all possible combinations of size and color options. Here's how each scenario works:

## 📊 All Possible Scenarios

### 1. **No Size, No Color** (Simple Product)
**Example:** A simple accessory like a keychain or sticker

| Product | Size | Color | Variant ID | Stock |
|---------|------|-------|------------|-------|
| Keychain | - | - | `1-null-null` | 50 |

**Google Sheets:**
```
| product_id | size | color | stock | variant_id |
|------------|------|-------|-------|------------|
| 1 | null | null | 50 | 1-null-null |
```

### 2. **Size Only, No Color** (Sized Product)
**Example:** A t-shirt that comes in different sizes but only one color

| Product | Size | Color | Variant ID | Stock |
|---------|------|-------|------------|-------|
| T-Shirt | S | - | `2-S-null` | 10 |
| T-Shirt | M | - | `2-M-null` | 15 |
| T-Shirt | L | - | `2-L-null` | 8 |
| T-Shirt | XL | - | `2-XL-null` | 5 |

**Google Sheets:**
```
| product_id | size | color | stock | variant_id |
|------------|------|-------|-------|------------|
| 2 | S | null | 10 | 2-S-null |
| 2 | M | null | 15 | 2-M-null |
| 2 | L | null | 8 | 2-L-null |
| 2 | XL | null | 5 | 2-XL-null |
```

### 3. **Color Only, No Size** (Colored Product)
**Example:** A phone case that comes in different colors but one size fits all

| Product | Size | Color | Variant ID | Stock |
|---------|------|-------|------------|-------|
| Phone Case | - | Red | `3-null-Red` | 20 |
| Phone Case | - | Blue | `3-null-Blue` | 15 |
| Phone Case | - | Green | `3-null-Green` | 12 |

**Google Sheets:**
```
| product_id | size | color | stock | variant_id |
|------------|------|-------|-------|------------|
| 3 | null | Red | 20 | 3-null-Red |
| 3 | null | Blue | 15 | 3-null-Blue |
| 3 | null | Green | 12 | 3-null-Green |
```

### 4. **Size + Color** (Complex Product)
**Example:** A t-shirt with multiple sizes and colors

| Product | Size | Color | Variant ID | Stock |
|---------|------|-------|------------|-------|
| T-Shirt | S | Red | `4-S-Red` | 8 |
| T-Shirt | S | Blue | `4-S-Blue` | 6 |
| T-Shirt | M | Red | `4-M-Red` | 12 |
| T-Shirt | M | Blue | `4-M-Blue` | 10 |
| T-Shirt | L | Red | `4-L-Red` | 5 |
| T-Shirt | L | Blue | `4-L-Blue` | 7 |

**Google Sheets:**
```
| product_id | size | color | stock | variant_id |
|------------|------|-------|-------|------------|
| 4 | S | Red | 8 | 4-S-Red |
| 4 | S | Blue | 6 | 4-S-Blue |
| 4 | M | Red | 12 | 4-M-Red |
| 4 | M | Blue | 10 | 4-M-Blue |
| 4 | L | Red | 5 | 4-L-Red |
| 4 | L | Blue | 7 | 4-L-Blue |
```

## 🎯 Real-World Examples

### Example 1: **Phone Case** (Color Only)
```typescript
const phoneCase = {
  id: 1,
  name: "iPhone Case",
  sizes: [], // No sizes
  colors: ["Red", "Blue", "Green", "Black"],
  stock: 67 // Total stock across all colors
}

// Generated variants:
// 1-null-Red (20 stock)
// 1-null-Blue (15 stock) 
// 1-null-Green (12 stock)
// 1-null-Black (20 stock)
```

### Example 2: **Socks** (Size Only)
```typescript
const socks = {
  id: 2,
  name: "Cotton Socks",
  sizes: ["S", "M", "L", "XL"],
  colors: [], // No colors
  stock: 100 // Total stock across all sizes
}

// Generated variants:
// 2-S-null (25 stock)
// 2-M-null (30 stock)
// 2-L-null (25 stock)
// 2-XL-null (20 stock)
```

### Example 3: **T-Shirt** (Size + Color)
```typescript
const tshirt = {
  id: 3,
  name: "Cotton T-Shirt",
  sizes: ["S", "M", "L"],
  colors: ["White", "Black", "Blue"],
  stock: 90 // Total stock across all combinations
}

// Generated variants:
// 3-S-White (10 stock)
// 3-S-Black (8 stock)
// 3-S-Blue (12 stock)
// 3-M-White (15 stock)
// 3-M-Black (12 stock)
// 3-M-Blue (10 stock)
// 3-L-White (8 stock)
// 3-L-Black (7 stock)
// 3-L-Blue (8 stock)
```

### Example 4: **Keychain** (No Size, No Color)
```typescript
const keychain = {
  id: 4,
  name: "Metal Keychain",
  sizes: [], // No sizes
  colors: [], // No colors
  stock: 50 // Single variant
}

// Generated variant:
// 4-null-null (50 stock)
```

## 🔧 How the System Handles Each Scenario

### 1. **Variant Generation Logic**

```typescript
function generateProductVariants(product) {
  const variants = []
  
  // Scenario 1: No sizes or colors
  if ((!product.sizes || product.sizes.length === 0) && 
      (!product.colors || product.colors.length === 0)) {
    variants.push({
      productId: product.id,
      size: null,
      color: null,
      stock: product.stock,
      variantId: generateVariantId(product.id) // 1-null-null
    })
    return variants
  }
  
  // Scenario 2: Only sizes
  if (product.sizes && product.sizes.length > 0 && 
      (!product.colors || product.colors.length === 0)) {
    for (const size of product.sizes) {
      variants.push({
        productId: product.id,
        size,
        color: null,
        stock: Math.floor(product.stock / product.sizes.length),
        variantId: generateVariantId(product.id, size) // 1-S-null
      })
    }
    return variants
  }
  
  // Scenario 3: Only colors
  if (product.colors && product.colors.length > 0 && 
      (!product.sizes || product.sizes.length === 0)) {
    for (const color of product.colors) {
      variants.push({
        productId: product.id,
        size: null,
        color,
        stock: Math.floor(product.stock / product.colors.length),
        variantId: generateVariantId(product.id, null, color) // 1-null-Red
      })
    }
    return variants
  }
  
  // Scenario 4: Both sizes and colors
  if (product.sizes && product.sizes.length > 0 && 
      product.colors && product.colors.length > 0) {
    for (const size of product.sizes) {
      for (const color of product.colors) {
        variants.push({
          productId: product.id,
          size,
          color,
          stock: Math.floor(product.stock / (product.sizes.length * product.colors.length)),
          variantId: generateVariantId(product.id, size, color) // 1-S-Red
        })
      }
    }
    return variants
  }
  
  return variants
}
```

### 2. **Stock Validation Logic**

```typescript
function validateVariantStock(cartItems, variantsData) {
  for (const cartItem of cartItems) {
    // Find the specific variant
    const variant = variantsData.find(v => 
      v.productId === cartItem.id && 
      v.size === cartItem.selectedSize && // null if no size
      v.color === cartItem.selectedColor  // null if no color
    )

    if (!variant) {
      errors.push(`${cartItem.name} (${cartItem.selectedSize || 'No size'}${cartItem.selectedColor ? `, ${cartItem.selectedColor}` : ''}): Variant not found`)
      continue
    }

    if (cartItem.quantity > variant.stock) {
      errors.push(`${cartItem.name} (${cartItem.selectedSize || 'No size'}${cartItem.selectedColor ? `, ${cartItem.selectedColor}` : ''}): Only ${variant.stock} available`)
      continue
    }
  }
}
```

## 📱 User Interface Behavior

### 1. **No Size, No Color**
- ✅ Direct "Add to Cart" button
- ✅ No selection required
- ✅ Shows total stock

### 2. **Size Only**
- ✅ Size selection required
- ✅ Shows stock per size
- ✅ Disables out-of-stock sizes

### 3. **Color Only**
- ✅ Color selection required
- ✅ Shows stock per color
- ✅ Disables out-of-stock colors

### 4. **Size + Color**
- ✅ Both selections required
- ✅ Shows stock per combination
- ✅ Disables out-of-stock combinations

## 🎨 Variant ID Examples Summary

| Scenario | Size | Color | Variant ID | Example |
|----------|------|-------|------------|---------|
| No Size, No Color | null | null | `1-null-null` | Keychain |
| Size Only | S | null | `2-S-null` | Socks |
| Color Only | null | Red | `3-null-Red` | Phone Case |
| Size + Color | M | Blue | `4-M-Blue` | T-Shirt |
| Size + Color (spaces) | L | Blue Sky | `5-L-Blue%20Sky` | T-Shirt |

## ✅ Benefits of This Approach

1. **Universal Coverage**: Handles all possible product configurations
2. **Consistent Logic**: Same validation and update logic for all scenarios
3. **Flexible**: Easy to add new products with any combination
4. **Scalable**: Works with any number of sizes or colors
5. **User-Friendly**: UI adapts to show only relevant options

The system is designed to be completely flexible and handle any product configuration your business needs! 