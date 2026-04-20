"use client";
import React, { use, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  
  SheetClose,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { useSession, signOut } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getDefaultRouteForRole } from "@/lib/role-routes";
import { ThemeToggle } from "./ThemeToggle";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { data: session,status } = useSession();
 
  useEffect(()=>{
    setIsLoggedIn(session?.user ? true : false);
  }, [session]);

  // console.log("Session Data:", session);
  

const router = useRouter();



  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Cart", href: "/cart" },
    { name: "Contact", href: "/contact" },
  ];

  const handleLogin = () => {
    window.location.href = "/sign-in";
  };

  const handleLogout = async() => {
    try {
      await signOut({
        callbackUrl: '/sign-in',
        redirect: true
      });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <nav className="bg-card dark:bg-card border-b border-border fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="max-w-8xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-16 relative">
          <div className="text-xl font-bold text-primary dark:text-primary">Logo</div>
          <div className="hidden md:flex space-x-12 font-sans text-2sm absolute left-1/2 transform -translate-x-1/2">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground/70 hover:text-primary dark:text-foreground/70 dark:hover:text-primary transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {isLoggedIn  && status=="authenticated" ? (
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="px-4 py-4"
                >
                  Logout
                </Button>
                {session?.user?.role === "delivery_agent" || session?.user?.role === "admin" ? (
                  <Button
                    variant="default"
                    onClick={() => {window.location.href = getDefaultRouteForRole(session?.user?.role)}}
                    className="px-4 py-2"
                  >
                    Dashboard
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => {window.location.href = "/profile"}}
                    className="px-4 py-2"
                  >
                    Profile
                  </Button>
                )}
              </div>
            ) : (
              <Button
                variant="default"
                onClick={handleLogin}
                className="px-4 py-2"
              >
                Sign in
              </Button>
            )}
          </div>
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-card border-border">
                <SheetHeader>
                  <SheetTitle className="text-lg font-semibold text-center text-primary">
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col items-center justify-center space-y-2 mt-4 text-center">
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="w-full text-foreground/70 hover:text-primary transition-colors py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </a>
                  ))}
                  <div className="pt-4 border-t border-border w-full flex flex-col items-center space-y-2">
                    {isLoggedIn ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          className="w-full"
                        >
                          Logout
                        </Button>
                        {session?.user?.role === "delivery_agent" || session?.user?.role === "admin" ? (
                          <Button
                            variant="default"
                            onClick={() => {
                              window.location.href = getDefaultRouteForRole(session?.user?.role);
                              setIsOpen(false);
                            }}
                            className="w-full"
                          >
                            Dashboard
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            onClick={() => {
                              window.location.href = "/profile";
                              setIsOpen(false);
                            }}
                            className="w-full"
                          >
                            Profile
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="default"
                        onClick={() => {
                          handleLogin();
                          setIsOpen(false);
                        }}
                        className="w-full"
                      >
                        Login
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

