"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogoutMutation } from "@/hooks/use-auth-queries";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();
  const logoutMutation = useLogoutMutation();
  const [mounted, setMounted] = useState(false);

  // Address Modal state
  const [showModal, setShowModal] = useState(false);
  const [label, setLabel] = useState("Home");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth Guard redirect
  useEffect(() => {
    if (mounted && _hasHydrated && !user) {
      router.push("/login?redirect=/profile");
    }
  }, [mounted, _hasHydrated, user, router]);

  // Fetch addresses using TanStack Query
  const { data: addresses = [], refetch } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: () => apiClient("/api/v1/addresses").then((res) => res.data || []),
    enabled: !!user,
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !city || !state || !pincode) return;

    setLoading(true);
    try {
      const res = await apiClient("/api/v1/addresses", {
        method: "POST",
        body: JSON.stringify({
          label,
          address,
          landmark,
          city,
          state,
          pincode,
          phone,
          isDefault: addresses.length === 0, // auto default if first address
        }),
      });

      if (res.success) {
        await refetch();
        setShowModal(false);
        // Reset form
        setLabel("Home");
        setAddress("");
        setLandmark("");
        setCity("");
        setState("");
        setPincode("");
        setPhone("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await apiClient(`/api/v1/addresses/${id}`, {
        method: "DELETE",
      });
      if (res.success) {
        refetch();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await apiClient(`/api/v1/addresses/${id}/default`, {
        method: "POST",
      });
      if (res.success) {
        refetch();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!mounted || !_hasHydrated || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Card */}
        <div className="rounded-3xl border border-emerald-50 bg-card p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white text-lg sm:text-xl font-bold shrink-0">
                {user.firstName ? user.firstName[0].toUpperCase() : "U"}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-extrabold text-foreground truncate">
                  {`${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="flex flex-col text-sm space-y-1.5 border-t border-emerald-50/50 sm:border-t-0 pt-4 sm:pt-0">
              <div className="flex justify-between gap-6">
                <span className="text-muted-foreground font-semibold">Email:</span>
                <span className="font-semibold text-foreground truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex justify-between gap-6">
                  <span className="text-muted-foreground font-semibold">Phone:</span>
                  <span className="font-semibold text-foreground">{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          <Button onClick={handleLogout} variant="outline" className="rounded-xl border-emerald-100 hover:bg-emerald-50 text-destructive hover:text-destructive w-full sm:w-auto self-start">
            Sign Out
          </Button>
        </div>

        {/* Address Book Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Address Book</h2>
            <Button
              onClick={() => setShowModal(true)}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              + Add Address
            </Button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-dashed border-emerald-100 bg-card p-6">
              <p className="text-sm text-muted-foreground mb-4">You have no saved addresses yet.</p>
              <Button
                onClick={() => setShowModal(true)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                Add Your First Address
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((addr: any) => (
                <div key={addr.id} className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-extrabold text-base text-foreground">{addr.label}</span>
                      {addr.isDefault === 1 && (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{addr.address}</p>
                    {addr.landmark && (
                      <p className="text-xs text-muted-foreground italic pt-1">Landmark: {addr.landmark}</p>
                    )}
                    <p className="text-sm font-semibold text-foreground pt-1.5">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    {addr.phone && (
                      <p className="text-xs font-bold text-emerald-700 pt-1">
                        📞 Delivery Phone: {addr.phone}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-emerald-50/50">
                    {addr.isDefault !== 1 ? (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Primary</span>
                    )}

                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-xs font-bold text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Address Form Dialog Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card rounded-3xl border border-emerald-50 p-6 shadow-xl space-y-6">
            <div className="border-b border-emerald-50 pb-4">
              <h2 className="text-xl font-bold text-foreground">Add Saved Address</h2>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground block">Address Label</label>
                <select
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full rounded-xl border border-emerald-100 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work / Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground block">Address Line</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat No, House Name, Street"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground block">Landmark (Optional)</label>
                <Input
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near Sector 4 Temple"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">City</label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New Delhi"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">State</label>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Delhi"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground block">Pin Code</label>
                <Input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="110001"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground block">Delivery Contact Mobile Number</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-emerald-50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border-emerald-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  {loading ? "Adding..." : "Add Address"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
