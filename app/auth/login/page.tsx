"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { AlertCircle, Eye, EyeOff, Github, Chrome } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const data = await response.json() as { error?: string };
          throw new Error(data.error || "Login failed");
        }

        if (rememberMe) {
          localStorage.setItem("rememberEmail", email);
        } else {
          localStorage.removeItem("rememberEmail");
        }

        router.push("/chat");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login error";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, rememberMe, router]
  );

  return (
    <AuthLayout title="Welcome back" description="Sign in to your account">
      <CardContent className="space-y-4 p-6">
        {/* Error Alert */}
        {error && (
          <div className="flex gap-3 rounded-lg border border-red-300/50 bg-red-50/50 p-3 dark:border-red-900/30 dark:bg-red-950/30">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-900 dark:text-red-200">
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
              className="block text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              className="h-9 border border-neutral-300/50 bg-white text-sm transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-blue-500/30 dark:border-neutral-700/50 dark:bg-neutral-900"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="h-9 border border-neutral-300/50 bg-white pr-9 text-sm transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-blue-500/30 dark:border-neutral-700/50 dark:bg-neutral-900"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                ) : (
                  <Eye className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                )}
              </Button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500"
            />
            <label
              htmlFor="remember"
              className="text-sm text-neutral-600 dark:text-neutral-400"
            >
              Keep me signed in
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="h-9 w-full bg-blue-600 hover:bg-blue-700 text-sm font-medium text-white dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300/50 dark:border-neutral-700/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-9 border border-neutral-300/50 hover:bg-neutral-50 hover:border-neutral-300 dark:border-neutral-700/50 dark:hover:bg-neutral-900/50 dark:hover:border-neutral-700"
            disabled={isLoading}
          >
            <Chrome className="mr-2 h-3.5 w-3.5" />
            <span className="text-xs sm:text-sm">Google</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 border border-neutral-300/50 hover:bg-neutral-50 hover:border-neutral-300 dark:border-neutral-700/50 dark:hover:bg-neutral-900/50 dark:hover:border-neutral-700"
            disabled={isLoading}
          >
            <Github className="mr-2 h-3.5 w-3.5" />
            <span className="text-xs sm:text-sm">GitHub</span>
          </Button>
        </div>

        {/* Register Link */}
        <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </AuthLayout>
  );
}
