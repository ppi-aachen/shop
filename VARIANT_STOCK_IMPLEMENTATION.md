# Variant-Based Stock Management Implementation

## Overview

This implementation provides variant-specific stock management where each product variant (size/color combination) has its own stock level. This solves the problem of overselling specific variants while others remain in stock.

## 🎯 Key Features

### 1. **Variant-Specific Stock Tracking**
- Each size/color combination has its own stock level
- Real-time stock validation per variant
- Prevents overselling of specific variants

### 2. **Backward Compatibility**
- System automatically falls back to legacy stock management if variants aren't available
- Existing products continue to work without modification

### 3. **Smart Stock Distribution**
- Setup script automatically distributes existing stock across variants
- Handles edge cases (remainder stock distribution)

### 4. **Enhanced User Experience**
- Shows stock levels for each variant option
- Disables out-of-stock variants
- Clear stock information in product modal

## 📊 Google Sheets Structure

### Products Sheet (Existing)
\`\`\`
| id | name | price | image | description | sizes | colors | stock | ... |
|----|------|-------|-------|-------------|-------|--------|-------|-----|
| 1  | T-Shirt | 25.99 | image.jpg | Cotton t-shirt | S,M,L | Red,White | 15 | ... |
\`\`\`

### Product_Variants Sheet (New)
\`\`\`
| product_id | size | color | stock | variant_id |
|------------|------|-------|-------|------------|
| 1 | S | Red | 5 | 1-S-Red |
| 1 | S | White | 3 | 1-S-White |
| 1 | M | Red | 7 | 1-M-Red |
| 1 | M | White | 2 | 1-M-White |
| 1 | L | Red | 0 | 1-L-Red |
| 1 | L | White | 4 | 1-L-White |
\`\`\`

## 🔧 Implementation Details

### 1. **Data Structures**

#### ProductVariant Interface
\`\`\`typescript
interface ProductVariant {
  productId: number
  size?: string
  color?: string
  stock: number
  variantId: string
}
\`\`\`

#### Updated ProductData Interface
\`\`\`typescript
interface ProductData {
  // ... existing fields
  stock: number // Total stock (sum of all variants)
  variants?: ProductVariant[] // Individual variant stock levels
}
\`\`\`

#### Updated CartItem Interface
\`\`\`typescript
interface CartItem {
  // ... existing fields
  stock: number // Total stock (for backward compatibility)
  variantStock?: number // Stock for the specific variant
  variantId?: string // Unique variant identifier
}
\`\`\`

### 2. **Utility Functions**

#### Variant ID Generation
\`\`\`typescript
function generateVariantId(productId: number, size?: string, color?: string): string {
  const sizePart = size || 'null'
  const colorPart = color || 'null'
  return `${productId}-${sizePart}-${colorPart}`
}
\`\`\`

#### Stock Calculation
\`\`\`typescript
function getVariantStock(variants: ProductVariant[], size?: string, color?: string): number {
  const variantId = generateVariantId(0, size, color)
  const variant = variants.find(v => {
    const vId = generateVariantId(v.productId, v.size, v.color)
    return vId === variantId
  })
  return variant?.stock || 0
}
\`\`\`

### 3. **Stock Validation**

#### Variant-Based Validation
\`\`\`typescript
async function validateVariantStock(cartItems: CartItem[], variantsData: ProductVariant[]) {
  for (const cartItem of cartItems) {
    const variant = variantsData.find(v => 
      v.productId === cartItem.id && 
      v.size === cartItem.selectedSize && 
      v.color === cartItem.selectedColor
    )

    if (!variant) {
      errors.push(`${cartItem.name} (${cartItem.selectedSize || 'No size'}${cartItem.selectedColor ? `, ${cartItem.selectedColor}` : ''}): Variant not found`)
      continue
    }

    if (variant.stock <= 0) {
      errors.push(`${cartItem.name} (${cartItem.selectedSize || 'No size'}${cartItem.selectedColor ? `, ${cartItem.selectedColor}` : ''}): Out of stock`)
      continue
    }

    if (cartItem.quantity > variant.stock) {
      errors.push(`${cartItem.name} (${cartItem.selectedSize || 'No size'}${cartItem.selectedColor ? `, ${cartItem.selectedColor}` : ''}): Only ${variant.stock} available, but ${cartItem.quantity} requested`)
      continue
    }
  }
}
\`\`\`

### 4. **Stock Updates**

#### Variant-Based Updates
\`\`\`typescript
async function updateVariantStock(cartItems: CartItem[], variantRows: string[][], accessToken: string) {
  for (const cartItem of cartItems) {
    const variantKey = `${cartItem.id}-${cartItem.selectedSize || 'null'}-${cartItem.selectedColor || 'null'}`
    const variantData = variantMap.get(variantKey)
    
    if (variantData) {
      const newStock = Math.max(0, variantData.currentStock - cartItem.quantity)
      // Update specific variant stock
    }
  }
}
\`\`\`

## 🚀 Setup Instructions

### 1. **Run Setup Script**
\`\`\`bash
cd shop
node scripts/setup-variant-stock.js
\`\`\`

### 2. **Environment Variables**
Ensure these are set in Vercel:
- `GOOGLE_SHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

