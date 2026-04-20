"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { getSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { getDefaultRouteForRole } from "@/lib/role-routes";

const SignInPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "codekro8@gmail.com", password: "12345678" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.ok) {
        toast.success("Sign in successful");
        setFormData({ email: "", password: "" });
        
        // Wait for session to be updated on server before redirecting
        // Try multiple times to get the session
        let session = null;
        for (let i = 0; i < 5; i++) {
          await new Promise(resolve => setTimeout(resolve, 200));
          session = await getSession();
          if (session?.user?.role) break;
        }
        
        const redirectUrl = session?.user?.role 
          ? getDefaultRouteForRole(session.user.role)
          : "/profile";
        
        // Use router.push instead of window.location.href for better SPA experience
        router.push(redirectUrl);
        return;
      } else {
        const errorMessage = res?.error || "Sign in failed. Please check your credentials.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(errorMessage);
      setError(errorMessage);
      console.log("Catch error:", errorMessage);
    } 
    setLoading(false);
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