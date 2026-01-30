"use client";
import React, { useState, useEffect, useMemo, use } from "react";
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
} from "lucide-react";
import axios from "axios";
import { cancel_order, increase_cart_count, removecart_data, update_product_address, get_product_address,decrease_cart_count } from "@/app/redux/product";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/app/redux/store";
import { toast } from "sonner";


const ProfilePage = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const dispatch = useDispatch<AppDispatch>();
  const addressesById = useSelector((state: any) => state.product.addressesById);

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

  console.log("profile data:", profileData);

  const removecart = async (productId: string) => {

    setRemovingItems(prev => new Set(prev).add(productId));
    console.log("items ", removingItems)

    try {
      // Update local state optimistically
      setProfileData((prevData: any) => {
        if (!prevData?.user_shop_data) return prevData;

        return {
          ...prevData,
          // fix: remove item when either id or _id matches
          user_shop_data: prevData.user_shop_data.filter(
            (item: any) => item.id !== productId && item._id !== productId
          ),
        };
      });
      console.log("Product ID to remove:", productId)

      const result = await dispatch(removecart_data(productId));
      console.log("Product removed with ID:", productId)

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
      console.log("Increasing quantity for product ID:", productId);

      // Guard: ensure current quantity is at least 1 before attempting increase
      const currentItem = profileData?.user_shop_data?.find(
        (item: any) => item.cartItem === true && (item.id === productId || item._id === productId)
      );
      const currentQty = currentItem?.user_product_cart_count ?? 0;
      if (currentQty < 1) {
        toast.error("Quantity can't be less than 1");
        return;
      }

      const onsuccess = await dispatch(increase_cart_count(productId));
      if (onsuccess.payload.success) {
        toast.success(onsuccess.payload.message);
        await fetchProfile();
      } else {
        toast.error(onsuccess.payload.message);
      }
    }
    catch (error) {
      console.error("Error increasing cart count:", error);
      toast.error("Failed to increase cart count. Please try again.");
    }

  }

  const decreaseCartCount = async (productId: string) => {
    try {
      console.log("Decreasing quantity for product ID:", productId);
      // Guard: prevent decreasing below 1
      const currentItem = profileData?.user_shop_data?.find(
        (item: any) => item.cartItem === true && (item.id === productId || item._id === productId)
      );
      const currentQty = currentItem?.user_product_cart_count ?? 0;
      if (currentQty <= 1) {
        toast.error("Minimum quantity is 1");
        return;
      }
      const onsuccess = await dispatch(decrease_cart_count(productId));
      if (onsuccess.payload.success) {
        toast.success(onsuccess.payload.message);
        await fetchProfile();
      } else {
        toast.error(onsuccess.payload.message);
      }
    } catch (error) {
      console.error("Error decreasing cart count:", error);
      toast.error("Failed to decrease cart count. Please try again.");
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
    console.log("Confirmed Orders:",orders); 
console.log("profileData.user_shop_data:",profileData.user_shop_data.map((item: any) => item.isorderConfirmbyUser===true  )   );          
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
      console.log(response.data)

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Response data:", response.data);

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
        // console.log("r",result)
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
      console.log("eer",error)
      const errorMessage = error?.response?.data?.message || error?.message || "Error updating address. Please try again.";
      console.error("Error updating address:",errorMessage);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-blue-600 text-xl font-medium">
            Loading your dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-2xl font-semibold mb-2">
            Unable to Load Profile
          </div>
          <p className="text-gray-600">
            Please check your connection and try refreshing the page
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderUserProfile = () => (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 pb-4 border-b border-gray-100">
          <h2 className="text-2xl text-gray-900 flex items-center gap-3 font-bold">
            <div className="p-2 bg-blue-50 rounded-xl">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            Account Information
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <User className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    Full Name
                  </label>
                  <p className="text-lg text-gray-900 capitalize font-semibold">
                    {profileData.user.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Mail className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    Email Address
                  </label>
                  <p className="text-lg text-gray-900">
                    {profileData.user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Phone className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    Phone Number
                  </label>
                  <p
                    className={`text-lg font-medium ${profileData.user.phoneno
                        ? "text-gray-900"
                        : "text-amber-600"
                      }`}
                  >
                    {profileData.user.phoneno || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Shield className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    Account Status
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${profileData.user.isVerified
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
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
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-start gap-3 mb-3">
            <Bell className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-900 mb-1">
                Account Verification Required
              </h4>
              <p className="text-xs text-amber-800 mb-3">
                Please verify your account to access all features and ensure account security.
              </p>
              <Button
                onClick={() => window.location.href = '/verify'}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
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
                let statusColor = "text-gray-600";
                let statusBg = "bg-gray-50";
                let statusBorder = "border-gray-200";
                let statusLabel = product.product_delivery_status || "Unknown";
                const status = statusLabel.toLowerCase();

                if (status === "delivered") {
                  statusColor = "text-green-700";
                  statusBg = "bg-green-50";
                  statusBorder = "border-green-200";
                  statusLabel = "Delivered";
                } else if (status === "shipped") {
                  statusColor = "text-amber-700";
                  statusBg = "bg-amber-50";
                  statusBorder = "border-amber-200";
                  statusLabel = "Shipped";
                } else if (status === "pending") {
                  statusColor = "text-blue-700";
                  statusBg = "bg-blue-50";
                  statusBorder = "border-blue-200";
                  statusLabel = "Pending";
                } else if (status === "cancelled" || status === "canceled") {
                  statusColor = "text-red-700";
                  statusBg = "bg-red-50";
                  statusBorder = "border-red-200";
                  statusLabel = "Cancelled";
                }

                const itemTotal = (product.user_product_price || 0) * (product.user_product_cart_count || 0);

                return (
                  <div
                    key={product.id || product._id}
                    className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-md transition-all duration-300 ${
                      removingItems.has(product.id || product._id) ? 'opacity-50 scale-98' : ''
                    }`}
                  >
                    <div className="p-4">
                      {/* Product Header */}
                      <div className="flex items-start gap-4 mb-3">
                        {/* Product Image/Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.user_product_imageUrl ? (
                              <img 
                                src={product.user_product_imageUrl} 
                                alt={product.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-bold text-gray-400">
                                {product.product_name?.charAt(0).toUpperCase() || "P"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 mb-1.5 line-clamp-2">
                                {product.product_name}
                              </h3>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                {product.user_product_category}
                              </span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-lg font-bold text-gray-900">
                                ₹{itemTotal.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-600">
                                ₹{product.user_product_price} × {product.user_product_cart_count}
                              </p>
                            </div>
                          </div>

                          {/* Quantity and Status Row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Quantity Control */}
                            <div className="flex items-center gap-2 bg-gray-100 rounded-md px-2 py-1">
                              <span className="text-xs text-gray-600">Qty:</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => decreaseCartCount(product.id || product._id)}
                                  disabled={(product.user_product_cart_count ?? 0) <= 1}
                                  className={`w-6 h-6 flex items-center justify-center rounded transition-colors text-xs font-semibold ${
                                    (product.user_product_cart_count ?? 0) <= 1
                                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                      : "bg-orange-500 hover:bg-orange-600 text-white"
                                  }`}
                                  title="Decrease quantity"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => increaseCartCount(product.id || product._id)}
                                  className="w-6 h-6 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors text-xs font-semibold"
                                  title="Increase quantity"
                                >
                                  +
                                </button>
                                <span className="text-sm font-semibold text-gray-900 min-w-[1.5rem] text-center">
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
                            <div className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(product.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full h-8 text-xs bg-gray-100 hover:bg-orange-500 text-gray-700 hover:text-white border border-gray-200"
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
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
                    <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {/* Summary Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-gray-600">Items</span>
                        <span className="text-sm font-semibold text-gray-900">{cartTotalItems}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-gray-600">Subtotal</span>
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{cartTotalPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-gray-600">Shipping</span>
                        <span className="text-sm font-semibold text-green-600">Free</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-base font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-blue-600">
                          ₹{cartTotalPrice.toLocaleString()}
                        </span>
                      </div>

                      <Button
                        onClick={handleBuyAll}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-sm rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Proceed to Checkout
                      </Button>
                    </div>

                    {/* Additional Info */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-start gap-2 text-xs text-gray-600">
                        <Package className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
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
            <div className="bg-gray-100 rounded-full p-12 mb-6 border border-gray-200">
              <ShoppingBag className="w-20 h-20 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-600 text-center max-w-md mb-8">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>

            <Button
              onClick={() => window.location.href = '/'}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-6 text-base shadow-md"
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
        return { status: "picked up", color: "text-blue-400", icon: Package };
      }
      if (normalized === "in transit") {
        return { status: "in transit", color: "text-blue-400", icon: Truck };
      }
      if (order.isdelivered)
        return { status: "delivered", color: "text-green-400", icon: CheckCircle };
      if (order.isshipped)
        return { status: "shipped", color: "text-amber-400", icon: Truck };
      return { status: "pending", color: "text-blue-400", icon: Clock };
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
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:border-blue-300 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border border-blue-200 rounded-md overflow-hidden flex items-center justify-center bg-blue-50">
                          {product.user_product_imageUrl ? (
                            <img
                              src={product.user_product_imageUrl}
                              alt={product.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-600 font-bold text-sm">
                              {product.product_name?.charAt(0).toUpperCase() || "O"}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-md font-bold text-gray-900 capitalize truncate">
                            {product.product_name}
                          </h4>
                          <span className="inline-block text-gray-700 border border-blue-200 bg-blue-50 capitalize mt-1 px-2 py-1 rounded-full text-xs">
                            {product.user_product_category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">
                          ₹{product.user_product_price}
                        </p>
                        <p className="text-xs text-gray-600">per unit</p>
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
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span className="text-xs text-gray-600">
                            Quantity
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {product.user_cart_count} items
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          <span className="text-xs text-gray-600">
                            Order Total
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-blue-600">
                          ₹
                          {(
                            product.user_product_price * product.user_cart_count
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-xs text-gray-600">
                            Order Date
                          </span>
                        </div>
                        <p className="text-xs font-medium text-gray-900">
                          {formatDate(product.createdAt)}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="text-xs text-gray-600">
                            Delivery Address
                          </span>
                        </div>
                        {currentAddress ? (
                          <div className="text-xs font-medium text-gray-900">
                            <p>{currentAddress.streetAddress}, {currentAddress.city}, {currentAddress.state} - {currentAddress.pinCode}</p>
                            <p>Phone: {currentAddress.phoneNumber}</p>
                          </div>
                        ) : (
                          <p className="text-sm font-medium text-slate-500 italic">
                            Address not provided
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="relative py-4">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-700 transform -translate-y-1/2"></div>
                        <div
                          className="absolute top-1/2 left-0 h-0.5 bg-blue-500 transform -translate-y-1/2 transition-all duration-500"
                          style={{ width: `${conf.percent}%` }}
                        ></div>

                        <div className="flex items-center justify-between relative">
                          <div className="relative flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-800 z-10"></div>
                            <span className="text-xs text-blue-400 mt-2 absolute top-full whitespace-nowrap">
                              Ordered
                            </span>
                          </div>

                          <div className="relative flex flex-col items-center">
                            <div
                              className={`w-3 h-3 rounded-full border-2 border-slate-800 z-10 transition-colors duration-300 ${product.isshipped
                                  ? "bg-amber-500"
                                  : "bg-slate-600"
                                }`}
                            ></div>
                            <span
                              className={`text-xs mt-2 absolute top-full whitespace-nowrap transition-colors duration-300 ${product.isshipped
                                  ? "text-amber-400"
                                  : "text-slate-500"
                                }`}
                            >
                              Shipped
                            </span>
                          </div>

                          <div className="relative flex flex-col items-center">
                            <div
                              className={`w-3 h-3 rounded-full border-2 border-slate-800 z-10 transition-colors duration-300 ${product.isdelivered
                                  ? "bg-green-500"
                                  : "bg-slate-600"
                                }`}
                            ></div>
                            <span
                              className={`text-xs mt-2 absolute top-full whitespace-nowrap transition-colors duration-300 ${product.isdelivered
                                  ? "text-green-400"
                                  : "text-slate-500"
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
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-3 justify-center">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-gray-900 font-medium">
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
                              className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                                className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                                className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                                className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                                className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            </div>
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 transition-all duration-200"
                                onClick={() => handleUpdateAddress(orderKey, shippingId)}
                              >
                                Save Address
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 transition-all duration-200"
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
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 transition-all duration-200"
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
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
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
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-700 text-lg">No confirmed orders yet.</p>
            <p className="text-gray-600 text-sm mt-2">
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
        <div className="w-24 h-24 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Bell className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          {title}
        </h2>
        <p className="text-gray-700 text-lg mb-8">{description}</p>
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-full border border-blue-200">
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
    <div className="min-h-screen mt-16 bg-gray-50 flex">
      <div className="w-80 bg-white border-r border-gray-200 fixed h-full shadow-sm">
        <div className="p-6 h-full flex flex-col overflow-y-auto scrollbar-hide">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-blue-500 rounded-full flex items-center justify-center text-blue-600 text-md font-bold shadow-sm bg-blue-50">
                  {profileData.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 capitalize mb-1">
                  {profileData.user.name}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {profileData.user.email}
                </p>
              </div>
            </div>
            <div className="h-px bg-gray-200"></div>
          </div>

          <nav className="space-y-3 flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Dashboard
            </p>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`w-full border justify-start gap-4 h-auto p-4 text-left transition-all duration-200 rounded-lg ${activeTab === item.id
                      ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                      : "text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200"
                    }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <div className="flex items-start gap-4">
                    <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-gray-200">
            <button className="w-full justify-start gap-4 h-12 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 flex items-center px-4 rounded-lg border border-gray-200">
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 ml-80">
        <div className="p-8 overflow-y-auto h-screen scrollbar-hide">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;