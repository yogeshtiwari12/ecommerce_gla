"use client";

import { useState, FormEvent, ChangeEvent, useRef, useEffect } from "react";
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
import { Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const RoleBasedSignInPage = () => {
  const [formData, setFormData] = useState<{ 
    email: string;
    password: string;
    role: string;
    employeeId: string;
  }>({
    email: "hiyokop321@cexch.com", 
    password: "12345678", 
    role: "delivery_agent",
    employeeId: "bulla420" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const roles = [
    { value: "admin", label: "Admin" },
    { value: "delivery_agent", label: "Delivery Agent" },
  ];

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role: { value: string; label: string }) => {
    setFormData({ ...formData, role: role.value });
    setShowRoleDropdown(false);
  };

  useEffect(() => {
    // Hide navbar
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.style.display = 'none';
    }

    const savedError = localStorage.getItem("employee_login_error");
    if (savedError) {
      setError(savedError);
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      localStorage.removeItem("employee_login_error");
    }

    // Show navbar on cleanup
    return () => {
      const navbar = document.querySelector('nav');
      if (navbar) {
        navbar.style.display = '';
      }
      console.log("mounted")
    };
  },[]);

  const handleSubmit = async (e: FormEvent<HTMLButtonElement> | FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { email, password, role, employeeId } = formData;

    if (!email || !password || !role || !employeeId) {
      setError("Please fill in all fields");
      localStorage.setItem("employee_login_error", "Please fill in all fields");
      setLoading(false);
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return;
    }

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        employeeId,
      });

      if (!res || res.error) {
        const errorMessage = res?.error || "Sign in failed. Please check your credentials.";
        setError(errorMessage);
        localStorage.setItem("employee_login_error", errorMessage);
        toast.error(errorMessage);
        setLoading(false);
        setTimeout(() => {
          errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
        return;
      }

      toast.success(`Sign in successful as ${role}`);
      router.push("/delivery_dashboard");
      setLoading(false);
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  const selectedRole = roles.find(r => r.value === formData.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-emerald-700/50 rounded-xl shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <CardTitle className="text-2xl text-emerald-400 text-center">
                Employee Sign In
              </CardTitle>
            </div>
            <CardDescription className="text-center text-slate-300">
              Select your role and enter credentials to sign in
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div ref={errorRef}>
                <Alert className="mb-4 bg-slate-800/50 border-slate-600/50">
                  <AlertDescription className="text-slate-300">
                    {error}
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300" htmlFor="role">Role</Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    disabled={loading}
                    className="w-full flex items-center justify-between px-3 py-2 text-slate-300 bg-slate-800/50 border border-slate-600/50 rounded-md focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
                  >
                    <span className="flex items-center">
                      {selectedRole ? selectedRole.label : "Select your role"}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showRoleDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg">
                      {roles.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => handleRoleSelect(role)}
                          className="w-full flex items-center px-3 py-2 text-slate-300 hover:bg-slate-700 first:rounded-t-md last:rounded-b-md"
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300" htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  type="text"
                  name="employeeId"
                  placeholder="Enter your employee ID"
                  required
                  value={formData.employeeId}
                  onChange={handleChange}
                  disabled={loading}
                  className="text-slate-300 placeholder:text-slate-500 bg-slate-800/50 border border-slate-600/50 focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300" htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="text-slate-300 placeholder:text-slate-500 bg-slate-800/50 border border-slate-600/50 focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300" htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="text-slate-300 placeholder:text-slate-500 bg-slate-800/50 border border-slate-600/50 focus:border-emerald-500/50"
                />
              </div>

              <Button 
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white" 
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In as {formData.role ? selectedRole?.label : 'User'}
                  </>
                )}
              </Button>

              <CardDescription className="text-center text-sm text-slate-400 mt-4">
                Need help with your account?{" "}
                <a href="/support" className="text-emerald-400 hover:text-emerald-300 hover:underline">
                  Contact Support
                </a>
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleBasedSignInPage;