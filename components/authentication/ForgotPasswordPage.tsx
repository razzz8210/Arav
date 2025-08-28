"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import "@/app/styles/authentication.scss";
import { toast } from "sonner";
import { PasswordInput } from "@/components/ui/password-input";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Password reset code sent to your email!");

        // Start transition to reset step
        setIsTransitioning(true);
        setTimeout(() => {
          setStep("reset");
          setIsTransitioning(false);
        }, 300);
      } else {
        toast.error(data.message || "Failed to send password reset code");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to send password reset code"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    // Validate OTP
    if (!formData.otp || formData.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Password reset successfully! Redirecting to sign in...");
        setTimeout(() => {
          window.location.href = "/signin";
        }, 2000);
      } else {
        toast.error(data.message || "Password reset failed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResendLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("New verification code sent to your email!");
      } else {
        toast.error(data.message || "Failed to resend verification code");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to resend verification code"
      );
    } finally {
      setIsResendLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "reset") {
      // Start transition back to email step
      setIsTransitioning(true);
      setTimeout(() => {
        setStep("email");
        setIsTransitioning(false);
      }, 300);
    } else {
      router.back();
    }
  };

  return (
    <div className="centered-auth-container">
      {/* Back Button */}
      <button className="centered-auth-back-btn" onClick={handleBack}>
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Centered Form Card */}
      <div className="centered-auth-card">
        <div
          className={`step-container ${isTransitioning ? "transitioning" : ""}`}
        >
          {step === "email" ? (
            <div
              className={`step-content email-step ${
                isTransitioning ? "fade-out" : "fade-in"
              }`}
            >
              <div className="centered-auth-header">
                <h1>Reset your password</h1>
                <p>
                  Enter your email address and we'll send you a code to reset
                  your password
                </p>
              </div>

              <form
                onSubmit={handleRequestReset}
                className="centered-auth-form"
              >
                <div className="centered-auth-field">
                  <label htmlFor="email">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="centered-auth-input"
                  />
                </div>

                <button
                  type="submit"
                  className="centered-auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? "Sending code..." : "Send reset code"}
                </button>
              </form>
            </div>
          ) : (
            <div
              className={`step-content reset-step ${
                isTransitioning ? "fade-out" : "fade-in"
              }`}
            >
              <div className="centered-auth-header">
                <h1>Reset your password</h1>
                <p>
                  Enter the verification code sent to {formData.email} and
                  create a new password
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Check your spam folder if you don't see the email
                </p>
              </div>

              <form
                onSubmit={handleResetPassword}
                className="centered-auth-form"
              >
                <div className="centered-auth-field">
                  <label htmlFor="email">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Email address"
                    value={formData.email}
                    className="centered-auth-input"
                    disabled
                  />
                </div>

                <div className="centered-auth-field">
                  <label htmlFor="otp">Verification Code</label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    placeholder="Enter 6-digit code"
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="centered-auth-input"
                    maxLength={6}
                  />
                </div>

                <div className="centered-auth-field">
                  <label htmlFor="password">New Password</label>
                  <PasswordInput
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Create a new password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="centered-auth-input"
                    minLength={6}
                  />
                </div>

                <div className="centered-auth-field">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="centered-auth-input"
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  className="centered-auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? "Resetting password..." : "Reset password"}
                </button>
              </form>

              {/* Resend OTP */}
              <div className="centered-auth-link">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="resend-btn"
                  disabled={isResendLoading}
                >
                  {isResendLoading ? "Resending..." : "Resend"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Back to sign in */}
        <div className="centered-auth-link">
          Remember your password? <Link href="/signin">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
