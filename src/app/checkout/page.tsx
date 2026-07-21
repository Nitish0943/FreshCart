"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart-queries";
import { usePlaceOrderMutation } from "@/hooks/use-order-queries";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  useCart();
  const { items } = useCartStore();
  const placeOrderMutation = usePlaceOrderMutation();

  const [mounted, setMounted] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "CARD" | "UPI">("COD");

  // Address Modal state
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newLabel, setNewLabel] = useState("Home");
  const [newAddress, setNewAddress] = useState("");
  const [newLandmark, setNewLandmark] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newPincode, setNewPincode] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);

  // Fetch addresses inline using TanStack Query
  const { data: addresses = [], isLoading: addressesLoading, refetch } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: () => apiClient("/api/v1/addresses").then((res) => res.data || []),
    enabled: !!user,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-select default address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a: any) => a.isDefault === 1);
      if (def) {
        setSelectedAddressId(def.id);
      } else {
        setSelectedAddressId(addresses[0].id);
      }
    }
  }, [addresses, selectedAddressId]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress || !newCity || !newState || !newPincode) return;

    setAddressLoading(true);
    try {
      const res = await apiClient("/api/v1/addresses", {
        method: "POST",
        body: JSON.stringify({
          label: newLabel,
          address: newAddress,
          landmark: newLandmark,
          city: newCity,
          state: newState,
          pincode: newPincode,
          phone: newPhone,
          isDefault: addresses.length === 0 ? 1 : 0,
        }),
      });

      if (res.success) {
        await refetch();
        setNewLabel("Home");
        setNewAddress("");
        setNewLandmark("");
        setNewCity("");
        setNewState("");
        setNewPincode("");
        setNewPhone("");
        setShowAddAddressModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddressLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!selectedAddressId) {
      alert("Please select a delivery address.");
      return;
    }

    placeOrderMutation.mutate(
      {
        addressId: selectedAddressId,
        paymentMethod,
      },
      {
        onSuccess: (data: any) => {
          // Clear cart
          useCartStore.getState().clearCart();
          if (data?.success && data?.data?.id) {
            router.push(`/orders/success/${data.data.id}`);
          } else {
            router.push("/orders");
          }
        },
      }
    );
  };

  const itemTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 0; // FREE as in checkout.html
  const platformFee = 5; // ₹5 as in checkout.html
  const grandTotal = itemTotal + deliveryFee + platformFee;

  const loading = placeOrderMutation.isPending || addressesLoading;
  const error = placeOrderMutation.error?.message;

  if (!mounted || !_hasHydrated || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Checkout Forms */}
          <div className="flex-1 space-y-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Secure Checkout
            </h2>

            {error && (
              <div className="rounded-xl bg-destructive/10 p-4 text-center text-sm font-semibold text-destructive">
                {error}
              </div>
            )}

            {/* Step 1: Shipping Address */}
            <section className="bg-white p-6 rounded-3xl border border-emerald-50/50 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Delivery Address</h3>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowAddAddressModal(true)}
                  variant="outline"
                  className="rounded-xl border-emerald-100 hover:bg-emerald-50 text-emerald-700 font-bold text-xs w-full sm:w-auto"
                >
                  + Add New Address
                </Button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-10 rounded-2xl border border-dashed border-emerald-100 bg-emerald-50/5 p-6">
                  <p className="text-sm text-muted-foreground mb-4">No saved addresses found.</p>
                  <Button
                    type="button"
                    onClick={() => setShowAddAddressModal(true)}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                  >
                    Add Your First Address
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr: any) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`relative flex flex-col justify-between rounded-2xl border p-4 cursor-pointer transition-all ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/15 ring-2 ring-emerald-500/20"
                            : "border-emerald-50 bg-background/50 hover:bg-emerald-50/5"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-extrabold text-sm text-foreground">{addr.label}</span>
                            {addr.isDefault === 1 && (
                              <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {addr.address}
                            {addr.landmark && `, ${addr.landmark}`}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed font-semibold pt-1">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          {addr.phone && (
                            <p className="text-xs text-emerald-700 font-bold pt-1">
                              📞 {addr.phone}
                            </p>
                          )}
                        </div>
                        
                        {isSelected && (
                          <span className="absolute top-4 right-4 text-emerald-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-5 w-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Step 2: Payment Details */}
            <section className="bg-white p-6 rounded-3xl border border-emerald-50/50 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  2
                </div>
                <h3 className="text-lg font-bold text-foreground">Payment Method</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cash On Delivery (COD) */}
                <label
                  className={`flex flex-col justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === "COD"
                      ? "border-emerald-500 bg-emerald-50/15"
                      : "border-emerald-50 hover:bg-emerald-50/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-emerald-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H2.25m18 0v-9m0 9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25m-18 13.5V18.75m0 0a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25M10.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm7.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-foreground block">Cash On Delivery</span>
                    <span className="text-[10px] text-muted-foreground">Pay when groceries arrive</span>
                  </div>
                </label>

                {/* Credit / Debit Card */}
                <label
                  className={`flex flex-col justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === "CARD"
                      ? "border-emerald-500 bg-emerald-50/15"
                      : "border-emerald-50 hover:bg-emerald-50/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "CARD"}
                      onChange={() => setPaymentMethod("CARD")}
                      className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-emerald-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-foreground block">Credit / Debit Card</span>
                    <span className="text-[10px] text-muted-foreground">Visa, Mastercard, RuPay</span>
                  </div>
                </label>

                {/* UPI Options */}
                <label
                  className={`flex flex-col justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === "UPI"
                      ? "border-emerald-500 bg-emerald-50/15"
                      : "border-emerald-50 hover:bg-emerald-50/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "UPI"}
                      onChange={() => setPaymentMethod("UPI")}
                      className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-emerald-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-foreground block">UPI Options</span>
                    <span className="text-[10px] text-muted-foreground">GPay, PhonePe, Paytm</span>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary sidebar */}
          <aside className="w-full lg:w-96">
            <div className="sticky top-24 bg-white p-6 rounded-3xl border border-emerald-50/50 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-foreground border-b border-slate-50 pb-4">
                Order Summary
              </h3>

              {/* Items List */}
              <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Your cart is empty.</p>
                ) : (
                  items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-4 text-xs">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-slate-800 block truncate">{item.name}</span>
                        <span className="text-[10px] text-muted-foreground block">
                          {item.quantity} × ₹{item.price.toFixed(2)}
                        </span>
                      </div>
                      <span className="font-extrabold text-slate-800">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Price Calculations */}
              <div className="border-t border-slate-50 pt-4 space-y-2.5 text-xs text-muted-foreground font-semibold">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span className="text-foreground">₹{itemTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="text-foreground">₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-200">
                  <span className="text-sm font-bold text-foreground">Grand Total</span>
                  <span className="text-base font-extrabold text-emerald-600">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Security Shield */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5 text-emerald-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                <span className="text-[10px] font-bold text-emerald-800 leading-relaxed">
                  Safest packaging and logistics practices in place.
                </span>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={loading || items.length === 0 || !selectedAddressId}
                className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/10 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                {placeOrderMutation.isPending ? "Processing..." : "Place Order"}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            </div>
          </aside>
        </div>
      </main>

      {/* Add Address Modal Component */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-emerald-50 p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="text-lg font-bold text-foreground">Add New Address</h3>
              <button
                onClick={() => setShowAddAddressModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Label
                </label>
                <select
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full rounded-xl border border-emerald-100 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Address Line
                </label>
                <Input
                  required
                  placeholder="House No, Building, Street Name"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="rounded-xl border-emerald-100 bg-card focus-visible:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Landmark (Optional)
                </label>
                <Input
                  placeholder="Near Central Park, Opp Main Gate"
                  value={newLandmark}
                  onChange={(e) => setNewLandmark(e.target.value)}
                  className="rounded-xl border-emerald-100 bg-card focus-visible:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    City
                  </label>
                  <Input
                    required
                    placeholder="New York"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="rounded-xl border-emerald-100 bg-card focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    State
                  </label>
                  <Input
                    required
                    placeholder="NY"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="rounded-xl border-emerald-100 bg-card focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Pincode
                </label>
                <Input
                  required
                  placeholder="10001"
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value)}
                  className="rounded-xl border-emerald-100 bg-card focus-visible:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Contact Mobile Number (For Delivery Driver)
                </label>
                <Input
                  required
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="rounded-xl border-emerald-100 bg-card focus-visible:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  variant="outline"
                  className="flex-1 rounded-xl border-emerald-100 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addressLoading}
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs"
                >
                  {addressLoading ? "Saving..." : "Save Address"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
