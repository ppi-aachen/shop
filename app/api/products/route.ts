import { NextResponse } from "next/server"
import { getProductsFromSheet } from "@/lib/google-sheets-api"

export async function GET() {
  try {
    const products = await getProductsFromSheet()
    return NextResponse.json(products)
  } catch (error) {
    console.error("API Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
