"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  User,
  Phone,
  Navigation,
  Timer,
  X,
  AlertCircle,
  Wallet,
  History,
  LogOut,
  Search,
  DollarSign,
  Edit3,
  Users,
  ShoppingBag,
  Copy,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/app/redux/store"
import { product, users_with_prod_details } from "@/app/redux/product"
import { toast } from "sonner"
import axios from "axios"
import { cancel_order_otp_send } from "@/app/redux/product"
import { cancel_order_verify_otp } from "@/app/redux/product"
import { user_delivery_update } from "@/app/redux/product"
import { useSession } from "next-auth/react"

export default function EnhancedDeliveryDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [cancelOtp, setCancelOtp] = useState("")
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<string | null>(null)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const dispatch = useDispatch<AppDispatch>()

  const [userswithproduuct, setUsersWithProducts] = useState<any>(null)
  const current_user = useSession()


  const deliveryAgent = useMemo(() => {
    if (!userswithproduuct || !Array.isArray(userswithproduuct)) {
      return {
        name: "Loading...",
        id: "DA-000",
        rating: 0,
        totalDeliveries: 0,
        todayDeliveries: 0,
        earnings: 0,
        status: "loading",
        completionRate: 0,
        avgDeliveryTime: "0 mins",
      }
    }
    // console.log(deliveryAgent)

    // Calculate stats based on productdeliverystatus only
    const allProducts = userswithproduuct.flatMap((user: any) => user.products || []);
    const totalOrders = allProducts.length;
    const completedOrders = allProducts.filter((p: any) => p.productdeliverystatus === "delivered").length;
    const pendingOrders = allProducts.filter((p: any) => p.productdeliverystatus === "pending").length;
    const activeOrders = allProducts.filter((p: any) => p.productdeliverystatus !== "delivered" && p.productdeliverystatus !== "cancelled").length;
    const totalEarnings = allProducts.reduce((sum: number, p: any) => sum + (p.productprice || 0), 0);
    return {
      name: current_user.data?.user?.name,
      id: "DA-001",
      rating: completedOrders > 0 ? Math.min(5.0, 4.0 + completedOrders / totalOrders) : 4.0,
      totalDeliveries: completedOrders,
      todayDeliveries: allProducts.filter((p: any) => p.productdeliverystatus === "delivered" && new Date(p.createdAt || Date.now()).toDateString() === new Date().toDateString()).length,
      earnings: totalEarnings,
      status: "active",
      completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
      avgDeliveryTime: "22 mins",
      totalOrders,
      pendingOrders,
      activeOrders,
      completedOrders,
    }
  }, [userswithproduuct])

  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Package,
      description: "Orders overview",
    },
    {
      id: "table",
      label: "Order Management",
      icon: Edit3,
      description: "Manage all orders",
    },
    {
      id: "earnings",
      label: "Earnings",
      icon: Wallet,
      description: "Payment & statistics",
    },
    {
      id: "history",
      label: "History",
      icon: History,
      description: "Past deliveries",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "Agent profile",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "picked_up":
      case "in_transit":
      case "shipped":
        return "bg-primary/10 text-primary border-primary/30"
      case "delivered":
        return "bg-success/10 text-success border-success/30"
      case "cancelled":
        return "bg-warning/10 text-warning border-warning/30"
      default:
        return "bg-primary/10 text-primary border-primary/30"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "picked_up":
        return "Picked Up";
      case "in_transit":
        return "In Transit";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-destructive bg-destructive/10 border-destructive/30"
      case "medium":
        return "text-primary bg-primary/10 border-primary/30"
      case "low":
        return "text-success bg-success/10 border-success/30"
      default:
        return "text-muted-foreground bg-muted border-border"
    }
  }



  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const order = getAllOrders.find((o) => o.id === orderId);
    if (!order) return;

    if (!order.hasPaymentInfo) {
      toast.error("Cannot update status — no payment record found for this order.");
      return;
    }

    if (order.paymentStatus?.toLowerCase() === "pending" && newStatus === "delivered") {
       toast.error("Cannot mark order as delivered. Payment is still pending.");
      return;
    }

    if (newStatus === "cancelled") {
      const productId = order?.productId || orderId
      setSelectedOrderForCancel(productId)
      setShowOtpModal(true)

      const success = await dispatch(cancel_order_otp_send(productId))
      if (success.payload.success) {
        toast.info(success.payload.message)
      } else {
        toast.error(success.payload.message)
      }
      return;
    }

 
    setUpdatingStatus(orderId);
    try {
      const order = getAllOrders.find((o) => o.id === orderId);
      // console.log("Full order object for status update:", order.id); // Log the entire order object for debugging
      const productId = order?.productId || order?.product_id || orderId;

      let apiStatus = newStatus;
      if (apiStatus === "picked_up" || apiStatus === "picked up") apiStatus = "picked_up";
      else if (apiStatus === "in_transit" || apiStatus === "in transit") apiStatus = "in_transit";
      else if (apiStatus === "delivered") apiStatus = "delivered";
      else if (apiStatus === "pending") apiStatus = "pending";
      else if (apiStatus === "cancelled") apiStatus = "cancelled";
      const res = await dispatch(user_delivery_update({ orderId: order.id, product_delivery_status: apiStatus }));
      if (res.payload && res.payload.success) {
        toast.success(`Order ${orderId} status updated to ${getStatusText(apiStatus)}`);
        // Optionally refresh data
        const refresh = await dispatch(users_with_prod_details());
        if (refresh.payload.success) setUsersWithProducts(refresh.payload.data);
      } else {
        toast.error(res.payload?.message || "Failed to update order status");
      }
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(null);
    }
  }

  const handleOtpVerification = async () => {
    if (!cancelOtp || cancelOtp.length < 4 || otpVerifying) {
      toast.error("Please enter a valid OTP")
      return
    }
    setOtpVerifying(true);
    // Verify OTP
    const res = await dispatch(cancel_order_verify_otp(cancelOtp))
    // console.log(res)
    if (res.payload.success) {
      if (res.payload.successmessage) {
        toast.success(res.payload.successmessage)
      }
    }
    else {
      toast.error(res.payload.message)
    }


    setShowOtpModal(false)
    setCancelOtp("")
    setSelectedOrderForCancel(null)

    const refresh = await dispatch(users_with_prod_details())
    if (refresh.payload.success) setUsersWithProducts(refresh.payload.data)
    else {
      if (res.payload.message === "Invalid OTP") {
        toast.error("Wrong OTP")
      } else {
        toast.error(res.payload.message || "Failed to cancel order")
      }
    }
    setOtpVerifying(false);
  }

  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const getAllOrders = useMemo(() => {
    if (!userswithproduuct || !Array.isArray(userswithproduuct)) return []

    return userswithproduuct.flatMap((user: any, userIdx: number) =>
      (user.products || [])
        .filter((product: any) => product.isorderConfirmbyUser === true)
        .map((product: any, prodIdx: number) => ({
          id: product.id || `${userIdx}-${prodIdx}`,
          product_id: product.product_id,
          productId: product.productId,
          customer: user.username || "Unknown User",
          phone: product.shippingDetails?.phoneNumber || user.userphone || "N/A",
          address: product.productaddress || "Address not provided",
          city: product.shippingDetails?.city || "N/A",
          state: product.shippingDetails?.state || "N/A",
          pinCode: product.shippingDetails?.pinCode || "N/A",
          status: (product.productdeliverystatus || "pending").replace("canceled", "cancelled"),
          items: product.cart_count || 1,
          eta: product.productdeliverystatus,
          distance: "N/A",
          rating: 4.5,
          // Fix: Use unit price × cart count for total amount
          amount: typeof product.item_unit_price === "number" && typeof product.cart_count === "number"
            ? product.productprice * product.cart_count
            : typeof product.productprice === "number"
              ? product.productprice
              : 0,
          paymentMethod: product.paymentDetails?.paymentMethod || product.paymentMethod || "N/A",
          paymentStatus: product.paymentDetails?.paymentStatus || product.paymentStatus || "N/A",
          transactionId: product.paymentDetails?.transactionId || product.transactionId || "N/A",
          hasPaymentInfo: !!(product.paymentDetails?.paymentStatus || product.paymentStatus),
          notes: product.productnotes || "",
          priority: "medium",
          orderTime: product.paymentDetails?.createdAt
            ? new Date(product.paymentDetails.createdAt).toLocaleString()
            : "N/A",
          estimatedDelivery: product.productdeliverystatus === "delivered" ? "Delivered" : "Pending",
          productName: product.productname,
          userId: user._id,
          item_unit_price: product.productprice
            || 0,
          cart_count: product.cart_count || 1,
        }))
    )
  }, [userswithproduuct])

  const getOrdersByCustomer = (customerName: string) => getAllOrders.filter((o) => o.customer === customerName)

  const customersWithMultipleOrders = useMemo(() => {
    const customerCounts = getAllOrders.reduce((acc: any, order) => {
      acc[order.customer] = (acc[order.customer] || 0) + 1
      return acc
    }, {})
    return Object.keys(customerCounts).filter((name) => customerCounts[name] > 1)
  }, [getAllOrders])

  const getCustomerStats = (customerName: string) => {
    const customerOrders = getOrdersByCustomer(customerName)
    return {
      totalOrders: customerOrders.length,
      totalAmount: customerOrders.reduce((sum, order) => sum + order.amount, 0),
      activeOrders: customerOrders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length,
      completedOrders: customerOrders.filter((o) => o.status === "delivered").length,
    }
  }

  const filteredOrders = getAllOrders.filter((order) => {
    const matchesSearch =
      (order.customer?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || // Ensure `customer` is a string
      (order.id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || // Ensure `id` is a string
      (order.productName?.toLowerCase() || "").includes(searchTerm.toLowerCase()); // Ensure `productName` is a string

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  })

  // Filter users to only show those with products that have product_buy_status: true

  // Filter for dashboard - exclude delivered products
  const filteredUsersForDashboard = useMemo(() => {
    if (!userswithproduuct || !Array.isArray(userswithproduuct)) return []
    return userswithproduuct
      .map((user: any) => ({
        ...user,
        products: (user.products || []).filter(
          (product: any) =>
            product.isorderConfirmbyUser === true &&
            product.productdeliverystatus !== "delivered"
        )
      }))
      .filter((user: any) => user.products.length > 0)
  }, [userswithproduuct])

  useEffect(() => {
    async function dispatchdata() {
      const res = await dispatch(users_with_prod_details())
      if (res.payload.success) {
        setUsersWithProducts(res.payload.data) // data is an array of users
        toast(res.payload.message)
      } else {
        toast(res.payload.message)
      }
    }
    dispatchdata()
  }, [dispatch])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true)
      setError(null)
      try {
        const res = await dispatch(users_with_prod_details())
        if (res.payload.success) {
          setUsersWithProducts(res.payload.data)
          toast.success(res.payload.message)
        } else {
          setError(res.payload.message)
          toast.error(res.payload.message)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch data"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [dispatch])

  async function handleOrderCancellation(orderId: string, otp: string) {
    setCancellingOrder(orderId)
    try {
      const response = await axios.post(`/api/cancel-order/${orderId}`, {
        otp: otp,
        timestamp: new Date().toISOString(),
      })

      if (response.data.success) {
        toast.success("Order cancelled successfully")
        // Refresh data after cancellation
        const res = await dispatch(users_with_prod_details())
        if (res.payload.success) {
          setUsersWithProducts(res.payload.data)
        }
      } else {
        toast.error(response.data.message || "Failed to cancel order")
      }
    } catch (error) {
      toast.error("Error cancelling order")
      console.error("Cancellation error:", error)
    } finally {
      setCancellingOrder(null)
      setShowOtpModal(false)
      setCancelOtp("")
      setSelectedOrderForCancel(null)
    }
  }

  const renderLeftPanel = () => (
    <div className="hidden md:block w-80 bg-gradient-to-b from-primary/10 to-card border-r-2 border-border fixed h-full top-16 overflow-y-auto shadow-xl">
      <div className="p-6 h-full flex flex-col">
        {/* Agent Profile */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-card to-primary/5 rounded-xl p-4 border border-border shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 border border-primary-foreground/20 rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-xl">
                  {current_user.data?.user?.name.charAt(0)}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">{current_user.data?.user?.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{current_user.data?.user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-3 flex-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`w-full flex items-center gap-4 p-4 text-left rounded-xl transition-all duration-200 border-2 ${activeTab === item.id
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary shadow-lg transform scale-105"
                  : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
                  }`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className={`h-5 w-5 ${activeTab === item.id ? "text-primary-foreground" : "text-primary"}`} />
                <div className="text-left flex-1">
                  <p className={`font-semibold ${activeTab === item.id ? "text-primary-foreground" : "text-foreground"}`}>
                    {item.label}
                  </p>
                  <p className={`text-xs ${activeTab === item.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {item.description}
                  </p>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Sign Out */}
        <div className="pt-6 border-t-2 border-border">
          <button className="w-full flex items-center gap-4 p-4 text-foreground bg-card hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200 rounded-xl border-2 border-border shadow-sm">
            <LogOut className="h-5 w-5" />
            <span className="font-semibold text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )

  const OtpModal = () => {
    if (!showOtpModal) return null
    return (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
        <form
          className="bg-muted border border-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-lg flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            if (!otpVerifying) handleOtpVerification()
          }}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
              <AlertCircle className="w-8 h-8 text-warning" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Cancel Order Confirmation</h3>
            <p className="text-muted-foreground">Please enter OTP to cancel order {selectedOrderForCancel}</p>
            <p className="text-xs text-muted-foreground mt-2">(Demo OTP: 1234)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Enter OTP</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={cancelOtp}
              onChange={(e) => setCancelOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 4-digit OTP"
              maxLength={6}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-center text-2xl"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowOtpModal(false)
                setCancelOtp("")
                setSelectedOrderForCancel(null)
              }}
              className="flex-1 px-4 py-3 bg-muted hover:bg-muted text-foreground rounded-lg transition-all border border-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={cancelOtp.length !== 6 || otpVerifying}
              className="flex-1 px-4 py-3 bg-warning hover:bg-warning/90 text-warning-foreground rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {otpVerifying ? "Verifying..." : "Confirm Cancel"}
            </button>
          </div>
        </form>
      </div>
    )
  }

  const [quickActionOrderId, setQuickActionOrderId] = useState<string | null>(null)
  const [quickActionStatus, setQuickActionStatus] = useState<string>("")

  const renderMainContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            {/* Header */}
            <div className="mb-8 ">
              <div className="flex items-center justify-center">
                <h1 className="text-3xl text-center font-bold text-foreground mb-2">Delivery Dashboard</h1>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              {/* Total Orders - Emerald */}
              <div className="border border-border rounded-2xl p-6 bg-card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{getAllOrders.length}</p>
                    <p className="text-muted-foreground text-sm">Total Orders</p>
                  </div>
                </div>
              </div>

              {/* Pending - Amber */}
              <div className="border border-border rounded-2xl p-6 bg-card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {getAllOrders.filter((o) => o.status === "pending").length}
                    </p>
                    <p className="text-muted-foreground text-sm">Pending</p>
                  </div>
                </div>
              </div>

              {/* Active - Blue */}
              <div className="border border-border rounded-2xl p-6 bg-card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {
                        getAllOrders.filter(
                          (o) =>
                            o.status === "in_transit" ||
                            o.status === "picked_up" ||
                            o.status === "shipped"
                        ).length
                      }
                    </p>
                    <p className="text-muted-foreground text-sm">Active</p>
                  </div>
                </div>
              </div>

              {/* Delivered - Purple */}
              <div className="border border-border rounded-2xl p-6 bg-card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {getAllOrders.filter((o) => o.status === "delivered").length}
                    </p>
                    <p className="text-muted-foreground text-sm">Delivered</p>
                  </div>
                </div>
              </div>

              {/* Total Value - Green */}
              <div className="border border-border rounded-2xl p-6 bg-card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{getAllOrders.reduce((sum, order) => sum + order.amount, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Multi-Order Customer Management */}
            {customersWithMultipleOrders.length > 0 && (
              <div className="mb-8 bg-card rounded-2xl border border-border p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-primary">Multi-Order Customer Management</h2>
                  </div>
                  {/* Close button */}
                  {selectedCustomer && (
                    <button
                      onClick={() => { setSelectedCustomer(null); setSelectedOrderId(null) }}
                      className="w-8 h-8 bg-muted hover:bg-muted/80 border border-border rounded-lg flex items-center justify-center text-foreground transition-all"
                      title="Close Customer Management"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-6">
                  {/* Customer Selection Card */}
                  <div className="bg-muted rounded-xl p-6 border border-border">
                    <label className="block text-foreground mb-3 font-medium">Select Customer:</label>
                    <select
                      className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      value={selectedCustomer || ""}
                      onChange={(e) => { setSelectedCustomer(e.target.value); setSelectedOrderId(null) }}
                      title="Select customer"
                    >
                      <option value="">-- Select Customer --</option>
                      {customersWithMultipleOrders.map((name: string) => (
                        <option key={name} value={name}>
                          {name} ({getOrdersByCustomer(name).length || 0} products)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Customer Statistics Card */}
                  {selectedCustomer && (
                    <div className="bg-muted rounded-xl p-6 border border-border">
                      <label className="block text-muted-foreground mb-3 font-medium">Customer Statistics:</label>
                      {(() => {
                        const stats = getCustomerStats(selectedCustomer)
                        return (
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="text-center p-2 bg-muted rounded-lg">
                              <p className="text-muted-foreground">Total Products</p>
                              <p className="text-foreground font-bold text-lg">{stats.totalOrders}</p>
                            </div>
                            <div className="text-center p-2 bg-muted rounded-lg border border-border">
                              <p className="text-muted-foreground">Total Amount</p>
                              <p className="text-success font-bold text-lg">₹{stats.totalAmount}</p>
                            </div>
                            <div className="text-center p-2 bg-muted rounded-lg border border-border">
                              <p className="text-muted-foreground">Active Products</p>
                              <p className="text-primary font-bold text-lg">{stats.activeOrders}</p>
                            </div>
                            <div className="text-center p-2 bg-muted rounded-lg border border-border">
                              <p className="text-muted-foreground">Delivered</p>
                              <p className="text-success font-bold text-lg">{stats.completedOrders}</p>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {/* Order Selection Card */}
                  {selectedCustomer && (
                    <div className="bg-muted rounded-xl p-6 border border-border">
                      <label className="block text-muted-foreground mb-3 font-medium">Select Product:</label>
                      <select
                        className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={selectedOrderId || ""}
                        onChange={(e) => setSelectedOrderId(e.target.value)}
                        title="Select product"
                      >
                        <option value="">-- Select Order --</option>
                        {getOrdersByCustomer(selectedCustomer).map((product: any) => (
                          <option
                            key={product._id || product.id || Math.random()}
                            value={product._id || product.id || ""}
                          >
                            {product.productName || product.productname || product.product_title || product.title || "Unnamed Product"}
                            {" - "}
                            {product.productdeliverystatus || "No Status"}
                            {" - ₹"}
                            {product.productprice || 0}
                            {" | Unit Price: ₹"}
                            {product.productprice ?? 0}
                            {" | Cart Count: "}
                            {product.cart_count ?? product.user_product_cart_count ?? 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {selectedCustomer && selectedOrderId && (
                  <div className="bg-muted rounded-xl border border-border shadow-sm overflow-hidden">
                    {(() => {
                      const order = getAllOrders.find((o) => o.id === selectedOrderId)
                      if (!order) return null
                      return (
                        <div className="grid lg:grid-cols-3 gap-0">
                          {/* Order Information */}
                          <div className="lg:col-span-2 p-6">
                            <div className="flex items-center gap-3 mb-6">
                              <div className={`w-12 h-12 ${getStatusColor(order.status)} rounded-xl flex items-center justify-center`}>
                                <ShoppingBag className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-foreground">{order.productName}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(order.priority)}`}>
                                  {order.priority} priority
                                </span>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Customer Details */}
                              <div className="space-y-4">
                                <div className="bg-muted rounded-lg p-4 border border-border">
                                  <h4 className="text-muted-foreground text-sm mb-3">Customer Details</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground text-sm">Name:</span>
                                      <span className="text-foreground font-medium">{order.customer}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground text-sm">Phone:</span>
                                      <span className="text-foreground">{order.phone}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Order Details */}
                                <div className="bg-muted rounded-lg p-4 border border-border">
                                  <h4 className="text-muted-foreground text-sm mb-3">Order Details</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground text-sm">Amount:</span>
                                      <span className="text-success font-semibold">₹{order.amount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground text-sm">Unit Price:</span>
                                      <span className="text-primary font-semibold">₹{order.productprice}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground text-sm">Cart Count:</span>
                                      <span className="text-primary font-semibold">{order.cart_count}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground text-sm">Status:</span>
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium border ${order.status === "pending"
                                          ? "bg-primary/10 text-primary border-primary/30"
                                          : order.status === "picked_up"
                                            ? "bg-primary/10 text-primary border-primary/30"
                                            : order.status === "in_transit"
                                              ? "bg-primary/10 text-primary border-primary/30"
                                              : order.status === "delivered"
                                                ? "bg-success/10 text-success border-success/30"
                                                : "bg-warning/10 text-warning border-warning/30"
                                          }`}
                                      >
                                        {getStatusText(order.status)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Delivery Info / Address / Notes */}
                              <div className="space-y-4">
                                <div className="bg-muted rounded-lg p-4 border border-border">
                                  <h4 className="text-muted-foreground text-sm mb-3">Delivery Info</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground text-sm">ETA:</span>
                                      <span className="text-foreground">{order.eta}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground text-sm">Distance:</span>
                                      <span className="text-foreground">{order.distance}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-muted rounded-lg p-4 border border-border">
                                  <h4 className="text-muted-foreground text-sm mb-3">Address</h4>
                                  <div className="space-y-1">
                                    <p className="text-foreground text-sm">{order.address}</p>
                                    <p className="text-muted-foreground text-xs">
                                      {order.city}, {order.state} - {order.pinCode}
                                    </p>
                                  </div>
                                </div>

                                {order.notes && (
                                  <div className="bg-muted rounded-lg p-4 border border-border">
                                    <h4 className="text-muted-foreground text-sm mb-3">Notes</h4>
                                    <p className="text-muted-foreground text-sm italic">{order.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions Panel */}
                          <div className="bg-muted p-6 border-l border-border">
                            <h4 className="text-lg font-semibold text-foreground mb-6">Order Management</h4>

                            {/* Status Change Dropdown */}
                            {order.status !== "delivered" && order.status !== "cancelled" && (
                              <div className="mb-6">
                                <label className="block text-muted-foreground mb-3 font-medium text-sm">Update Status:</label>
                                {order.paymentStatus?.toLowerCase() === "pending" && (
                                  <div className="mb-3 bg-warning/5 border border-warning/20 rounded-lg p-3 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-warning">
                                      Payment is pending. Cannot mark as delivered.
                                    </p>
                                  </div>
                                )}
                                <select
                                  title="Update Order Status"
                                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                  value=""
                                  onChange={(e) => { if (e.target.value) { handleStatusChange(order.id, e.target.value); e.target.value = "" } }}
                                  disabled={updatingStatus === order.id}
                                >
                                  <option value="">-- Update Status --</option>
                                  <option
                                    value="delivered"
                                    disabled={order.paymentStatus?.toLowerCase() === "pending"}
                                  >
                                    {order.paymentStatus?.toLowerCase() === "pending"
                                      ? "Mark as Delivered (Payment Pending)"
                                      : "Mark as Delivered"}
                                  </option>
                                  <option value="cancelled">Cancel Order (Requires OTP)</option>
                                </select>
                              </div>
                            )}

                            {/* Completed / Cancelled states */}
                            {order.status === "delivered" && (
                              <div className="text-center p-4 bg-muted rounded-lg border border-border mb-6">
                                <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                                <span className="text-muted-foreground font-medium">Order Completed Successfully</span>
                              </div>
                            )}
                            {order.status === "cancelled" && (
                              <div className="text-center p-4 bg-muted rounded-lg border border-border mb-6">
                                <X className="w-8 h-8 text-warning mx-auto mb-2" />
                                <span className="text-muted-foreground font-medium">Order Cancelled</span>
                              </div>
                            )}

                            {/* Quick Actions */}
                            <div className="space-y-4">
                              <h5 className="text-sm font-medium text-muted-foreground">Quick Actions</h5>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  onClick={() => window.open(`tel:${order.phone}`)}
                                  className="p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all flex items-center justify-center"
                                  title="Call Customer"
                                >
                                  <Phone className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(order.address)}`, "_blank")}
                                  className="p-3 bg-success hover:bg-success/90 text-white rounded-lg transition-all flex items-center justify-center"
                                  title="Navigate"
                                >
                                  <Navigation className="w-5 h-5" />
                                </button>
                              </div>
                            </div>

                            {/* Status Update Indicator */}
                            {updatingStatus === order.id && (
                              <div className="mt-4 flex items-center gap-2 text-primary text-sm">
                                <Timer className="w-4 h-4 animate-spin" />
                                Updating order status...
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Orders Cards Grid - Complete the section */}
            {filteredUsersForDashboard && Array.isArray(filteredUsersForDashboard) && filteredUsersForDashboard.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsersForDashboard.map((user: any, idx: number) => {
                  // Fix: Calculate total value correctly for cart items
                  const totalValue = user.products?.reduce((sum: number, prod: any) => {
                    const itemTotal = (prod.productprice || 0) * (prod.cart_count || 1);
                    return sum + itemTotal;
                  }, 0) || 0;

                  return (
                    <div
                      key={user._id || user.username + idx}
                      className="bg-muted border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      {/* User Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-lg">{user.username}</h3>
                            {/* <div className="flex items-center gap-2 mt-1">
                              {user.userphone ? (
                                <>
                                  <Phone className="w-4 h-4 text-primary" />
                                  <span className="text-muted-foreground text-sm">{user.userphone}</span>
                                </>
                              ) : (
                                <span className="text-warning text-sm">Null</span>
                              )}
                            </div> */}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-success font-bold text-xl">₹{totalValue.toLocaleString()}</div>
                          <div className="text-muted-foreground text-xs">{user.products?.length || 0} products</div>
                        </div>
                      </div>

                      {/* Products Section */}
                      {user.products && user.products.length > 0 ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Package className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-primary font-semibold text-sm">Products</span>
                            <div className="ml-auto bg-muted px-2 py-1 rounded-full">
                              <span className="text-muted-foreground text-xs">
                                {user.products.length}
                              </span>
                            </div>
                          </div>

                          {/* Products Vertical Slider */}
                          <div className="relative group">
                            {/* Navigation Button - Up */}
                            {/* {user.products.length > 1 && (
// <button
//   onClick={() => {
//     const container = document.getElementById(`products-slider-${user._id}`)
//     if (container) container.scrollBy({ top: -250, behavior: 'smooth' })
//   }}
//   className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card hover:bg-primary/10 border-2 border-border hover:border-primary rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
// >
//   <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-90" />
// </button>
)} */}

                            {/* Slider Container */}
                            <div
                              id={`products-slider-${user._id}`}
                              className="flex flex-col gap-3 overflow-y-auto scroll-smooth py-2"
                              style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                maxHeight: '500px'
                              }}
                            >
                              {user.products.map((prod: any, i: number) => {
                                const getStatusColor = (status: string) => {
                                  const s = (status || "").toLowerCase()
                                  if (s === "delivered") return "bg-success/10 text-success border-success/30"
                                  if (s === "cancelled") return "bg-warning/10 text-warning border-warning/30"
                                  return "bg-primary/10 text-primary border-primary/30"
                                }

                                const getPaymentStatusColor = (status: string) => {
                                  const s = (status || "").toLowerCase()
                                  if (s === "success") return "bg-success/10 text-success border-success/30"
                                  if (s === "pending") return "bg-warning/10 text-warning border-warning/30"
                                  if (s === "failed") return "bg-destructive/10 text-destructive border-destructive/30"
                                  return "bg-muted text-muted-foreground border-border"
                                }

                                // Fix: Calculate item total correctly
                                const itemUnitPrice = prod.productprice || 0;
                                const itemCartCount = prod.cart_count || 1;
                                const itemTotal = itemUnitPrice * itemCartCount;

                                return (
                                  <div
                                    key={i}
                                    className="bg-card border-2 border-border rounded-xl p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-200"
                                  >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-foreground text-base mb-2">
                                          {prod.productname}
                                        </h4>
                                        <div className="space-y-1.5 bg-muted rounded-lg p-3 border border-border">
                                          <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">Unit Price:</span>
                                            <span className="text-sm font-medium text-foreground">₹{itemUnitPrice.toLocaleString()}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">Quantity:</span>
                                            <span className="text-sm font-medium text-foreground">{itemCartCount}</span>
                                          </div>
                                          <div className="flex justify-between items-center pt-1.5 border-t border-border">
                                            <span className="text-sm font-semibold text-muted-foreground">Total:</span>
                                            <span className="text-base font-bold text-success">₹{itemTotal.toLocaleString()}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground font-medium">Delivery Status</p>
                                        <span
                                          className={`inline-flex items-center justify-center w-full px-2.5 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(
                                            prod.productdeliverystatus,
                                          )}`}
                                        >
                                          <span className="capitalize">{prod.productdeliverystatus}</span>
                                        </span>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground font-medium">Payment Status</p>
                                        <span
                                          className={`inline-flex items-center justify-center w-full px-2.5 py-1.5 rounded-lg text-xs font-medium border ${getPaymentStatusColor(
                                            prod.paymentStatus,
                                          )}`}
                                        >
                                          <span className="capitalize">{prod.paymentStatus || "N/A"}</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>


                          </div>


                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Package className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground font-medium">No products found</p>
                          <p className="text-muted-foreground text-sm mt-1">This user hasn't ordered anything yet</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-muted border border-border rounded-xl p-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-3">No orders found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">{
                    searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria to find orders."
                      : "No orders have been placed yet. Orders will appear here once customers start placing them."
                  }</p>
                  {(searchTerm || statusFilter !== "all") && (
                    <button
                      onClick={() => { setSearchTerm(""); setStatusFilter("all") }}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors duration-200"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )

      case "table":
        return (
          <>
            <div className="mb-8 mt-4 flex items-center justify-center">
              <h1 className="text-4xl font-bold text-foreground mb-2">Order Management</h1>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  title="Filter by order status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[140px]"
                >
                  <option value="all">All Orders ({getAllOrders.length})</option>
                  <option value="pending">Pending ({getAllOrders.filter(o => o.status === "pending").length})</option>
                  <option value="picked_up">Picked Up ({getAllOrders.filter(o => o.status === "picked_up").length})</option>
                  <option value="in_transit">In Transit ({getAllOrders.filter(o => o.status === "in_transit").length})</option>
                  <option value="shipped">Shipped ({getAllOrders.filter(o => o.status === "shipped").length})</option>
                 
                </select>
              </div>
            </div>

            <div className="bg-muted border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border bg-muted">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold text-foreground">All Orders ({filteredOrders.length})</h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="text-left p-4 text-muted-foreground font-semibold text-sm uppercase tracking-wider">Order ID</th>
                      <th className="text-left p-4 text-muted-foreground font-semibold text-sm uppercase tracking-wider">Customer</th>
                      <th className="text-left p-4 text-muted-foreground font-semibold text-sm uppercase tracking-wider">Status</th>
                      <th className="text-left p-4 text-muted-foreground font-semibold text-sm uppercase tracking-wider">Amount</th>
                      <th className="text-left p-4 text-muted-foreground font-semibold text-sm uppercase tracking-wider">Payment Status</th>
                      <th className="text-left p-4 text-muted-foreground font-semibold text-sm uppercase tracking-wider">Cart Count</th>
                      <th className="text-left p-4 text-muted-foreground font-semibold text-sm uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted transition-colors duration-200 group">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-foreground font-medium">{order.productName}</span>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded" title="Copy order ID">
                              <Copy className="w-3 h-3 text-muted-foreground" />
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500/5 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {order.customer?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-foreground text-sm font-medium">{order.customer}</p>
                              <p className="text-muted-foreground text-sm flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {order.phone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${order.status === "pending"
                                ? "bg-primary/10 text-primary border-primary/30"
                                : order.status === "picked_up"
                                  ? "bg-primary/10 text-primary border-primary/30"
                                  : order.status === "in_transit"
                                    ? "bg-primary/10 text-primary border-primary/30"
                                    : order.status === "delivered"
                                      ? "bg-success/10 text-success border-success/30"
                                      : "bg-warning/10 text-warning border-warning/30"
                                }`}
                            >
                              {getStatusText(order.status)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-success font-bold text-lg">₹{order.amount}</span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${order.paymentStatus?.toLowerCase() === "success"
                              ? "bg-success/10 text-success border-success/30"
                              : order.paymentStatus?.toLowerCase() === "pending"
                                ? "bg-warning/10 text-warning border-warning/30"
                                : order.paymentStatus?.toLowerCase() === "failed"
                                  ? "bg-destructive/10 text-destructive border-destructive/30"
                                  : "bg-muted text-muted-foreground border-border"
                              }`}
                          >
                            {order.paymentStatus || "N/A"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-primary font-medium text-sm">{order.cart_count}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {order.status !== "delivered" && order.status !== "cancelled" ? (
                              <div className="flex flex-col gap-1">
                                {!order.hasPaymentInfo && (
                                  <div className="flex items-center gap-1.5 text-xs text-warning bg-warning/5 border border-warning/20 rounded-lg px-2 py-1">
                                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                    <span>No payment record — status locked</span>
                                  </div>
                                )}
                                {order.paymentStatus?.toLowerCase() === "pending" && order.hasPaymentInfo && (
                                  <div className="flex items-center gap-1.5 text-xs text-warning bg-warning/5 border border-warning/20 rounded-lg px-2 py-1">
                                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                    <span>Payment pending — cannot mark delivered</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <select
                                    value={order.status}
                                    title={!order.hasPaymentInfo
                                      ? "Status locked — no payment record found"
                                      : order.paymentStatus?.toLowerCase() === "pending"
                                        ? "Cannot mark as delivered — payment pending"
                                        : "Change order status"}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    disabled={updatingStatus === order.id || !order.hasPaymentInfo}
                                    className={`border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                                      !order.hasPaymentInfo
                                        ? "bg-muted border-border text-muted-foreground cursor-not-allowed"
                                        : "bg-muted border-border text-foreground"
                                    }`}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="picked_up">Picked Up</option>
                                    <option value="in_transit">In Transit</option>
                                    <option value="shipped">Shipped</option>
                                 
                                  </select>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${order.status === "delivered"
                                    ? "bg-success/10 text-success border border-success/30"
                                    : "bg-warning/10 text-warning border border-warning/30"
                                    }`}
                                >
                                  {order.status === "delivered" ? "✓ Completed" : "✗ Cancelled"}
                                </span>
                              </div>
                            )}

                            {updatingStatus === order.id && <Timer className="w-4 h-4 animate-spin text-primary" />}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Empty State */}
              {filteredOrders.length === 0 && (
                <div className="p-16 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">No orders found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">{
                    searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria to find orders."
                      : "No orders have been placed yet. Orders will appear here once customers start placing them."
                  }</p>
                  {(searchTerm || statusFilter !== "all") && (
                    <button
                      onClick={() => { setSearchTerm(""); setStatusFilter("all") }}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors duration-200"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )

      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">This section is under development</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-muted text-foreground flex">
      {renderLeftPanel()}
      <main className="flex-1 md:ml-80 ml-0 p-4 sm:p-8 overflow-y-auto mt-16">
        {renderMainContent()}
        {OtpModal()}
      </main>
    </div>
  )
}



