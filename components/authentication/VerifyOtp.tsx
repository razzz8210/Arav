"use client";

import "@/app/styles/authentication.scss";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/utils/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface VerifyOtpProps {
  formData: {
    email: string;
    password: string;
  };
}

export const VerifyOtp = ({ formData }: VerifyOtpProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { updateUser } = useAuth();

  const [verifyData, setVerifyData] = useState({
    otp: "",
    name: "",
  });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp-and-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: verifyData.otp,
          name: verifyData.name,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        updateUser(data.user);
        toast.success("Account created successfully! Redirecting...");
        
        // Small delay to ensure the tour can start after navigation
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        toast.error(data.message || "OTP verification failed");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!formData.email) return;
    setResendLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("OTP resent to your email");
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="centered-auth-form">
      <div className="centered-auth-field">
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          readOnly
          disabled
          className="centered-auth-input"
        />
      </div>

      <div className="centered-auth-field">
        <label htmlFor="name">Full Name (Optional)</label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter your full name"
          value={verifyData.name}
          onChange={(e) =>
            setVerifyData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="centered-auth-input"
        />
      </div>

      <div className="centered-auth-field">
        <label htmlFor="otp">Verification Code</label>
        <Input
          id="otp"
          name="otp"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          required
          placeholder="Enter 6-digit code"
          value={verifyData.otp}
          onChange={(e) =>
            setVerifyData((prev) => ({ ...prev, otp: e.target.value }))
          }
          className="centered-auth-input"
          maxLength={6}
        />
      </div>

      <button
        type="submit"
        className="centered-auth-submit-btn"
        disabled={loading || !formData.email}
      >
        {loading ? "Verifying..." : "Verify and Continue"}
      </button>

      <div className="centered-auth-link">
        Didn't receive the code?{" "}
        <button
          type="button"
          onClick={handleResendOtp}
          className="resend-btn"
          disabled={resendLoading || !formData.email}
        >
          {resendLoading ? "Resending..." : "Resend"}
        </button>
      </div>
    </form>
  );
};
