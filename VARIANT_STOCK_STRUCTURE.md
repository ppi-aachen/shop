# Variant-Based Stock Management Structure

## Overview

This document outlines the new variant-based stock management system where each product variant (size/color combination) has its own stock level.

## Google Sheets Structure

### Products Sheet (Main Product Information)
\`\`\`
| id | name | price | image | description | sizes | colors | ... |
|----|------|-------|-------|-------------|-------|--------|-----|
| 1  | T-Shirt | 25.99 | image.jpg | Cotton t-shirt | S,M,L | Red,White | ... |
\`\`\`

### Product_Variants Sheet (Variant-Specific Stock)
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

### Variant Generation Rules

1. **No variants**: Product with no sizes/colors
   - Single variant: `{ product_id: 1, size: null, color: null, stock: 10 }`

2. **Size only**: Product with sizes but no colors
   - Variants: `S`, `M`, `L` each with their own stock

3. **Color only**: Product with colors but no sizes
   - Variants: `Red`, `White` each with their own stock

4. **Size + Color**: Product with both sizes and colors
   - Variants: `S-Red`, `S-White`, `M-Red`, `M-White`, `L-Red`, `L-White`

## Implementation Plan

### Phase 1: Data Structure Updates
- [ ] Update ProductData interface to include variant stock
- [ ] Create ProductVariant interface
- [ ] Update CartItem interface for variant-specific stock

### Phase 2: Google Sheets Integration
- [ ] Create Product_Variants sheet structure
- [ ] Update getProductsFromGoogleSheet to fetch variant data
- [ ] Update stock validation for variants
- [ ] Update stock update logic for variants

### Phase 3: UI Updates
- [ ] Update product modal to show variant-specific stock
- [ ] Update cart to handle variant stock
- [ ] Update checkout validation for variants

### Phase 4: Migration Tools
- [ ] Create migration script to convert existing stock to variants
- [ ] Create setup script for new variant structure

## Variant ID Generation

The `variant_id` is a unique identifier for each variant:
- Format: `{product_id}-{size}-{color}`
- Examples:
  - `1-S-Red` (Product 1, Size S, Color Red)
  - `1-M-null` (Product 1, Size M, No color)
  - `1-null-White` (Product 1, No size, Color White)
  - `1-null-null` (Product 1, No size, No color)

## Stock Calculation Logic

### For Display (Product Level)
- **Total Stock**: Sum of all variant stocks
- **In Stock**: True if any variant has stock > 0
- **Low Stock**: True if any variant has stock <= 2

### For Cart/Checkout (Variant Level)
- **Available Stock**: Stock for specific size/color combination
- **Can Add to Cart**: Stock > 0 for selected variant
- **Can Checkout**: Stock >= requested quantity for selected variant

## Migration Strategy

### Option 1: Automatic Migration
- Create Product_Variants sheet automatically
- Distribute existing stock across variants
- Update existing products to use new structure

### Option 2: Manual Setup
- Provide setup script for manual variant creation
- Allow custom stock distribution
- Validate variant completeness

## Benefits

1. **Accurate Stock Tracking**: Each variant has precise stock levels
2. **Better UX**: Customers see exact availability for their chosen variant
3. **Prevents Overselling**: Real-time variant-specific stock validation
4. **Flexible Inventory**: Easy to manage different stock levels per variant
5. **Scalable**: Easy to add new variants or modify existing ones
