"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/utils"
import { submitOrder } from "./actions"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2Icon } from "lucide-react"

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required." }),
  lastName: z.string().min(2, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number is required." }),
  deliveryMethod: z.enum(["pickup", "delivery"], { message: "Please select a delivery method." }),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  proofOfPayment: z.any().refine((file) => file?.size > 0, "Proof of payment is required."),
})

export function CheckoutForm() {
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()
  const [shippingCost, setShippingCost] = useState(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      deliveryMethod: "pickup",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      notes: "",
    },
  })

  const deliveryMethod = form.watch("deliveryMethod")

  useEffect(() => {
    setShippingCost(deliveryMethod === "delivery" ? 5.0 : 0.0) // Example: flat shipping fee
    // Clear address fields if switching to pickup
    if (deliveryMethod === "pickup") {
      form.setValue("address", "")
      form.setValue("city", "")
      form.setValue("state", "")
      form.setValue("zipCode", "")
      form.setValue("country", "")
    }
  }, [deliveryMethod, form])

  const totalAmount = cartState.totalAmount + shippingCost

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData()
    formData.append("firstName", values.firstName)
    formData.append("lastName", values.lastName)
    formData.append("email", values.email)
    formData.append("phone", values.phone)
    formData.append("deliveryMethod", values.deliveryMethod)
    formData.append("address", values.address || "")
    formData.append("city", values.city || "")
    formData.append("state", values.state || "")
    formData.append("zipCode", values.zipCode || "")
    formData.append("country", values.country || "")
    formData.append("notes", values.notes || "")
    formData.append("proofOfPayment", values.proofOfPayment)
    formData.append("cartItems", JSON.stringify(cartState.items))
    formData.append("subtotal", cartState.totalAmount.toFixed(2))
    formData.append("shippingCost", shippingCost.toFixed(2))
    formData.append("totalAmount", totalAmount.toFixed(2))
    formData.append("itemCount", cartState.itemCount.toString())

    startTransition(async () => {
      const result = await submitOrder(formData)
      if (result.success) {
        toast({
          title: "Order Placed!",
          description: `Your order #${result.orderId} has been placed successfully.`,
          variant: "success",
        })
        cartDispatch({ type: "CLEAR_CART" }) // Clear cart after successful order
        router.push(`/success?orderId=${result.orderId}`)
      } else {
        toast({
          title: "Order Failed",
          description: result.error || "There was an error placing your order. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
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
                  <Input placeholder="john.doe@example.com" type="email" {...field} />
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
                  <Input placeholder="+49 123 456789" type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Delivery Method */}
        <FormField
          control={form.control}
          name="deliveryMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Delivery Method</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="pickup" />
                    </FormControl>
                    <FormLabel className="font-normal">Pickup in Aachen</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="delivery" />
                    </FormControl>
                    <FormLabel className="font-normal">Delivery</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Delivery Address (Conditional) */}
        {deliveryMethod === "delivery" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
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
          </div>
        )}

        {/* Additional Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., specific delivery instructions" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Proof of Payment */}
        <FormField
          control={form.control}
          name="proofOfPayment"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Proof of Payment (PDF or Image)</FormLabel>
              <FormControl>
                <Input
                  {...fieldProps}
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(event) => onChange(event.target.files && event.target.files[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Order Summary */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-2xl font-bold mb-4">Order Summary</h3>
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal ({cartState.itemCount} items)</span>
              <span>{formatCurrency(cartState.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(shippingCost)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-gray-900 border-t pt-4 mt-4">
              <span>Total Amount</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Placing Order...
            </>
          ) : (
            "Place Order"
          )}
        </Button>
      </form>
    </Form>
  )
}
