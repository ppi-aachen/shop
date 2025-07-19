# Troubleshooting: Stock Showing as 0

## 🚨 Problem
After setting up the variant-based stock system, all products are showing 0 stock.

## 🔍 Root Cause Analysis

The most likely causes are:

1. **Product_Variants sheet doesn't exist**
2. **Product_Variants sheet exists but has no data**
3. **Product ID mismatch between Products and Product_Variants sheets**
4. **Missing or incorrect column headers**
5. **Stock values are not numeric**

## 🛠️ Step-by-Step Troubleshooting

### Step 1: Check if Product_Variants Sheet Exists

1. Open your Google Sheets
2. Look for a sheet named **"Product_Variants"** (exact spelling)
3. If it doesn't exist, run the setup script:
   ```bash
   node scripts/setup-variant-stock.js
   ```

### Step 2: Verify Product_Variants Sheet Structure

Your Product_Variants sheet should have these exact headers:
```
| product_id | size | color | stock | variant_id |
|------------|------|-------|-------|------------|
```

**Check:**
- ✅ Column names are exactly as shown above
- ✅ No extra spaces in column names
- ✅ Headers are in row 1
- ✅ Data starts from row 2

### Step 3: Verify Product ID Matching

**Critical:** The `product_id` in Product_Variants must match the `id` in Products sheet.

**Example:**
```
Products Sheet:
| id | name | price | ... |
|----|------|-------|-----|
| 1  | T-Shirt | 25.99 | ... |
| 2  | Phone Case | 15.99 | ... |

Product_Variants Sheet:
| product_id | size | color | stock | variant_id |
|------------|------|-------|-------|------------|
| 1 | S | Red | 5 | 1-S-Red |
| 1 | S | Blue | 3 | 1-S-Blue |
| 2 | null | Red | 10 | 2-null-Red |
```

### Step 4: Check Stock Values

**Stock values must be numeric:**
```
✅ Correct: 5, 10, 25, 0
❌ Wrong: "5", "ten", "out of stock", ""
```

### Step 5: Verify Data Format

**Size and Color columns:**
- Use `null` (text) for no size/color
- Use exact values that match your Products sheet
- No extra spaces

**Example:**
```
| product_id | size | color | stock | variant_id |
|------------|------|-------|-------|------------|
| 1 | S | Red | 5 | 1-S-Red |
| 1 | S | null | 3 | 1-S-null |
| 1 | null | Red | 10 | 1-null-Red |
| 1 | null | null | 15 | 1-null-null |
```

## 🔧 Quick Fixes

### Fix 1: Run Setup Script Again
```bash
cd shop
node scripts/setup-variant-stock.js
```

### Fix 2: Manual Product_Variants Creation

1. Create a new sheet named "Product_Variants"
2. Add headers: `product_id`, `size`, `color`, `stock`, `variant_id`
3. Add data rows for each product variant

### Fix 3: Check Product IDs

1. In Products sheet, note the `id` values
2. In Product_Variants sheet, ensure `product_id` matches exactly
3. Fix any mismatches

### Fix 4: Verify Stock Values

1. Select all stock values in Product_Variants sheet
2. Format as "Number" (not text)
3. Ensure no empty cells

## 🧪 Testing Your Setup

### Test 1: Check Sheet Structure
```bash
# This will show you the current state
node scripts/debug-variant-stock.js
```

### Test 2: Manual Verification
1. Open your Google Sheets
2. Check Products sheet has products with IDs
3. Check Product_Variants sheet has matching product_ids
4. Verify stock values are numbers > 0

### Test 3: Sample Data Test
Create this test data in Product_Variants:
```
| product_id | size | color | stock | variant_id |
|------------|------|-------|-------|------------|
| 1 | S | Red | 10 | 1-S-Red |
| 1 | M | Red | 15 | 1-M-Red |
| 1 | L | Red | 8 | 1-L-Red |
```

## 🎯 Common Issues and Solutions

### Issue 1: "Product_Variants sheet not found"
**Solution:** Create the sheet or run setup script

### Issue 2: "No variants found for product"
**Solution:** Check product_id matching between sheets

### Issue 3: "Stock is 0 for all variants"
**Solution:** Verify stock column has numeric values > 0

### Issue 4: "Variants exist but stock still shows 0"
**Solution:** Check column headers are exactly correct

### Issue 5: "Some products work, others don't"
**Solution:** Check individual product_id values match

## 📊 Expected Behavior

### When Working Correctly:
- ✅ Products show total stock from all variants
- ✅ Product modal shows stock per variant
- ✅ Out-of-stock variants are disabled
- ✅ Stock validation works during checkout

### When Not Working:
- ❌ All products show 0 stock
- ❌ Product modal shows no stock information
- ❌ All variants appear available
- ❌ Checkout fails with stock errors

## 🚀 Quick Recovery Steps

1. **Backup your current data**
2. **Run setup script:** `node scripts/setup-variant-stock.js`
3. **Verify the generated Product_Variants sheet**
4. **Adjust stock values as needed**
5. **Test with a sample order**

## 📞 Still Having Issues?

If you're still seeing 0 stock after following these steps:

1. **Check Vercel logs** for error messages
2. **Verify environment variables** are set correctly
3. **Ensure Google Sheets permissions** are correct
4. **Try the debug script** to see detailed information

The most common cause is a mismatch between product IDs or missing Product_Variants sheet data. 