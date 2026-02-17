"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { AlertCircle, Eye, EyeOff, Check, X } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "None", color: "bg-neutral-300" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 4) return { score, label: "Fair", color: "bg-yellow-500" };
    return { score, label: "Strong", color: "bg-green-500" };
  };

  const passwordReqs = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^a-zA-Z0-9]/.test(password),
  };

  const emailReqs = {
    isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    domain: email.split("@")[1]?.toLowerCase() || "",
  };

  const commonDomains = ["gmail.com", "yahoo.com", "outlook.com"];
  const suggestedDomain = commonDomains.find(
    (d) =>
      d.includes(emailReqs.domain) &&
      d !== emailReqs.domain &&
      emailReqs.domain.length > 0
  );

  const strength = passwordStrength(password);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      if (!agreed) {
        setError("You must agree to the terms of service");
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const data = await response.json() as { error?: string };
          throw new Error(data.error || "Registration failed");
        }

        router.push("/auth/login");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Registration error";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, confirmPassword, agreed, router]
  );

  return (
    <AuthLayout
      title="Create your account"
      description="Join to start using AI Chat"
    >
      <CardContent className="space-y-4 p-6">
        {/* Error Alert */}
        {error && (
          <div className="flex gap-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/50">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-200">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              Email Address
            </label>
            <div className="space-y-1">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="h-11 border-neutral-300 bg-neutral-50 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900"
              />
              {suggestedDomain && emailReqs.domain && (
                <button
                  type="button"
                  onClick={() =>
                    setEmail(email.replace(/@.*/, `@${suggestedDomain}`))
                  }
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  Did you mean {email.split("@")[0]}@{suggestedDomain}?
                </button>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
                disabled={isLoading}
                className="h-11 border-neutral-300 bg-neutral-50 pr-11 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                ) : (
                  <Eye className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                )}
              </Button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                    <div
                      className={`h-2 transition-all ${strength.color}`}
                      style={{
                        width: `${(strength.score / 6) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    {strength.label}
                  </span>
                </div>

                {/* Requirements Checklist */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div
                    className={`flex items-center gap-2 ${
                      passwordReqs.length
                        ? "text-green-600 dark:text-green-400"
                        : "text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    {passwordReqs.length ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    <span>8+ characters</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      passwordReqs.hasUpper
                        ? "text-green-600 dark:text-green-400"
                        : "text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    {passwordReqs.hasUpper ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    <span>Uppercase</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      passwordReqs.hasLower
                        ? "text-green-600 dark:text-green-400"
                        : "text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    {passwordReqs.hasLower ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    <span>Lowercase</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      passwordReqs.hasNumber
                        ? "text-green-600 dark:text-green-400"
                        : "text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    {passwordReqs.hasNumber ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    <span>Number</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                disabled={isLoading}
                className="h-11 border-neutral-300 bg-neutral-50 pr-11 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                ) : (
                  <Eye className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                )}
              </Button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-600 dark:text-red-400">
                Passwords do not match
              </p>
            )}
          </div>

          {/* Terms of Service */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500"
            />
            <label
              htmlFor="terms"
              className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400"
            >
              I agree to the{" "}
              <a
                href="#"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !agreed}
            className="h-11 w-full bg-blue-600 text-base font-medium dark:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400">
              Have an account?
            </span>
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          <Link
            href="/auth/login"
            className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign in instead
          </Link>
        </p>
      </CardContent>
    </AuthLayout>
  );
}
