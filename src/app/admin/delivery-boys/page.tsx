"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRidersQuery, useCustomersQuery, useCreateRiderMutation } from "@/hooks/use-rider-queries";

export default function AdminDeliveryBoysPage() {
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [createNewUser, setCreateNewUser] = useState(true);
  const [userId, setUserId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("BIKE");

  const { data: riders = [], isLoading: ridersLoading } = useRidersQuery();
  const { data: rawUsers = [], isLoading: usersLoading } = useCustomersQuery();
  const createRiderMutation = useCreateRiderMutation();

  const users = rawUsers.filter((u: any) => u.role === "DELIVERY_BOY");
  const loading = ridersLoading || usersLoading;

  const handleOpenAdd = () => {
    setCreateNewUser(true);
    setUserId("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setVehicleNumber("");
    setVehicleType("BIKE");
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = createNewUser
      ? {
          createNewUser: true,
          firstName,
          lastName,
          email,
          phone,
          password,
          vehicleNumber,
          vehicleType,
        }
      : {
          createNewUser: false,
          userId,
          vehicleNumber,
          vehicleType,
        };

    createRiderMutation.mutate(payload, {
      onSuccess: () => {
        setShowModal(false);
      },
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Delivery Boys</h1>
          <p className="text-muted-foreground">Manage active riders profiles, vehicle licenses, and delivery status logs.</p>
        </div>

        <Button onClick={handleOpenAdd} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/10">
          Add Rider Profile
        </Button>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-3xl bg-muted" />
      ) : riders.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-emerald-100 p-8 text-muted-foreground">
          No riders profiles created yet. Recruit and link driver accounts.
        </div>
      ) : (
        <div className="rounded-3xl border border-emerald-50 bg-card shadow-sm overflow-hidden max-w-4xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-emerald-50 bg-emerald-50/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Rider ID</th>
                  <th className="px-6 py-4">Vehicle Specs</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50/50">
                {riders.map((r: any) => (
                  <tr key={r.id} className="hover:bg-emerald-50/10">
                    <td className="px-6 py-4 font-bold text-foreground font-mono">{r.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 font-semibold text-muted-foreground">
                      <span className="text-foreground block">{r.vehicleNumber}</span>
                      <span className="text-xs uppercase font-mono">{r.vehicleType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          r.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-muted text-muted-foreground border border-muted"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground uppercase text-xs">
                      {r.isBusy ? "Busy on Job" : "Idle (Available)"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal dialog overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card rounded-3xl border border-emerald-50 p-6 shadow-xl space-y-6">
            <div className="border-b border-emerald-50 pb-4">
              <h2 className="text-xl font-bold text-foreground">Add Rider Profile</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Register options */}
              <div className="flex rounded-xl bg-emerald-50/50 p-1 border border-emerald-100/50">
                <button
                  type="button"
                  onClick={() => setCreateNewUser(true)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                    createNewUser ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Register New Account
                </button>
                <button
                  type="button"
                  onClick={() => setCreateNewUser(false)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                    !createNewUser ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Link Existing Account
                </button>
              </div>

              {createNewUser ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground block">First Name</label>
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Amit" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground block">Last Name</label>
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Sharma" required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground block">Email / Username</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="amit@gmail.com" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground block">Phone Number</label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground block">Password</label>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="******" required />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">Link Rider User Account</label>
                  {users.length === 0 ? (
                    <p className="text-xs text-destructive font-semibold">
                      No registered user accounts found with the role "DELIVERY_BOY". Please register a delivery user first!
                    </p>
                  ) : (
                    <select
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className="w-full rounded-xl border border-emerald-100 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select User Account...</option>
                      {users.map((u: any) => (
                        <option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName} ({u.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">Vehicle Number</label>
                  <Input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="DL-3C-AB-1234" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full rounded-xl border border-emerald-100 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="BIKE">Bike</option>
                    <option value="SCOOTER">Scooter</option>
                    <option value="CAR">Car</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-emerald-50">
                <Button type="button" onClick={() => setShowModal(false)} variant="outline" className="rounded-xl border-emerald-100 hover:bg-emerald-50">
                  Cancel
                </Button>
                <Button type="submit" disabled={!userId} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                  Create Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
