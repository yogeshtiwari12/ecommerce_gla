"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User,
  ShoppingBag,
  Package,
  Clock,
  DollarSign,
  LogOut,
  Bell,
  TrendingUp,
  Shield,
  Mail,
  Phone,
  Search,
  Filter,
  Calendar,
  Truck,
  CheckCircle,
  X,
  MapPin,
  Menu
} from "lucide-react";
import axios from "axios";
import { cancel_order, increase_cart_count, removecart_data, update_product_address, get_product_address,decrease_cart_count } from "@/app/redux/product";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/app/redux/store";
import { toast } from "sonner";


const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const dispatch = useDispatch<AppDispatch>();
  const addressesById = useSelector((state: any) => state.product.addressesById);

  // Protect route - redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  // Show loading state while checking auth
  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Don't render if not authenticated
  if (!session?.user) {
    return null;
  }

  console.log("Current addresses in Redux store:",profileData?.productid);  

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [editingAddressOrderId, setEditingAddressOrderId] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState<Record<string, {
    streetAddress: string;
    city: string;
    state: string;
    pinCode: string;
    phoneNumber: string;
  }>>({});

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // added

  const removecart = async (productId: string) => {

    setRemovingItems(prev => new Set(prev).add(productId));

    try {
      // Update local state optimistically
      setProfileData((prevData: any) => {
        if (!prevData?.user_shop_data) return prevData;

        return {
          ...prevData,
          user_shop_data: prevData.user_shop_data.filter(
            (item: any) => item.id !== productId && item._id !== productId
          ),
        };
      });

      const result = await dispatch(removecart_data(productId));

      if (result.payload.success) {
        toast.success(result.payload.message);
      } else {
        toast.error(result.payload.message);
        await fetchProfile();
      }
    } catch (error) {
      console.error("Error removing product:", error);
      toast.error("Failed to remove product. Please try again.");

      await fetchProfile();
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;

      });
    }
  };

  const increaseCartCount = async (productId: string) => {
    try {
      // Optimistic update — no API round-trip before UI reflects change
      setProfileData((prevData: any) => {
        if (!prevData?.user_shop_data) return prevData;
        return {
          ...prevData,
          user_shop_data: prevData.user_shop_data.map((item: any) =>
            (item.id === productId || item._id === productId)
              ? { ...item, user_product_cart_count: (item.user_product_cart_count || 0) + 1 }
              : item
          ),
        };
      });
      const onsuccess = await dispatch(increase_cart_count(productId));
      if (onsuccess.payload.success) {
        toast.success(onsuccess.payload.message);
      } else {
        toast.error(onsuccess.payload.message);
        await fetchProfile(); // rollback on error
      }
    } catch (error) {
      toast.error("Failed to increase cart count. Please try again.");
      await fetchProfile(); // rollback on error
    }
  }

  const decreaseCartCount = async (productId: string) => {
    try {
      const currentItem = profileData?.user_shop_data?.find(
        (item: any) => item.cartItem === true && (item.id === productId || item._id === productId)
      );
      const currentQty = currentItem?.user_product_cart_count ?? 0;
      if (currentQty <= 1) {
        toast.error("Minimum quantity is 1");
        return;
      }
      // Optimistic update — no API round-trip before UI reflects change
      setProfileData((prevData: any) => {
        if (!prevData?.user_shop_data) return prevData;
        return {
          ...prevData,
          user_shop_data: prevData.user_shop_data.map((item: any) =>
            (item.id === productId || item._id === productId)
              ? { ...item, user_product_cart_count: (item.user_product_cart_count || 1) - 1 }
              : item
          ),
        };
      });
      const onsuccess = await dispatch(decrease_cart_count(productId));
      if (onsuccess.payload.success) {
        toast.success(onsuccess.payload.message);
      } else {
        toast.error(onsuccess.payload.message);
        await fetchProfile(); // rollback on error
      }
    } catch (error) {
      toast.error("Failed to decrease cart count. Please try again.");
      await fetchProfile(); // rollback on error
    }
  };

  const { confirmedOrders, totalItems, totalRevenue } = useMemo(() => {
    if (!profileData?.user_shop_data) {
      return {
        confirmedOrders: [],
        totalItems: 0,
        totalRevenue: 0,
      };
    }
    const orders =
    profileData.user_shop_data.filter(
      (item: any) => item?.isorderConfirmbyUser === true
    ) || [];
    const items = orders.reduce(
      (acc: number, item: any) => acc + (item.user_cart_count || 0),
      0
    );

    const revenue = orders.reduce(
      (acc: number, item: any) =>
        acc + (item.user_product_price || 0) * (item.user_cart_count || 0),
      0
    );

    return {
      confirmedOrders: orders,
      totalItems: items,
      totalRevenue: revenue,
    };
  }, [profileData]);

  const filteredOrders = useMemo(() => {
    let filtered = confirmedOrders.filter((order: any) => {
      const matchesSearch =
        order.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user_product_category
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      const normalizedStatus = (order.product_delivery_status || "").toLowerCase();
      
      if (statusFilter === "pending") {
        matchesStatus = normalizedStatus === "pending";
      } else if (statusFilter === "shipped") {
        matchesStatus = normalizedStatus === "shipped";
      } else if (statusFilter === "delivered") {
        matchesStatus = normalizedStatus === "delivered";
      } else if (statusFilter === "cancelled") {
        matchesStatus = normalizedStatus === "cancelled" || normalizedStatus === "canceled";
      } else if (statusFilter === "picked_up") {
        matchesStatus = normalizedStatus === "picked_up" || normalizedStatus === "picked up";
      } else if (statusFilter === "in_transit") {
        matchesStatus = normalizedStatus === "in_transit" || normalizedStatus === "in transit";
      }

      return matchesSearch && matchesStatus;
    });


    return filtered;
  }, [confirmedOrders, searchTerm, statusFilter, sortBy]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get("/api/profile", {
        withCredentials: true,
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.data.success) {
        setProfileData(response.data);
        setLoading(false);
      } else {
        console.error("API returned error:", response.data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };



  // keep one handler (outer) to update an order's address
  const handleUpdateAddress = async (orderId: string, shippingId?: string) => {
    const current = addressInput[orderId];
    if (!current || !current.streetAddress || !current.city || !current.state || !current.pinCode || !current.phoneNumber) {
      toast.error("All address fields are required.");
      return;
    }

    // resolve shippingId from product if not provided
    const resolvedShippingId =
      shippingId ||
      profileData?.user_shop_data?.find((p: any) => p._id === orderId)?.shippingAddress?.id ||
      profileData?.user_shop_data?.find((p: any) => p._id === orderId)?.shippingAddress?._id;

    if (!resolvedShippingId) {
      toast.error("Unable to find shipping ID for this order.");
      return;
    }

    try {
      const result = await dispatch(update_product_address({ shippingId: resolvedShippingId, address: current }));
      if (result.payload?.success) {
        toast.success("Address updated successfully!");
        // clear only this order's form state
        setAddressInput(prev => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
        setEditingAddressOrderId(null);
        fetchProfile();
      } else {
        toast.error(result.payload);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error updating address. Please try again.";
      toast.error(errorMessage);
    }
  };

  // keep one click initializer (outer)
  const handleUpdateAddressClick = (orderId: string, existing?: any) => {
    setEditingAddressOrderId(orderId);
    setAddressInput(prev => ({
      ...prev,
      [orderId]: {
        streetAddress: existing?.streetAddress || "",
        city: existing?.city || "",
        state: existing?.state || "",
        pinCode: existing?.pinCode || "",
        phoneNumber: existing?.phoneNumber || "",
      },
    }));
  };

  const sidebarItems = [
    {
      id: "profile",
      label: "Profile Overview",
      icon: User,
      description: "Personal information & account details",
    },
    {
      id: "products",
      label: "Carts",
      icon: ShoppingBag,
      description: "Manage your inventory",
    },
    {
      id: "analytics",
      label: "Orders",
      icon: TrendingUp,
      description: "Performance & statistics",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Updates & alerts",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-primary text-xl font-medium">
            Loading your dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive text-2xl font-semibold mb-2">
            Unable to Load Profile
          </div>
          <p className="text-muted-foreground">
            Please check your connection and try refreshing the page
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-primary/10 text-primary border border-primary/30 rounded-lg hover:bg-primary/20 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderUserProfile = () => (
    <div className="space-y-8">
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 pb-4 border-b border-border/50">
          <h2 className="text-2xl text-foreground flex items-center gap-3 font-bold">
            <div className="p-2 bg-primary/10 rounded-xl">
              <User className="h-6 w-6 text-primary" />
            </div>
            Account Information
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl border border-border">
                <User className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground block mb-1">
                    Full Name
                  </label>
                  <p className="text-lg text-foreground capitalize font-semibold">
                    {profileData.user.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl border border-border">
                <Mail className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground block mb-1">
                    Email Address
                  </label>
                  <p className="text-lg text-foreground">
                    {profileData.user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl border border-border">
                <Phone className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground block mb-1">
                    Phone Number
                  </label>
                  <p
                    className={`text-lg font-medium ${ profileData.user.phoneno
                        ? "text-foreground"
                        : "text-warning"
                      }`}
                  >
                    {profileData.user.phoneno || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl border border-border">
                <Shield className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground block mb-1">
                    Account Status
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${profileData.user.isVerified
                          ? "bg-success/10 text-success border-success/30"
                          : "bg-warning/10 text-warning border-warning/30"
                        }`}
                    >
                      {profileData.user.isVerified
                        ? "✓ Verified Account"
                        : "⚠ Pending Verification"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Verification Section if not verified */}
      {!profileData.user.isVerified && (
        <div className="p-4 bg-warning/5 rounded-xl border border-warning/20">
          <div className="flex items-start gap-3 mb-3">
            <Bell className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-warning mb-1">
                Account Verification Required
              </h4>
              <p className="text-xs text-warning/80 mb-3">
                Please verify your account to access all features and ensure account security.
              </p>
              <Button
                onClick={() => window.location.href = '/verify'}
                className="w-full bg-warning hover:bg-warning/90 text-warning-foreground font-semibold"
              >
                Verify Account Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
const renderCarts = () => {
    // Only include items explicitly in the cart
    const cartItems = profileData.user_shop_data?.filter((item: any) => item.cartItem === true) || [];

    // Calculate cart totals based on cart-only items
    const cartTotalItems = cartItems.reduce(
      (acc: number, item: any) => acc + (item.user_product_cart_count || 0),
      0
    );

    const cartTotalPrice = cartItems.reduce(
      (acc: number, item: any) =>
        acc + (item.user_product_price || 0) * (item.user_product_cart_count || 0),
      0
    );

    
    const handleBuyAll = async () => {
      if (!profileData.user_shop_data || profileData.user_shop_data.length === 0) {
        toast.error("Your cart is empty!");
        return;
      }

      try {
        // Navigate to checkout page with cart parameter
        window.location.href = '/buy?cart=true';
      } catch (error) {
        console.error("Error navigating to checkout:", error);
        toast.error("Failed to process. Please try again.");
      }
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Content Grid */}
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items - Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map((product: any) => {
                // Status configuration
                let statusColor = "text-muted-foreground";
                let statusBg = "bg-muted";
                let statusBorder = "border-border";
                let statusLabel = product.product_delivery_status || "Unknown";
                const status = statusLabel.toLowerCase();

                if (status === "delivered") {
                  statusColor = "text-success";
                  statusBg = "bg-success/10";
                  statusBorder = "border-success/30";
                  statusLabel = "Delivered";
                } else if (status === "shipped") {
                  statusColor = "text-warning";
                  statusBg = "bg-warning/10";
                  statusBorder = "border-warning/30";
                  statusLabel = "Shipped";
                } else if (status === "pending") {
                  statusColor = "text-primary";
                  statusBg = "bg-primary/10";
                  statusBorder = "border-primary/30";
                  statusLabel = "Pending";
                } else if (status === "cancelled" || status === "canceled") {
                  statusColor = "text-destructive";
                  statusBg = "bg-destructive/10";
                  statusBorder = "border-destructive/30";
                  statusLabel = "Cancelled";
                }

                const itemTotal = (product.user_product_price || 0) * (product.user_product_cart_count || 0);

                return (
                  <div
                    key={product.id || product._id}
                    className={`bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-md transition-[box-shadow,border-color,opacity,transform] duration-300 ${
                      removingItems.has(product.id || product._id) ? 'opacity-50 scale-98' : ''
                    }`}
                  >
                    <div className="p-4">
                      {/* Product Header */}
                      <div className="flex items-start gap-4 mb-3">
                        {/* Product Image/Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-muted border border-border rounded-lg flex items-center justify-center overflow-hidden relative">
                            {product.user_product_imageUrl ? (
                              <Image
                                src={product.user_product_imageUrl}
                                alt={product.product_name || 'Product'}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-xl font-bold text-muted-foreground">
                                {product.product_name?.charAt(0).toUpperCase() || "P"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-foreground mb-1.5 line-clamp-2">
                                {product.product_name}
                              </h3>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/30">
                                {product.user_product_category}
                              </span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-lg font-bold text-foreground">
                                ₹{itemTotal.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ₹{product.user_product_price} × {product.user_product_cart_count}
                              </p>
                            </div>
                          </div>

                          {/* Quantity and Status Row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Quantity Control */}
                            <div className="flex items-center gap-2 bg-muted rounded-md px-2 py-1 border border-border">
                              <span className="text-xs text-muted-foreground">Qty:</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => decreaseCartCount(product.id || product._id)}
                                  disabled={(product.user_product_cart_count ?? 0) <= 1}
                                  className={`w-6 h-6 flex items-center justify-center rounded transition-colors text-xs font-semibold ${
                                    (product.user_product_cart_count ?? 0) <= 1
                                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                                  }`}
                                  title="Decrease quantity"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => increaseCartCount(product.id || product._id)}
                                  className="w-6 h-6 flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors text-xs font-semibold"
                                  title="Increase quantity"
                                >
                                  +
                                </button>
                                <span className="text-sm font-semibold text-foreground min-w-[1.5rem] text-center">
                                  {product.user_product_cart_count}
                                </span>
                              </div>
                            </div>

                            {/* Delivery Status Badge */}
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs ${statusBg} ${statusBorder}`}>
                              <Truck className={`h-3 w-3 ${statusColor}`} />
                              <span className={`font-medium ${statusColor}`}>
                                {statusLabel}
                              </span>
                            </div>

                            {/* Created Date */}
                            <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(product.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3 border-t border-border">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full h-8 text-xs bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30"
                          onClick={() => removecart(product.id || product._id)}
                          disabled={removingItems.has(product.id || product._id)}
                        >
                          {removingItems.has(product.id || product._id) ? "Removing..." : "Remove"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary - Right Column (1/3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 self-start">
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-primary/10 border-b border-primary/30 px-4 py-3">
                    <h2 className="text-lg font-bold text-foreground">Order Summary</h2>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {/* Summary Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-muted-foreground">Items</span>
                        <span className="text-sm font-semibold text-foreground">{cartTotalItems}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-muted-foreground">Subtotal</span>
                        <span className="text-sm font-semibold text-foreground">
                          ₹{cartTotalPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-muted-foreground">Shipping</span>
                        <span className="text-sm font-semibold text-success">Free</span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-base font-semibold text-foreground">Total</span>
                        <span className="text-xl font-bold text-primary">
                          ₹{cartTotalPrice.toLocaleString()}
                        </span>
                      </div>

                      <Button
                        onClick={handleBuyAll}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 text-sm rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Proceed to Checkout
                      </Button>
                    </div>

                    {/* Additional Info */}
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Package className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                        <p>Free shipping on all orders. Secure checkout.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="bg-muted rounded-full p-12 mb-6 border border-border">
              <ShoppingBag className="w-20 h-20 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>

            <Button
              onClick={() => window.location.href = '/'}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-base shadow-md"
            >
              Start Shopping
            </Button>
          </div>
        )}
      </div>
    );
  };
  const orders = () => {
    const formatDate = (dateString: any) => {
      try {
        return new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return "Invalid Date";
      }
    };

    const getOrderStatus = (order: any) => {
      const normalized = (order.product_delivery_status || "").toLowerCase();
      if (normalized === "picked_up") {
        return { status: "picked up", color: "text-primary", icon: Package };
      }
      if (normalized === "in transit") {
        return { status: "in transit", color: "text-primary", icon: Truck };
      }
      if (order.isdelivered)
        return { status: "delivered", color: "text-success", icon: CheckCircle };
      if (order.isshipped)
        return { status: "shipped", color: "text-warning", icon: Truck };
      return { status: "pending", color: "text-primary", icon: Clock };
    };

    // change: status-to-percentage mapping per request
    const statusConfig = {
      pending: { percent: 20 },
      "in transit": { percent: 30 },
      in_transit: { percent: 30 },
      "picked up": { percent: 45 },
      picked_up: { percent: 45 },
      shipped: { percent: 70 },
      delivered: { percent: 100 },
      cancelled: { percent: 0 },
      canceled: { percent: 0 },
    } as const;

    return (
      <div className="space-y-6">
        {confirmedOrders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {confirmedOrders.map((product: any) => {
              // Only render if isorderConfirmbyUser is true
              if (!product.isorderConfirmbyUser) return null;

              const orderStatus = getOrderStatus(product);
              const StatusIcon = orderStatus.icon;

              // use a single unique key for the item and for address state
              const orderKey = product._id || product.id;
              
              // Get shipping address directly from product (already matched in backend)
              const currentAddress = product.shippingAddress || null;
              
              const shippingId = currentAddress?.id || currentAddress?._id;

              // add: compute pending state
              const normalizedStatus = (product.product_delivery_status || "").toLowerCase();
              const isPending =
                normalizedStatus
                  ? normalizedStatus === "pending"
                  : !product.isshipped && !product.isdelivered;

              // change: derive status percentage using normalized status
              const rawStatus = (product.product_delivery_status || "").toLowerCase();
              const conf =
                statusConfig[rawStatus as keyof typeof statusConfig] ||
                (product.isdelivered
                  ? statusConfig.delivered
                  : product.isshipped
                  ? statusConfig.shipped
                  : statusConfig.pending);

              return (
                <div
                  key={orderKey}
                  className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:border-primary/50 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border border-primary/30 rounded-md overflow-hidden flex items-center justify-center bg-primary/10 relative">
                          {product.user_product_imageUrl ? (
                            <Image
                              src={product.user_product_imageUrl}
                              alt={product.product_name || 'Product'}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-primary font-bold text-sm">
                              {product.product_name?.charAt(0).toUpperCase() || "O"}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-md font-bold text-foreground capitalize truncate">
                            {product.product_name}
                          </h4>
                          <span className="inline-block text-foreground border border-primary/30 bg-primary/10 capitalize mt-1 px-2 py-1 rounded-full text-xs">
                            {product.user_product_category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          ₹{product.user_product_price}
                        </p>
                        <p className="text-xs text-muted-foreground">per unit</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <StatusIcon className={`h-4 w-4 ${orderStatus.color}`} />
                      <span
                        className={`text-sm font-medium capitalize ${orderStatus.color}`}
                      >
                        {orderStatus.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="bg-muted rounded-lg p-3 border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-primary" />
                          <span className="text-xs text-muted-foreground">
                            Quantity
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {product.user_cart_count} items
                        </p>
                      </div>

                      <div className="bg-muted rounded-lg p-3 border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="text-xs text-muted-foreground">
                            Order Total
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-primary"
>
                          ₹
                          {(
                            product.user_product_price * product.user_cart_count
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-muted rounded-lg p-3 border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Order Date
                          </span>
                        </div>
                        <p className="text-xs font-medium text-foreground">
                          {formatDate(product.createdAt)}
                        </p>
                      </div>

                      <div className="bg-muted rounded-lg p-3 border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Delivery Address
                          </span>
                        </div>
                        {currentAddress ? (
                          <div className="text-xs font-medium text-foreground">
                            <p>{currentAddress.streetAddress}, {currentAddress.city}, {currentAddress.state} - {currentAddress.pinCode}</p>
                            <p>Phone: {currentAddress.phoneNumber}</p>
                          </div>
                        ) : (
                          <p className="text-sm font-medium text-muted-foreground italic">
                            Address not provided
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="relative py-4">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted transform -translate-y-1/2"></div>
                        <div
                          className="absolute top-1/2 left-0 h-0.5 bg-primary transform -translate-y-1/2 transition-all duration-500"
                          style={{ width: `${conf.percent}%` }}
                        ></div>

                        <div className="flex items-center justify-between relative">
                          <div className="relative flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-primary border-2 border-card z-10"></div>
                            <span className="text-xs text-primary mt-2 absolute top-full whitespace-nowrap">
                              Ordered
                            </span>
                          </div>

                          <div className="relative flex flex-col items-center">
                            <div
                              className={`w-3 h-3 rounded-full border-2 border-muted z-10 transition-colors duration-300 ${product.isshipped
                                  ? "bg-warning"
                                  : "bg-muted"
                                }`}
                            ></div>
                            <span
                              className={`text-xs mt-2 absolute top-full whitespace-nowrap transition-colors duration-300 ${product.isshipped
                                  ? "text-warning"
                                  : "text-muted-foreground"
                                }`}
                            >
                              Shipped
                            </span>
                          </div>

                          <div className="relative flex flex-col items-center">
                            <div
                              className={`w-3 h-3 rounded-full border-2 border-muted z-10 transition-colors duration-300 ${product.isdelivered
                                  ? "bg-success"
                                  : "bg-muted"
                                }`}
                            ></div>
                            <span
                              className={`text-xs mt-2 absolute top-full whitespace-nowrap transition-colors duration-300 ${product.isdelivered
                                  ? "text-success"
                                  : "text-muted-foreground"
                                }`}
                            >
                              Delivered
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address Input Section - only for active card */}
                    {editingAddressOrderId === orderKey && (
                      <div className="mb-4">
                        <div className="bg-muted rounded-lg p-4 border border-border">
                          <div className="flex items-center gap-2 mb-3 justify-center">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-sm text-foreground font-medium">
                              Update Delivery Address
                            </span>
                          </div>
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={addressInput[orderKey]?.streetAddress || ""}
                              onChange={e =>
                                setAddressInput(prev => ({
                                  ...prev,
                                  [orderKey]: {
                                    ...(prev[orderKey] || {}),
                                    streetAddress: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Street Address"
                              className="w-full p-3 rounded-lg bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={addressInput[orderKey]?.city || ""}
                                onChange={e =>
                                  setAddressInput(prev => ({
                                    ...prev,
                                    [orderKey]: {
                                      ...(prev[orderKey] || {}),
                                      city: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="City"
                                className="w-full p-3 rounded-lg bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                              />
                              <input
                                type="text"
                                value={addressInput[orderKey]?.state || ""}
                                onChange={e =>
                                  setAddressInput(prev => ({
                                    ...prev,
                                    [orderKey]: {
                                      ...(prev[orderKey] || {}),
                                      state: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="State"
                                className="w-full p-3 rounded-lg bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={addressInput[orderKey]?.pinCode || ""}
                                onChange={e =>
                                  setAddressInput(prev => ({
                                    ...prev,
                                    [orderKey]: {
                                      ...(prev[orderKey] || {}),
                                      pinCode: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Pin Code"
                                className="w-full p-3 rounded-lg bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                              />
                              <input
                                type="text"
                                value={addressInput[orderKey]?.phoneNumber || ""}
                                onChange={e =>
                                  setAddressInput(prev => ({
                                    ...prev,
                                    [orderKey]: {
                                      ...(prev[orderKey] || {}),
                                      phoneNumber: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Phone Number"
                                className="w-full p-3 rounded-lg bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                              />
                            </div>
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                className="bg-success hover:bg-success/90 text-success-foreground px-4 py-2 transition-all duration-200"
                                onClick={() => handleUpdateAddress(orderKey, shippingId)}
                              >
                                Save Address
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="bg-muted hover:bg-muted text-foreground px-4 py-2 transition-all duration-200"
                                onClick={() => {
                                  setEditingAddressOrderId(null);
                                  setAddressInput(prev => {
                                    const next = { ...prev };
                                    delete next[orderKey];
                                    return next;
                                  });
                                  toast.info("Address editor closed.");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 bg-muted hover:bg-muted text-foreground border border-border transition-all duration-200"
                        onClick={() => {
                          if (editingAddressOrderId === orderKey) {
                            setEditingAddressOrderId(null);
                            setAddressInput(prev => {
                              const next = { ...prev };
                              delete next[orderKey];
                              return next;
                            });
                            toast.info("Address editor closed.");
                          } else {
                            toast.info("Nothing to cancel on this card.");
                          }
                        }}
                        disabled={!isPending}
                        title={!isPending ? "Action disabled for non-pending orders" : undefined}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
                        onClick={async () => {
                          if (shippingId) {
                            await dispatch(get_product_address(shippingId));
                          }
                          handleUpdateAddressClick(orderKey, currentAddress);
                        }}
                        disabled={!isPending}
                        title={!isPending ? "Action disabled for non-pending orders" : undefined}
                      >
                        Update Address
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">No confirmed orders yet.</p>
            <p className="text-muted-foreground text-sm mt-2">
              Orders will appear here once confirmed by you.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderComingSoon = (title: any, description: any) => (
    <div className="space-y-6">
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Bell className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3">
          {title}
        </h2>
        <p className="text-muted-foreground text-lg mb-8">{description}</p>
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full border border-primary/30">
          <Clock className="h-4 w-4" />
          Coming Soon
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return renderUserProfile();
      case "products":
        return renderCarts();
      case "analytics":
        return orders();
      case "notifications":
        return renderComingSoon(
          "Notifications Center",
          "Stay updated with real-time alerts and updates"
        );
      default:
        return renderUserProfile();
    }
  };

  return (
    <div className="min-h-screen mt-16 bg-muted flex">
      {/* Sidebar (desktop) */}
      <div className="md:w-80 md:bg-card md:border-r md:border-border md:fixed md:h-full md:shadow-sm hidden md:block">
        <div className="p-6 h-full flex flex-col overflow-y-auto scrollbar-hide">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-primary rounded-full flex items-center justify-center text-primary text-md font-bold shadow-sm bg-primary/10">
                  {profileData.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground capitalize mb-1">
                  {profileData.user.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {profileData.user.email}
                </p>
              </div>
            </div>
            <div className="h-px bg-muted"></div>
          </div>

          <nav className="space-y-3 flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Dashboard
            </p>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`w-full border justify-start gap-4 h-auto p-4 text-left transition-all duration-200 rounded-lg ${activeTab === item.id
                      ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                      : "text-muted-foreground border-border hover:bg-muted hover:text-primary hover:border-primary/30"
                    }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <div className="flex items-start gap-4">
                    <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-border">
            <button className="w-full justify-start gap-4 h-12 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 flex items-center px-4 rounded-lg border border-border">
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile top tabs + menu trigger */}
      <div className="md:hidden fixed top-16 left-0 right-0 bg-card border-b border-border z-30">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            aria-label="Open navigation"
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 border border-border rounded-lg bg-card text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex gap-2 overflow-x-auto">
            {([
              { id: "profile", label: "Profile" },
              { id: "products", label: "Carts" },
              { id: "analytics", label: "Orders" },
              { id: "notifications", label: "Alerts" },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${activeTab === tab.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-foreground border-border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile drawer (left dashboard) */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* overlay */}
          <button
            aria-label="Close navigation"
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          {/* panel */}
          <div className="absolute top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-card border-r border-border shadow-xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border-2 border-primary rounded-full flex items-center justify-center text-primary font-bold bg-primary/10">
                  {profileData.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-foreground truncate">{profileData.user.name}</div>
                  <div className="text-muted-foreground truncate">{profileData.user.email}</div>
                </div>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-muted"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-2">
              {([
                { id: "profile", label: "Profile Overview", icon: User, description: "Personal information & account details" },
                { id: "products", label: "Carts", icon: ShoppingBag, description: "Manage your inventory" },
                { id: "analytics", label: "Orders", icon: TrendingUp, description: "Performance & statistics" },
                { id: "notifications", label: "Notifications", icon: Bell, description: "Updates & alerts" },
              ]).map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${activeTab === item.id
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-card text-foreground border-border hover:bg-muted"
                    }`}
                    aria-label={`Go to ${item.label}`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </button>
                )
              })}
            </nav>

            <div className="p-3 border-t border-border">
              <button className="w-full justify-start gap-3 p-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all flex items-center rounded-lg border border-border bg-card">
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-semibold">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 md:ml-80 ml-0">
        <div className="p-4 sm:p-8 overflow-y-auto h-[calc(100vh-4rem)] md:h-screen scrollbar-hide">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;



