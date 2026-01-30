"use client";

import { useState } from "react";
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
import { signIn } from "next-auth/react";
import { toast } from "sonner";

const SignInPage = () => {
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
        window.location.href = "/"; 
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="bg-white border border-gray-200 rounded-xl shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-blue-600 text-center">Sign In</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your email and password to sign in
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Label className="text-gray-700" htmlFor="email">Email</Label>
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
                  className="text-gray-900 placeholder:text-gray-500 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700" htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="text-gray-900 placeholder:text-gray-500 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <CardDescription className="text-center text-sm text-gray-600 mt-2">
                Don't have an account?{" "}
                <a href="/register" className="text-blue-600 hover:text-blue-700 hover:underline">
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