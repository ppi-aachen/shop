"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { ShoppingCartIcon, MinusIcon, PlusIcon } from "lucide-react"
import { ImageGallery } from "./image-gallery"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Product {
  ID: string
  Name: string
  Price: string
  Image: string
  "Images (JSON)": string
  Description: string
  "Detailed Description": string
  "Features (JSON)": string
  "Specifications (JSON)": string
  "Materials (JSON)": string
  "Care Instructions (JSON)": string
  "Sizes (JSON)": string
  "Colors (JSON)": string
  Stock: string
}

interface ProductModalProps {
  product: Product
  onClose: () => void
  onAddToCart: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => void
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined)
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined)

  const availableSizes: string[] = product["Sizes (JSON)"] ? JSON.parse(product["Sizes (JSON)"]) : []
  const availableColors: string[] = product["Colors (JSON)"] ? JSON.parse(product["Colors (JSON)"]) : []
  const features: string[] = product["Features (JSON)"] ? JSON.parse(product["Features (JSON)"]) : []
  const materials: string[] = product["Materials (JSON)"] ? JSON.parse(product["Materials (JSON)"]) : []
  const careInstructions: string[] = product["Care Instructions (JSON)"]
    ? JSON.parse(product["Care Instructions (JSON)"])
    : []
  const specifications: { [key: string]: string } = product["Specifications (JSON)"]
    ? JSON.parse(product["Specifications (JSON)"])
    : {}
  const images: string[] = product["Images (JSON)"] ? JSON.parse(product["Images (JSON)"]) : [product.Image]

  useEffect(() => {
    // Set default selected size/color if only one option exists
    if (availableSizes.length === 1) {
      setSelectedSize(availableSizes[0])
    }
    if (availableColors.length === 1) {
      setSelectedColor(availableColors[0])
    }
  }, [availableSizes, availableColors])

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, Math.min(Number.parseInt(product.Stock), prev + amount)))
  }

  const handleAddToCartClick = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      alert("Please select a size.")
      return
    }
    if (availableColors.length > 0 && !selectedColor) {
      alert("Please select a color.")
      return
    }
    onAddToCart(product, quantity, selectedSize, selectedColor)
  }

  const isAddToCartDisabled =
    Number.parseInt(product.Stock) <= 0 ||
    (availableSizes.length > 0 && !selectedSize) ||
    (availableColors.length > 0 && !selectedColor)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">{product.Name}</DialogTitle>
          <DialogDescription className="text-lg text-gray-600">
            €{Number.parseFloat(product.Price).toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <ImageGallery images={images} alt={product.Name} />
          <div className="space-y-6">
            <p className="text-gray-700">{product.Description}</p>

            {availableSizes.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <Label
                      key={size}
                      htmlFor={`size-${size}`}
                      className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 px-4 text-sm hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <RadioGroupItem id={`size-${size}`} value={size} className="sr-only" />
                      {size}
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {availableColors.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <Label
                      key={color}
                      htmlFor={`color-${color}`}
                      className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 px-4 text-sm hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <RadioGroupItem id={`color-${color}`} value={color} className="sr-only" />
                      {color}
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = Number.parseInt(e.target.value)
                    if (!isNaN(val) && val >= 1) {
                      setQuantity(Math.min(val, Number.parseInt(product.Stock)))
                    }
                  }}
                  className="w-20 text-center"
                  min="1"
                  max={Number.parseInt(product.Stock)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= Number.parseInt(product.Stock)}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                {Number.parseInt(product.Stock) > 0 ? `Only ${product.Stock} left in stock!` : "Out of Stock"}
              </p>
            </div>

            <Button className="w-full" onClick={handleAddToCartClick} disabled={isAddToCartDisabled}>
              <ShoppingCartIcon className="mr-2 h-4 w-4" />
              {Number.parseInt(product.Stock) > 0 ? "Add to Cart" : "Sold Out"}
            </Button>

            <Accordion type="multiple" className="w-full">
              {product["Detailed Description"] && (
                <AccordionItem value="detailed-description">
                  <AccordionTrigger>Detailed Description</AccordionTrigger>
                  <AccordionContent>
                    <p>{product["Detailed Description"]}</p>
                  </AccordionContent>
                </AccordionItem>
              )}

              {features.length > 0 && (
                <AccordionItem value="features">
                  <AccordionTrigger>Features</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5">
                      {features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}

              {Object.keys(specifications).length > 0 && (
                <AccordionItem value="specifications">
                  <AccordionTrigger>Specifications</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5">
                      {Object.entries(specifications).map(([key, value]) => (
                        <li key={key}>
                          <strong>{key}:</strong> {value}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}

              {materials.length > 0 && (
                <AccordionItem value="materials">
                  <AccordionTrigger>Materials</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5">
                      {materials.map((material, index) => (
                        <li key={index}>{material}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}

              {careInstructions.length > 0 && (
                <AccordionItem value="care-instructions">
                  <AccordionTrigger>Care Instructions</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5">
                      {careInstructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
