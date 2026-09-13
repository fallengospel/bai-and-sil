"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { PH_LOCATIONS } from "@/lib/helpers";
import { FiShoppingBag, FiSearch } from "react-icons/fi";

const locationOptions = PH_LOCATIONS.flatMap((loc) =>
  loc.cities.map((city) => ({
    value: `${city}, ${loc.province}`,
    label: `${city}, ${loc.province}`,
  }))
);

const roleOptions = [
  { value: "buyer", label: "Buyer - I want to buy items" },
  { value: "seller", label: "Seller - I want to sell items" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, location, phone, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Registration failed");
        return;
      }

      toast.success("Account created! Check your email for the verification code.");
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Join BAI & SIL</h1>
            <p className="text-gray-500 mt-1">How do you want to use the marketplace?</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect("buyer")}
              className="w-full p-6 border-2 border-gray-200 rounded-xl text-left hover:border-[#7BA8D0] hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-[#7BA8D0] transition-colors">
                  <FiSearch className="w-6 h-6 text-[#7BA8D0] group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">I want to buy</h3>
                  <p className="text-sm text-gray-500">Browse and purchase items from sellers</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect("seller")}
              className="w-full p-6 border-2 border-gray-200 rounded-xl text-left hover:border-[#F5D36B] hover:bg-yellow-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-[#F5D36B] transition-colors">
                  <FiShoppingBag className="w-6 h-6 text-[#F5D36B] group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">I want to sell</h3>
                  <p className="text-sm text-gray-500">List and sell your items to buyers</p>
                </div>
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#7BA8D0] font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => setStep(1)}
              className="text-gray-400 hover:text-gray-600"
            >
              ← Back
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create {role === "seller" ? "Seller" : "Buyer"} Account
          </h1>
          <p className="text-gray-500 mt-1">
            {role === "seller"
              ? "Start listing your items for sale"
              : "Browse and buy items from sellers"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan Dela Cruz"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+63 9XX XXX XXXX"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
          <Select
            label="Location"
            options={locationOptions}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Select your location"
          />
          <Button type="submit" loading={loading} fullWidth>
            Create {role === "seller" ? "Seller" : "Buyer"} Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#7BA8D0] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
