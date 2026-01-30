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


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { data: session,status } = useSession();
 
  useEffect(()=>{
    setIsLoggedIn(session?.user ? true : false);
  }, [session]);

  console.log("Session Data:", session);
  

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
    <nav className="bg-white shadow-md border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-8xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-16 relative">
          <div className="text-xl font-bold text-blue-600">Logo</div>
          <div className="hidden md:flex space-x-12 font-sans text-2sm absolute left-1/2 transform -translate-x-1/2">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden md:block">
            {isLoggedIn  && status=="authenticated" ? (
              <div className="flex space-x-3">
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
                >
                  Logout
                </Button>
                {session?.user?.role === "delivery_agent" || session?.user?.role === "admin" ? (
                  <Button
                    variant="secondary"
                    onClick={() => {window.location.href = session?.user?.role === "admin" ? "/admin_dashboard" : "/delivery_dashboard"}}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Dashboard
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => {window.location.href = "/profile"}}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Profile
                  </Button>
                )}
              </div>
            ) : (
              <Button
                variant="default"
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-800 text-white"
              >
                Sign in
              </Button>
            )}
          </div>
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-700 hover:text-blue-600">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-white border-gray-200">
                <SheetHeader>
                  <SheetTitle className="text-lg font-semibold text-center text-blue-600">
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col items-center justify-center space-y-2 mt-4 text-center">
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="w-full text-gray-700 hover:text-blue-600 transition-colors py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </a>
                  ))}
                  <div className="pt-4 border-t border-gray-200 w-full flex flex-col items-center space-y-2">
                    {isLoggedIn ? (
                      <>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
                        >
                          Logout
                        </Button>
                        {session?.user?.role === "delivery_agent" || session?.user?.role === "admin" ? (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              window.location.href = session?.user?.role === "admin" ? "/admin_dashboard" : "/delivery_dashboard";
                              setIsOpen(false);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Dashboard
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              window.location.href = "/profile";
                              setIsOpen(false);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
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