### 3. **Manual Setup (Alternative)**
1. Create a new sheet called "Product_Variants"
2. Add headers: `product_id`, `size`, `color`, `stock`, `variant_id`
3. Add variant rows for each product

## 📱 User Interface Updates

### 1. **Product Modal**
- Shows stock levels for each size/color option
- Disables out-of-stock variants
- Displays current variant stock when selected

### 2. **Stock Display**
\`\`\`typescript
// Size buttons with stock
{product.sizes!.map((size) => {
  const sizeStock = product.variants 
    ? product.variants.find((v: ProductVariant) => v.size === size && v.color === selectedColor)?.stock || 0
    : product.stock
  const isOutOfStock = sizeStock <= 0
  
  return (
    <Button
      key={size}
      disabled={isOutOfStock}
      className={`${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {size} ({sizeStock})
    </Button>
  )
})}
\`\`\`

### 3. **Stock Information Panel**
\`\`\`typescript
{product.variants && selectedSize && selectedColor && (
  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <p className="text-sm text-blue-700 font-medium">
      Stock: {product.variants.find((v: ProductVariant) => v.size === selectedSize && v.color === selectedColor)?.stock || 0} available
    </p>
  </div>
)}
\`\`\`

## 🔄 Migration Strategy

### 1. **Automatic Migration**
- Setup script reads existing products
- Distributes stock across variants
- Creates Product_Variants sheet
- Updates Products sheet with total stock

### 2. **Stock Distribution Logic**
\`\`\`typescript
// For size-only products
const stockPerSize = Math.floor(totalStock / sizes.length)
const remainder = totalStock % sizes.length

// For color-only products
const stockPerColor = Math.floor(totalStock / colors.length)
const remainder = totalStock % colors.length

// For size + color products
const totalVariants = sizes.length * colors.length
const stockPerVariant = Math.floor(totalStock / totalVariants)
const remainder = totalStock % totalVariants
\`\`\`

### 3. **Fallback System**
- If Product_Variants sheet doesn't exist, uses legacy stock
- If variant not found, falls back to product-level stock
- Maintains backward compatibility

## 🧪 Testing

### 1. **Test Scenarios**
- Valid variant order
- Out-of-stock variant order
- Exceeding variant stock
- Mixed valid/invalid variants
- Legacy fallback

### 2. **Test Script**
\`\`\`bash
node scripts/test-stock-validation.js
\`\`\`

### 3. **Manual Testing**
1. Create products with variants
2. Set different stock levels per variant
3. Test checkout with various combinations
4. Verify stock updates correctly

## 📊 Benefits

### 1. **For Customers**
- ✅ Accurate stock information per variant
- ✅ Prevents ordering unavailable variants
- ✅ Better shopping experience
- ✅ Clear feedback on availability

### 2. **For Business**
- ✅ Prevents overselling specific variants
- ✅ Accurate inventory tracking
- ✅ Better inventory management
- ✅ Reduced order cancellations

### 3. **For System**
- ✅ Robust stock validation
- ✅ Scalable architecture
- ✅ Backward compatibility
- ✅ Easy maintenance

## 🔍 Monitoring

### 1. **Vercel Logs**
Monitor these messages:
- `"Using variant-based stock validation"`
- `"Using legacy stock validation"`
- `"Updating variant stock for [product]"`
- `"Variant not found, falling back to legacy"`

### 2. **Google Sheets**
- Product_Variants sheet shows individual variant stock
- Products sheet shows total stock
- Real-time updates during checkout

## 🎯 Next Steps

1. **Deploy the changes** to Vercel
2. **Run the setup script** to create variants
3. **Test with real orders** to verify functionality
4. **Monitor logs** for any issues
5. **Adjust variant stock** as needed

The variant-based stock management system is now fully implemented and ready for production use!
