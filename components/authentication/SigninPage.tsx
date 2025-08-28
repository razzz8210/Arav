"use client";

import "@/app/styles/authentication.scss";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/utils/AuthContext";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

export function SigninPage() {
  const { updateUser } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        updateUser(data.user);
        toast.success("Logged in successfully!");
        
        // Small delay to ensure the tour can start after navigation
        setTimeout(() => {
          
          // Small delay to ensure the tour can start after navigation
          window.location.href = "/";
        }, 1500);
          }, 2500);
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignin = async () => {
    try {
      setGoogleLoading(true);
      // Use redirect: true for simpler flow
      await signIn("google", {
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Google sign-in failed"
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="new-auth-container">
      {/* Left Panel - Sign In Form */}
      <div className="new-auth-form-panel">
        {/* Back Button */}
        <button className="new-auth-back-btn" onClick={() => router.back()}>
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="new-auth-form-wrapper">
          {/* Header */}
          <div className="new-auth-header">
            <h1>Login</h1>
            <p>Sign in with your email address</p>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="new-auth-form">
            <div className="new-auth-field">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className="new-auth-input"
              />
            </div>

            <div className="new-auth-field">
              <label htmlFor="password">Password</label>
              <PasswordInput
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="new-auth-input"
              />
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="new-auth-options">
              <div className="new-auth-checkbox">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link href="/forgot-password" className="new-auth-forgot">
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="new-auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>

          {/* Google Sign In Button */}
          <button
            type="button"
            className="new-auth-google-btn"
            onClick={handleGoogleSignin}
            disabled={googleLoading}
          >
            <Image
              src="/icons/Google.svg"
              alt="Google"
              width={20}
              height={20}
            />
            {googleLoading ? "Signing in..." : "Sign in with Google"}
          </button>

          {/* Sign Up Link */}
          <div className="new-auth-link">
            Don't have an account yet? <Link href="/signup">Sign Up</Link>
          </div>
        </div>
      </div>

      {/* Right Panel - Gradient Background */}
      <div className="new-auth-right-panel">
        <div className="new-auth-right-content">
          <h2>Create Apps, Websites, and Marketing Magic</h2>
          <div className="new-auth-features">
            <div className="new-auth-feature">
              <div className="new-auth-feature-icon" />
              <span>Design and launch your web product in minutes</span>
            </div>
            <div className="new-auth-feature">
              <div className="new-auth-feature-icon" />
              <span>Share your work, learn from others</span>
            </div>
            <div className="new-auth-feature">
              <div className="new-auth-feature-icon" />
              <span>
                Use customized Avatars and Reel templates to sell directly on
                Tik Tok, Instagram, YouTube and more
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
