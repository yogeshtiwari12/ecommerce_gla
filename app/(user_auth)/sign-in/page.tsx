"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";

const SignInPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";
  
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({ email: "codekro8@gmail.com", password: "12345678" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If user is already authenticated, redirect to callback URL
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.replace(callbackUrl);
    }
  }, [status, session, router, callbackUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      // Use NextAuth's built-in redirect mechanism
      const res = await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: callbackUrl,
      });

      // If we get here, something went wrong
      if (!res?.ok) {
        const errorMessage = res?.error || "Sign in failed. Please check your credentials.";
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="bg-card border border-border rounded-xl shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-primary text-center">Sign In</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your email and password to sign in
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-4 bg-destructive/10 border-destructive/30">
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Label className="text-foreground" htmlFor="email">Email</Label>
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="text-foreground placeholder:text-muted-foreground bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground" htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="text-foreground placeholder:text-muted-foreground bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <CardDescription className="text-center text-sm text-muted-foreground mt-2">
                Don't have an account?{" "}
                <a href="/register" className="text-primary hover:underline">
                  Register here
                </a>
              </CardDescription>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignInPage;