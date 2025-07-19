import { NextResponse } from "next/server"
import { getProductsFromSheet } from "@/lib/google-sheets-api"

export async function GET() {
  try {
    const products = await getProductsFromSheet()
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Failed to fetch products", error: error.message }, { status: 500 })
  }
}
