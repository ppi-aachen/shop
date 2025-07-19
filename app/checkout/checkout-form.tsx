"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/utils"
import { processCheckout } from "./actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"

const formSchema = z.object({
  customerName: z.string().min(2, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number is required." }),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  deliveryMethod: z.enum(["pickup", "delivery"], {
    message: "Please select a delivery method.",
  }),
  notes: z.string().optional(),
  proofOfPayment: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Proof of payment is required.")
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB.")
    .refine(
      (file) => ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
      "Only .jpg, .png, and .pdf formats are supported.",
    ),
})

export function CheckoutForm() {
  const { cart, clearCart } = useCart()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filePreview, setFilePreview] = useState<string | null>(null)

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup")
  const shippingCost = deliveryMethod === "delivery" ? 5.0 : 0.0
  const total = subtotal + shippingCost

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      deliveryMethod: "pickup",
      notes: "",
      proofOfPayment: new File([], ""), // Initialize with an empty file
    },
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      form.setValue("proofOfPayment", file)
      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file))
      } else {
        setFilePreview(null) // Clear preview for non-image files
      }
    } else {
      form.setValue("proofOfPayment", new File([], ""))
      setFilePreview(null)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append("customerName", values.customerName)
      formData.append("email", values.email)
      formData.append("phone", values.phone)
      formData.append("address", values.address || "")
      formData.append("city", values.city || "")
      formData.append("state", values.state || "")
      formData.append("zipCode", values.zipCode || "")
      formData.append("country", values.country || "")
      formData.append("deliveryMethod", values.deliveryMethod)
      formData.append("notes", values.notes || "")
      formData.append("cartItems", JSON.stringify(cart))
      formData.append("proofOfPayment", values.proofOfPayment)

      const result = await processCheckout({ success: false, message: "" }, formData)

      if (result.success) {
        toast.success(result.message)
        clearCart()
        router.push(`/success?orderId=${result.orderId}`)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center lg:text-left">Checkout</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Method</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="deliveryMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value: "pickup" | "delivery") => {
                            field.onChange(value)
                            setDeliveryMethod(value)
                          }}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="pickup" />
                            </FormControl>
                            <FormLabel className="font-normal">Pickup in Aachen (Free)</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="delivery" />
                            </FormControl>
                            <FormLabel className="font-normal">Delivery (Additional €5.00)</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {deliveryMethod === "delivery" && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Aachen" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input placeholder="NRW" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="52062" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="Germany" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes for your order (optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., specific delivery instructions" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Proof of Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md text-sm">
                  <p className="font-semibold mb-2">Please transfer the total amount to our PayPal:</p>
                  <p>
                    <strong>Account:</strong> treasury@ppiaachen.de
                  </p>
                  <p>
                    <strong>Name:</strong> PPI Aachen
                  </p>
                  <p className="mt-2">
                    After transferring, please upload a screenshot or PDF of your payment confirmation.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="proofOfPayment"
                  render={() => (
                    <FormItem>
                      <FormLabel>Upload Proof of Payment (JPG, PNG, PDF - Max 5MB)</FormLabel>
                      <FormControl>
                        <Input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
                      </FormControl>
                      <FormMessage />
                      {filePreview && (
                        <div className="mt-4">
                          <Image
                            src={filePreview || "/placeholder.svg"}
                            alt="Payment Proof Preview"
                            width={200}
                            height={200}
                            className="max-w-full h-auto rounded-md border"
                          />
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Place Order
            </Button>
          </form>
        </Form>
      </div>

      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <Image
                src={item.image || "/placeholder.svg?height=64&width=64&text=Product"}
                alt={item.name}
                width={64}
                height={64}
                className="rounded-md object-cover aspect-square"
              />
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-gray-500 text-sm">
                  {item.selectedSize && `Size: ${item.selectedSize}`}
                  {item.selectedColor && ` | Color: ${item.selectedColor}`}
                </p>
                <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
              </div>
              <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span className="font-medium">{formatCurrency(shippingCost)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
