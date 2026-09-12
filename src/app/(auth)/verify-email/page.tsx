"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendSent, setResendSent] = useState(false);

  const handleVerify = async () => {
    if (!token) {
      setError("No verification token found");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/verify?token=${token}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        return;
      }

      setVerified(true);
      toast.success("Email verified successfully!");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResending(true);

    try {
      const res = await fetch("/api/auth/verify/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json();

      if (res.ok) {
        setResendSent(true);
        toast.success(data.message || "Verification email sent!");
      } else {
        toast.error(data.error || "Failed to resend email");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Email Verified!</h1>
          <p className="text-gray-500">Your email has been verified. You can now use all features.</p>
          <Link href="/login">
            <Button fullWidth>Log In to Your Account</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
          <p className="text-gray-500 mt-1">
            Check your inbox for a verification link.
          </p>
        </div>

        {token ? (
          <div className="space-y-4">
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center space-y-3">
                <p className="text-sm text-red-600">{error}</p>
                <Button onClick={handleVerify} loading={loading} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Click below to verify your email address.</p>
                <Button onClick={handleVerify} loading={loading} fullWidth>
                  Verify My Email
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-700">No verification token found. Check your email for the correct link.</p>
          </div>
        )}

        <div className="border-t pt-6">
          <p className="text-sm text-gray-500 text-center mb-3">Didn&apos;t receive the email?</p>
          {resendSent ? (
            <p className="text-sm text-green-600 text-center">
              If an account exists with <strong>{resendEmail}</strong>, a new verification link has been sent.
            </p>
          ) : (
            <form onSubmit={handleResend} className="space-y-3">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1a56db] focus:border-transparent outline-none"
              />
              <Button type="submit" loading={resending} variant="outline" fullWidth>
                Resend Verification Email
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500">
          <Link href="/login" className="text-[#1a56db] font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
