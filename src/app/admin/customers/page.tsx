"use client";

import { useState } from "react";
import { useCustomersQuery } from "@/hooks/use-rider-queries";
import { Input } from "@/components/ui/input";

export default function AdminCustomersPage() {
  const { data: customers = [], isLoading: loading } = useCustomersQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Filter customers based on search term
  const filteredCustomers = customers.filter((c: any) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
    const email = (c.email || "").toLowerCase();
    const phone = (c.phone || "").toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Customers</h1>
          <p className="text-muted-foreground">Monitor client profiles, address books, purchase logs, and metrics.</p>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-xl border-emerald-100 bg-card focus-visible:ring-emerald-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-3xl bg-muted" />
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-emerald-100 p-8 text-muted-foreground bg-card">
          No registered customer accounts found matching your query.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Customers list table */}
          <div className="lg:col-span-2 rounded-3xl border border-emerald-50 bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="border-b border-emerald-50 bg-emerald-50/20 font-bold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Contact Info</th>
                    <th className="px-5 py-4">Primary Address</th>
                    <th className="px-5 py-4">Joined Date</th>
                    <th className="px-5 py-4">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50/50 text-xs">
                  {filteredCustomers.map((c: any) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className={`hover:bg-emerald-50/10 cursor-pointer transition-colors ${
                        selectedCustomer?.id === c.id ? "bg-emerald-50/15" : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold shadow-xs">
                            {c.firstName ? c.firstName[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <span className="font-extrabold text-foreground block">
                              {c.firstName} {c.lastName}
                            </span>
                            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              {c.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 space-y-0.5 font-medium text-muted-foreground">
                        <span className="block">{c.email}</span>
                        <span className="block font-mono text-[11px]">{c.phone || "—"}</span>
                      </td>
                      <td className="px-5 py-4 space-y-0.5">
                        <p className="text-foreground font-semibold max-w-[200px] truncate">{c.defaultAddress}</p>
                        <span className="text-[10px] text-muted-foreground font-semibold">PIN: {c.pincode}</span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground font-medium">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-right pr-4">
                          <span className="font-bold text-foreground block">{c.totalOrders}</span>
                          <span className="text-[10px] text-muted-foreground">orders</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Detail Operations Side Panel */}
          <div className="space-y-6">
            {selectedCustomer ? (
              <div className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-sm space-y-6">
                
                {/* Header card details */}
                <div className="flex items-center space-x-4 border-b border-emerald-50 pb-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white text-lg font-bold shadow-md shadow-emerald-500/10">
                    {selectedCustomer.firstName ? selectedCustomer.firstName[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-foreground">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </h2>
                    <span className="text-xs text-muted-foreground">Joined: {new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Performance Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-emerald-50 bg-emerald-50/5 p-4 text-center">
                    <span className="text-muted-foreground text-[10px] font-bold block uppercase">Total Spend</span>
                    <span className="text-base font-extrabold text-emerald-600 pt-1 block">
                      ₹{selectedCustomer.totalSpend.toFixed(2)}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-emerald-50 bg-emerald-50/5 p-4 text-center">
                    <span className="text-muted-foreground text-[10px] font-bold block uppercase">Order Count</span>
                    <span className="text-base font-extrabold text-foreground pt-1 block">
                      {selectedCustomer.totalOrders}
                    </span>
                  </div>
                </div>

                {/* Addresses display */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-foreground">Saved Address Book ({selectedCustomer.addresses.length})</h3>
                  {selectedCustomer.addresses.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground">No saved addresses on profile.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {selectedCustomer.addresses.map((a: any) => (
                        <div key={a.id} className="rounded-xl border border-emerald-50 bg-background p-3 text-[11px] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">{a.label}</span>
                            {a.isDefault === 1 && (
                              <span className="bg-emerald-50 text-emerald-700 rounded-md px-1.5 py-0.5 text-[9px] font-bold">Default</span>
                            )}
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{a.address}</p>
                          <p className="font-semibold text-foreground">
                            {a.city}, {a.state} - {a.pincode}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Purchase log history */}
                <div className="space-y-3 border-t border-emerald-50 pt-5">
                  <h3 className="text-xs font-bold text-foreground">Recent Orders History</h3>
                  {selectedCustomer.orders.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground">No purchase logs available.</p>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {selectedCustomer.orders.map((o: any) => (
                        <div key={o.id} className="rounded-xl border border-emerald-50 bg-background/50 p-3 text-[11px] flex justify-between items-center">
                          <div>
                            <span className="font-bold text-foreground block font-mono">#{o.id.substring(0, 8)}</span>
                            <span className="text-muted-foreground text-[10px]">{new Date(o.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-right space-y-1">
                            <span className="font-bold text-foreground block">₹{o.totalAmount.toFixed(2)}</span>
                            <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                              o.status === "DELIVERED"
                                ? "bg-emerald-50 text-emerald-700"
                                : o.status === "CANCELLED"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-amber-50 text-amber-700"
                            }`}>
                              {o.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-emerald-100 bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
                Select a customer from the list to view profile details, address book, and purchase metrics.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
