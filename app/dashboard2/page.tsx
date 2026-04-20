"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import type { AppDispatch } from "@/app/redux/store";
import { 
  get_admin_dashboard_data, 
  get_employees_list, 
  get_all_products_admin, 
  update_user_role 
} from "@/app/redux/product";
import { AdminLayout } from "@/components/AdminLayout";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  revenueData,
  categoryData,
  trafficData,
  orders,
  customers,
  products,
  coupons,
} from "@/data/mockData";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Eye,
  ArrowUpRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  Download,
  Plus,
  Upload,
  Star,
  Copy,
  Mail,
  Ban,
  UserCheck,
  ShieldCheck,
  CalendarDays,
  Building2,
  Award,
  Clock,
  Lock,
  CheckCircle2,
  XCircle,
  Phone,
  Bell,
  ChevronDown,
} from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ComposedChart,
} from "recharts";
import { toast } from "sonner";

// ─── Sparkline data for KPI cards ─────────────────────────────────────────────
const sparkRevenue   = [222,97,167,242,373,301,245,409,261,327,342,446,364,243,387,383,454,293,385,481,498,388,293,335,197,448,473,499,315,420,340,470,439,294,385,438,492,426,475,408,480,434,448,446].map(v=>({v}));
const sparkOrders    = [150,180,120,260,290,340,180,320,110,190,350,210,380,220,170,190,360,410,180,150,200,170,230,290,250,130,420,180,240,380,280,200,410,160,380,140,250,370,320,480,530,380,490,400].map(v=>({v}));
const sparkCustomers = [97,167,242,373,301,245,409,59,261,327,292,342,137,120,138,446,364,243,89,137,224,138,387,215,75,383,122,315,454,165,293,247,385,481,498,388,149,227,293,335,197,197,448,473].map(v=>({v}));
const sparkProducts  = [446,448,409,409,385,373,364,342,340,335,327,323,317,315,307,301,294,293,293,292,261,252,247,243,243,235,233,224,215,213,201,197,178,178,169,167,165,155,149,141,138,137,132,122].map(v=>({v}));

// Analytics card sparks
const sparkAOV       = [55,62,58,70,64,68,72,66,74,69,78,71,80,73,82,75,84,77,86,79,88,81,90,83,92,85,94,87,96,89,98,91,100,93,102,95,104,97,106,99,108,101,110,103].map(v=>({v}));
const sparkConv      = [2.1,2.4,2.8,2.6,3.1,3.4,3.2,3.6,3.9,3.7,4.2,4.8,2.8,3.0,3.4,3.1,3.6,3.9,3.7,4.2,4.8,3.9,4.2,4.8,4.1,4.4,4.6,4.3,4.7,4.9,4.5,4.8,5.0,4.6,4.9,5.1,4.8,5.0,5.2,4.9,5.2,5.4,5.1,5.3].map(v=>({v}));
const sparkPageViews = [97,110,125,118,142,138,155,148,162,157,170,165,178,172,185,180,192,187,200,195,208,202,215,210,222,217,230,224,238,232,245,240,252,247,260,254,268,262,275,270,282,276,290,285].map(v=>({v}));
const sparkAbandon   = [72,74,71,75,70,73,68,74,69,72,67,73,66,72,65,71,64,70,65,71,63,69,62,68,64,70,63,69,61,67,62,68,60,66,61,67,59,65,60,66,58,64,59,65].map(v=>({v}));

// Employee card sparks
const sparkTotalEmp  = [38,39,39,40,40,41,41,42,42,43,43,44,44,45,45,46,46,47,47,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48].map(v=>({v}));
const sparkActiveEmp = [35,36,36,37,37,38,38,39,39,40,40,41,41,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42].map(v=>({v}));
const sparkOnLeave   = [1,1,2,1,2,2,3,2,3,3,4,3,4,4,5,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4].map(v=>({v}));
const sparkAvgPerf   = [80,81,82,81,83,84,83,85,84,86,85,87,86,87,87,88,87,88,88,89,88,89,89,90,89,90,90,91,90,91,87,87,87,87,87,87,87,87,87,87,87,87,87,87].map(v=>({v}));

// ─── Analytics data ───────────────────────────────────────────────────────────
const conversionData = [
  { month: "Jan", rate: 2.1 }, { month: "Feb", rate: 2.4 }, { month: "Mar", rate: 2.8 },
  { month: "Apr", rate: 2.6 }, { month: "May", rate: 3.1 }, { month: "Jun", rate: 3.4 },
  { month: "Jul", rate: 3.2 }, { month: "Aug", rate: 3.6 }, { month: "Sep", rate: 3.9 },
  { month: "Oct", rate: 3.7 }, { month: "Nov", rate: 4.2 }, { month: "Dec", rate: 4.8 },
];

const performanceData = [
  { metric: "Sales", A: 85 }, { metric: "Traffic", A: 72 },
  { metric: "Conversion", A: 68 }, { metric: "Retention", A: 90 },
  { metric: "Satisfaction", A: 78 }, { metric: "Growth", A: 82 },
];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

const employeeData = [
  { id: "EMP-001", name: "Alice Johnson", email: "alice@shopadmin.com", phone: "+1 555-0101", role: "Operations Manager", department: "Operations", status: "active", joined: "Jan 15, 2022", avatar: "AJ", salary: 85000, performance: 92, attendance: 97, permissions: { dashboard: true, products: true, orders: true, customers: true, analytics: true, coupons: false, settings: false } },
  { id: "EMP-002", name: "Bob Martinez", email: "bob@shopadmin.com", phone: "+1 555-0102", role: "Senior Developer", department: "Technology", status: "active", joined: "Mar 8, 2022", avatar: "BM", salary: 92000, performance: 88, attendance: 95, permissions: { dashboard: true, products: true, orders: false, customers: false, analytics: true, coupons: false, settings: true } },
  { id: "EMP-003", name: "Carol White", email: "carol@shopadmin.com", phone: "+1 555-0103", role: "Sales Lead", department: "Sales", status: "active", joined: "Jun 20, 2022", avatar: "CW", salary: 72000, performance: 94, attendance: 98, permissions: { dashboard: true, products: true, orders: true, customers: true, analytics: true, coupons: true, settings: false } },
  { id: "EMP-004", name: "David Chen", email: "david@shopadmin.com", phone: "+1 555-0104", role: "UI/UX Designer", department: "Design", status: "on-leave", joined: "Sep 5, 2022", avatar: "DC", salary: 78000, performance: 85, attendance: 88, permissions: { dashboard: true, products: true, orders: false, customers: false, analytics: false, coupons: false, settings: false } },
  { id: "EMP-005", name: "Emma Davis", email: "emma@shopadmin.com", phone: "+1 555-0105", role: "Customer Support", department: "Support", status: "active", joined: "Nov 12, 2022", avatar: "ED", salary: 58000, performance: 90, attendance: 96, permissions: { dashboard: true, products: false, orders: true, customers: true, analytics: false, coupons: true, settings: false } },
  { id: "EMP-006", name: "Frank Wilson", email: "frank@shopadmin.com", phone: "+1 555-0106", role: "Finance Analyst", department: "Finance", status: "inactive", joined: "Feb 28, 2023", avatar: "FW", salary: 82000, performance: 78, attendance: 82, permissions: { dashboard: true, products: false, orders: false, customers: false, analytics: true, coupons: false, settings: false } },
];

const attendanceData = [
  { month: "Jan", present: 22, absent: 0, late: 2 },
  { month: "Feb", present: 19, absent: 1, late: 1 },
  { month: "Mar", present: 23, absent: 0, late: 0 },
  { month: "Apr", present: 20, absent: 2, late: 3 },
  { month: "May", present: 22, absent: 1, late: 1 },
  { month: "Jun", present: 21, absent: 0, late: 2 },
];

const employeePerformanceData = [
  { month: "Jan", score: 82 }, { month: "Feb", score: 85 },
  { month: "Mar", score: 88 }, { month: "Apr", score: 84 },
  { month: "May", score: 90 }, { month: "Jun", score: 92 },
];

const kpiChartConfig: ChartConfig = {
  actual: { label: "Actual", color: "hsl(var(--chart-1))" },
  target: { label: "Target", color: "hsl(var(--chart-3))" },
};

const deptTrendData = [
  { month: "Jan", operations: 88, sales: 91, technology: 84 },
  { month: "Feb", operations: 89, sales: 92, technology: 85 },
  { month: "Mar", operations: 90, sales: 93, technology: 86 },
  { month: "Apr", operations: 91, sales: 93, technology: 87 },
  { month: "May", operations: 91, sales: 94, technology: 88 },
  { month: "Jun", operations: 92, sales: 94, technology: 88 },
];

const deptChartConfig: ChartConfig = {
  operations: { label: "Operations", color: "hsl(var(--chart-1))" },
  sales:       { label: "Sales",      color: "hsl(var(--chart-2))" },
  technology:  { label: "Technology", color: "hsl(var(--chart-3))" },
};

const perfTrendFullData = [
  { date: "2025-01-01", score: 79, target: 85 }, { date: "2025-02-01", score: 81, target: 85 },
  { date: "2025-03-01", score: 83, target: 86 }, { date: "2025-04-01", score: 80, target: 86 },
  { date: "2025-05-01", score: 84, target: 87 }, { date: "2025-06-01", score: 86, target: 87 },
  { date: "2025-07-01", score: 85, target: 88 }, { date: "2025-08-01", score: 87, target: 88 },
  { date: "2025-09-01", score: 89, target: 89 }, { date: "2025-10-01", score: 88, target: 90 },
  { date: "2025-11-01", score: 91, target: 90 }, { date: "2025-12-01", score: 92, target: 91 },
];

const perfTrendConfig: ChartConfig = {
  score:  { label: "Score",  color: "hsl(var(--chart-1))" },
  target: { label: "Target", color: "hsl(var(--chart-3))" },
};

const revenueChartData = [
  { date: "2025-04-01", revenue: 28000, profit: 9000 },
  { date: "2025-04-05", revenue: 32000, profit: 11000 },
  { date: "2025-04-10", revenue: 30000, profit: 10500 },
  { date: "2025-04-15", revenue: 35000, profit: 12000 },
  { date: "2025-04-20", revenue: 29000, profit: 9800 },
  { date: "2025-04-25", revenue: 33000, profit: 11500 },
  { date: "2025-05-01", revenue: 36000, profit: 13000 },
  { date: "2025-05-05", revenue: 38000, profit: 14000 },
  { date: "2025-05-10", revenue: 34000, profit: 12500 },
  { date: "2025-05-15", revenue: 40000, profit: 15000 },
  { date: "2025-05-20", revenue: 37000, profit: 13800 },
  { date: "2025-05-25", revenue: 42000, profit: 16000 },
  { date: "2025-06-01", revenue: 39000, profit: 14500 },
  { date: "2025-06-05", revenue: 44000, profit: 17000 },
  { date: "2025-06-10", revenue: 41000, profit: 15500 },
  { date: "2025-06-15", revenue: 46000, profit: 18000 },
  { date: "2025-06-20", revenue: 43000, profit: 16500 },
  { date: "2025-06-25", revenue: 48000, profit: 19000 },
  { date: "2025-06-30", revenue: 50000, profit: 20000 },
];

// ─── 1-Year monthly revenue data (Jan–Dec 2025) ───────────────────────────────
const revenueChartData1Y = [
  { date: "2025-01", revenue: 285000, profit: 91000 },
  { date: "2025-02", revenue: 302000, profit: 97000 },
  { date: "2025-03", revenue: 318000, profit: 104000 },
  { date: "2025-04", revenue: 295000, profit: 96000 },
  { date: "2025-05", revenue: 341000, profit: 115000 },
  { date: "2025-06", revenue: 367000, profit: 124000 },
  { date: "2025-07", revenue: 352000, profit: 118000 },
  { date: "2025-08", revenue: 388000, profit: 132000 },
  { date: "2025-09", revenue: 374000, profit: 127000 },
  { date: "2025-10", revenue: 412000, profit: 141000 },
  { date: "2025-11", revenue: 398000, profit: 136000 },
  { date: "2025-12", revenue: 451000, profit: 158000 },
];

// ─── 5-Year annual revenue data (2021–2025) ───────────────────────────────────
const revenueChartData5Y = [
  { date: "2021", revenue: 2850000, profit: 820000 },
  { date: "2022", revenue: 3240000, profit: 980000 },
  { date: "2023", revenue: 3710000, profit: 1180000 },
  { date: "2024", revenue: 4150000, profit: 1390000 },
  { date: "2025", revenue: 4683000, profit: 1642000 },
];

const revenueChartConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  profit:  { label: "Profit",  color: "hsl(var(--chart-2))" },
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Dashboard2Page() {
  const [activeTab, setActiveTab] = useState("overview");
  const dispatch = useDispatch<AppDispatch>();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Protect route - redirect if not authenticated or not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/profile");
    }
  }, [status, session?.user?.role, router]);

  // Show loading state while checking auth
  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Don't render if not authenticated or not admin
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  
  // Redux selectors
  const { adminDashboardData, employeesList, adminProducts, adminLoading, adminError } = useSelector(
    (state: any) => state.product
  );

  // Employee state
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState(employeeData[0]);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [editEmployeeOpen, setEditEmployeeOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(employeeData[0]);

  // Products state
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  // Customers state
  const [customerSearch, setCustomerSearch] = useState("");

  // Coupons state
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [perfTimeRange, setPerfTimeRange] = useState("12m");
  const [revenueTimeRange, setRevenueTimeRange] = useState("90d");
  
  // Pie chart hover state
  const [activePieSlice, setActivePieSlice] = useState<string | null>(null);
  
  // Permission dropdown state
  const [expandedRole, setExpandedRole] = useState<string | null>("Manager");

  // Fetch admin data on mount
  useEffect(() => {
    if (session?.user) {
      dispatch(get_admin_dashboard_data());
      dispatch(get_employees_list());
      dispatch(get_all_products_admin());
    }
  }, [dispatch, session?.user]);

  // Derived lists
  const departments = [...new Set(employeeData.map((e) => e.department))];

  // Use Redux employee data if available, fallback to mock data
  const displayEmployees = employeesList && employeesList.length > 0 ? employeesList : employeeData;

  const filteredEmployees = displayEmployees.filter((e: any) => {
    const matchesSearch =
      e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      e.role.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      e.email.toLowerCase().includes(employeeSearch.toLowerCase());
    const matchesDept = deptFilter === "all" || e.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Map API recentOrders to table format
  const recentOrdersFromAPI = adminDashboardData?.recentOrders?.map((order: any) => ({
    id: order.Order,
    customer: order.Customer,
    total: order.Total,
    status: order.Status?.toLowerCase() || "pending",
    date: new Date(order.Date).toLocaleDateString(),
  })) || [];

  // Use API orders if available, fallback to mock data
  const displayOrders = recentOrdersFromAPI.length > 0 ? recentOrdersFromAPI : orders;

  const categories = [...new Set(products.map((p) => p.category))];

  // Use Redux product data if available, fallback to mock data
  const displayProducts = adminProducts && adminProducts.length > 0 ? adminProducts : products;

  const filteredProducts = displayProducts.filter((p: any) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.item_name?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter || p.item_category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    overview:   { title: "Dashboard",  subtitle: "Welcome back, Admin" },
    analytics:  { title: "Analytics",  subtitle: "Detailed performance insights" },
    employees:  { title: "Employees",  subtitle: `${employeeData.length} team members` },
    products:   { title: "Products",   subtitle: `${products.length} total products` },
    customers:  { title: "Customers",  subtitle: `${customers.length} registered customers` },
    coupons:    { title: "Coupons",    subtitle: "Manage discount codes" },
    settings:   { title: "Settings",   subtitle: "Manage store configuration" },
  };

  const { title, subtitle } = tabTitles[activeTab] ?? tabTitles.overview;

  return (
    <AdminLayout title={title} subtitle={subtitle} activeTab={activeTab} onTabChange={setActiveTab} hideNavbar={true}>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

        {/* ─── OVERVIEW ──────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              title="Total Revenue" 
              value={`$${(adminDashboardData?.revenuedata?.totalRevenue || 0).toLocaleString()}`}
              change="+12.5%" 
              changeType="positive" 
              icon={DollarSign} 
              sparkData={sparkRevenue} 
            />
            <KpiCard 
              title="Total Orders" 
              value={(adminDashboardData?.revenuedata?.totalOrders || 0).toLocaleString()} 
              change="+8.2%" 
              changeType="positive" 
              icon={ShoppingCart} 
              sparkData={sparkOrders} 
            />
            <KpiCard 
              title="Customers" 
              value={(adminDashboardData?.revenuedata?.totalUsers || 0).toLocaleString()} 
              change="+15.3%" 
              changeType="positive" 
              icon={Users} 
              sparkData={sparkCustomers} 
            />
            <KpiCard 
              title="Products" 
              value={(adminDashboardData?.revenuedata?.totalProducts || 0).toLocaleString()} 
              change="-2.1%" 
              changeType="negative" 
              icon={Package} 
              sparkData={sparkProducts} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 pt-0">
              <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4 sm:flex-row">
                <div className="grid flex-1 gap-1">
                  <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
                  <CardDescription>Revenue &amp; profit trends</CardDescription>
                </div>
                <Select value={revenueTimeRange} onValueChange={setRevenueTimeRange}>
                  <SelectTrigger className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex" aria-label="Select range">
                    <SelectValue placeholder="Last 3 months" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="5y" className="rounded-lg">Last 5 years</SelectItem>
                    <SelectItem value="1y" className="rounded-lg">Last 1 year</SelectItem>
                    <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
                    <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
                    <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={revenueChartConfig} className="aspect-auto h-[280px] w-full">
                  <AreaChart
                    data={
                      revenueTimeRange === "1y" ? revenueChartData1Y
                      : revenueTimeRange === "5y" ? revenueChartData5Y
                      : revenueChartData.filter((item) => {
                          const date = new Date(item.date);
                          const ref = new Date("2025-06-30");
                          const days = revenueTimeRange === "7d" ? 7 : revenueTimeRange === "30d" ? 30 : 90;
                          const start = new Date(ref);
                          start.setDate(start.getDate() - days);
                          return date >= start;
                        })
                    }
                  >
                    <defs>
                      <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-profit)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-profit)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tickFormatter={(v) =>
                        revenueTimeRange === "5y"
                          ? String(v)
                          : revenueTimeRange === "1y"
                          ? new Date(v + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" })
                          : new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(v) =>
                            revenueTimeRange === "5y"
                              ? String(v)
                              : revenueTimeRange === "1y"
                              ? new Date(v + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })
                              : new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          }
                          indicator="dot"
                        />
                      }
                    />
                    <Area dataKey="profit"  type="natural" fill="url(#fillProfit)"  stroke="var(--color-profit)"  stackId="a" />
                    <Area dataKey="revenue" type="natural" fill="url(#fillRevenue)" stroke="var(--color-revenue)" stackId="a" />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie 
                      data={categoryData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={55} 
                      outerRadius={85} 
                      paddingAngle={4} 
                      dataKey="value"
                      onMouseEnter={(_, index) => setActivePieSlice(categoryData[index]?.name || null)}
                      onMouseLeave={() => setActivePieSlice(null)}
                    >
                      {categoryData.map((entry) => (
                        <Cell 
                          key={entry.name} 
                          fill={activePieSlice === entry.name ? entry.fill : entry.fill}
                          opacity={activePieSlice === null || activePieSlice === entry.name ? 1 : 0.6}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(value : any) => [`${value ?? 0}%`, "Share"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {categoryData.map((item) => (
                    <div 
                      key={item.name} 
                      className="flex items-center gap-2 text-xs cursor-pointer transition-opacity"
                      onMouseEnter={() => setActivePieSlice(item.name)}
                      onMouseLeave={() => setActivePieSlice(null)}
                      style={{ opacity: activePieSlice === null || activePieSlice === item.name ? 1 : 0.6 }}
                    >
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="hover:bg-card/80 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Monthly Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="orders" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Order</TableHead>
                      <TableHead className="text-xs">Customer</TableHead>
                      <TableHead className="text-xs">Total</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayOrders.slice(0, 5).map((order: any, index: number) => (
                      <TableRow key={`order-${order.id}-${index}`}>
                        <TableCell className="text-sm font-medium">{order.id}</TableCell>
                        <TableCell className="text-sm">{order.customer}</TableCell>
                        <TableCell className="text-sm">${order.total.toFixed(2)}</TableCell>
                        <TableCell><StatusBadge status={order.status} /></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{order.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>x
          </div>
        </TabsContent>

        {/* ─── ANALYTICS ─────────────────────────────────────────────────── */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Avg. Order Value" value="$66.40" change="+5.2%" changeType="positive" icon={DollarSign} sparkData={sparkAOV} />
            <KpiCard title="Conversion Rate" value="3.8%" change="+0.6%" changeType="positive" icon={TrendingUp} sparkData={sparkConv} />
            <KpiCard title="Page Views" value="142K" change="+22.1%" changeType="positive" icon={Eye} sparkData={sparkPageViews} />
            <KpiCard title="Cart Abandon Rate" value="68.2%" change="-3.4%" changeType="positive" icon={ShoppingCart} sparkData={sparkAbandon} />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Revenue vs Profit vs Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} opacity={0.8} name="Revenue ($)" />
                  <Bar yAxisId="left" dataKey="profit" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} opacity={0.8} name="Profit ($)" />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} name="Orders" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Conversion Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={conversionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" unit="%" />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v ?? 0}%`, "Conv. Rate"]} />
                    <Line type="monotone" dataKey="rate" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--chart-1))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={trafficData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="source" type="category" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={70} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="visitors" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Performance Score</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Radar name="Score" dataKey="A" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>


            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                      {categoryData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v ?? 0}%`, "Share"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        {/* EMPLOYEES */}
        <TabsContent value="employees" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Employees" value="48" change="+3" changeType="positive" icon={Users} sparkData={sparkTotalEmp} />
            <KpiCard title="Active" value="42" change="+1" changeType="positive" icon={UserCheck} sparkData={sparkActiveEmp} />
            <KpiCard title="On Leave" value="4" change="+2" changeType="negative" icon={CalendarDays} sparkData={sparkOnLeave} />
            <KpiCard title="Avg. Performance" value="87%" change="+2.4%" changeType="positive" icon={TrendingUp} sparkData={sparkAvgPerf} />
          </div>

          <Tabs defaultValue="directory" className="space-y-4">
            <TabsList>
              <TabsTrigger value="directory">Directory</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            {/* DIRECTORY */}
            <TabsContent value="directory" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-3 flex-1 w-full sm:w-auto">
                  <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search employees..." className="pl-9" value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)} />
                  </div>
                  <Select value={deptFilter} onValueChange={setDeptFilter}>
                    <SelectTrigger className="w-44"><SelectValue placeholder="Department" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Dialog open={addEmployeeOpen} onOpenChange={setAddEmployeeOpen}>
                    <DialogTrigger asChild>
                      <Button><Plus className="mr-2 h-4 w-4" /> Add Employee</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader><DialogTitle>Add New Employee</DialogTitle></DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Full Name</Label><Input placeholder="e.g. John Doe" /></div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <div className="flex gap-2">
                              <Input type="email" placeholder="john@company.com" />
                              <Button size="sm" variant="outline" onClick={() => toast.success("Verification email sent")}>Verify</Button>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Phone</Label><Input placeholder="+1 555-0000" /></div>
                          <div className="space-y-2"><Label>Employee ID</Label><Input placeholder="EMP-XXX" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Department</Label>
                            <Select><SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
                              <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2"><Label>Role / Title</Label><Input placeholder="e.g. Sales Manager" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Start Date</Label><Input type="date" /></div>
                          <div className="space-y-2"><Label>Annual Salary ($)</Label><Input type="number" placeholder="0" /></div>
                        </div>
                        <div className="space-y-2">
                          <Label>Access Level</Label>
                          <Select><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin - Full Access</SelectItem>
                              <SelectItem value="manager">Manager - Restricted</SelectItem>
                              <SelectItem value="staff">Staff - Limited</SelectItem>
                              <SelectItem value="readonly">Read Only - View Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <input type="checkbox" className="h-4 w-4 rounded" />
                            Active Account
                          </Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAddEmployeeOpen(false)}>Cancel</Button>
                        <Button onClick={() => { toast.success("Employee added successfully"); setAddEmployeeOpen(false); }}>Add Employee</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((emp: any) => (
                        <TableRow key={emp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedEmployee(emp)}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                  {emp.avatar || emp.name?.charAt(0).toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{emp.name}</p>
                                <p className="text-xs text-muted-foreground">{emp.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{emp.role}</TableCell>
                          <TableCell>
                            {emp.department ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                <Building2 className="h-3 w-3" />{emp.department}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{emp.lastActive || "2 hours ago"}</TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">{emp.ipAddress || "192.168.1.100"}</TableCell>
                          <TableCell><StatusBadge status={emp.status as any || "active"} /></TableCell>
                          <TableCell className="text-sm text-muted-foreground">{emp.joined || "Recently"}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedEmployee(emp); }}><Eye className="mr-2 h-3.5 w-3.5" /> View Profile</DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingEmployee(emp); setEditEmployeeOpen(true); }}><Pencil className="mr-2 h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.success(`Email sent to ${emp.email}`); }}><Mail className="mr-2 h-3.5 w-3.5" /> Send Email</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); toast.error(`${emp.name} has been deactivated`); }}><Ban className="mr-2 h-3.5 w-3.5" /> Deactivate</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <p className="text-sm text-muted-foreground">Showing {filteredEmployees.length} of {displayEmployees.length} employees</p>
            </TabsContent>

            {/* PROFILE & SETTINGS REMOVED */}
            {false && <TabsContent value="profile" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">{selectedEmployee.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedEmployee.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedEmployee.role}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1">
                        <Building2 className="h-3 w-3" />{selectedEmployee.department}
                      </span>
                    </div>
                    <Separator className="w-full" />
                    <div className="w-full space-y-2 text-left">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4 text-primary shrink-0" />{selectedEmployee.email}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4 text-primary shrink-0" />{selectedEmployee.phone}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4 text-primary shrink-0" />Joined {selectedEmployee.joined}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Award className="h-4 w-4 text-primary shrink-0" />${selectedEmployee.salary.toLocaleString()} / year</div>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-2 pt-2">
                      <div className="text-center p-2 rounded-lg bg-muted">
                        <p className="text-lg font-bold text-primary">{selectedEmployee.performance}%</p>
                        <p className="text-xs text-muted-foreground">Performance</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted">
                        <p className="text-lg font-bold text-primary">{selectedEmployee.attendance}%</p>
                        <p className="text-xs text-muted-foreground">Attendance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle>Employee Details</CardTitle>
                      <CardDescription>View and manage {selectedEmployee.name}'s information</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => { setEditingEmployee(selectedEmployee); setEditEmployeeOpen(true); }}>
                      <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Profile
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                      {[
                        { label: "Full Name", value: selectedEmployee.name },
                        { label: "Employee ID", value: selectedEmployee.id },
                        { label: "Email Address", value: selectedEmployee.email },
                        { label: "Phone", value: selectedEmployee.phone },
                        { label: "Department", value: selectedEmployee.department },
                        { label: "Role / Title", value: selectedEmployee.role },
                        { label: "Annual Salary", value: `$${selectedEmployee.salary.toLocaleString()}` },
                        { label: "Date Joined", value: selectedEmployee.joined },
                        { label: "Employment Status", value: selectedEmployee.status.replace("-", " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) },
                        { label: "Performance Score", value: `${selectedEmployee.performance}%` },
                      ].map((item) => (
                        <div key={item.label} className="space-y-0.5 border-b border-border pb-3 last:border-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
                          <p className="text-sm font-semibold text-foreground">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage login and security for {selectedEmployee.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Security</h4>
                      <div className="flex items-center justify-between">
                        <div><p className="text-sm font-medium">Two-Factor Authentication</p><p className="text-xs text-muted-foreground">Require 2FA on each login</p></div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div><p className="text-sm font-medium">Force Password Reset</p><p className="text-xs text-muted-foreground">User must reset on next login</p></div>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label>Reset Password</Label>
                        <div className="flex gap-2">
                          <Input type="password" placeholder="New password" className="flex-1" />
                          <Button variant="outline" onClick={() => toast.success("Password reset email sent")}>Send Reset</Button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Notifications</h4>
                      <div className="flex items-center justify-between">
                        <div><p className="text-sm font-medium">Email Notifications</p><p className="text-xs text-muted-foreground">Receive updates via email</p></div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div><p className="text-sm font-medium">System Alerts</p><p className="text-xs text-muted-foreground">Important system notifications</p></div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div><p className="text-sm font-medium">Weekly Reports</p><p className="text-xs text-muted-foreground">Receive weekly performance digest</p></div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>}

            {/* PERMISSIONS */}
            <TabsContent value="permissions" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Access Roles</CardTitle>
                    <CardDescription>Assign predefined permission sets</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {["Admin", "Manager", "Staff", "Read Only"].map((roleOpt) => (
                      <div key={roleOpt}>
                        <button 
                          onClick={() => setExpandedRole(expandedRole === roleOpt ? null : roleOpt)}
                          className={cn("w-full flex items-center justify-between p-3 rounded-lg border text-sm font-medium transition-colors", expandedRole === roleOpt ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted text-foreground")}
                        >
                          <div className="flex items-center gap-2">
                            <ShieldCheck className={cn("h-4 w-4", expandedRole === roleOpt ? "text-primary" : "text-muted-foreground")} />
                            {roleOpt}
                          </div>
                          {expandedRole === roleOpt && <ChevronDown className="h-4 w-4 text-primary" />}
                        </button>
                        {expandedRole === roleOpt && (
                          <div className="mt-2 p-3 rounded-lg bg-muted/50 border border-border text-sm space-y-2">
                            <div className="font-medium text-foreground">{roleOpt} Permissions:</div>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              {roleOpt === "Admin" && (
                                <>
                                  <div>✓ Full Dashboard Access</div>
                                  <div>✓ Manage All Products</div>
                                  <div>✓ Handle Orders & Payments</div>
                                  <div>✓ Customer Management</div>
                                  <div>✓ Analytics & Reports</div>
                                  <div>✓ Coupons & Discounts</div>
                                  <div>✓ System Settings</div>
                                </>
                              )}
                              {roleOpt === "Manager" && (
                                <>
                                  <div>✓ Dashboard & Overview</div>
                                  <div>✓ Products (view, edit)</div>
                                  <div>✓ Orders & Customers</div>
                                  <div>✓ Analytics</div>
                                  <div>✗ Settings</div>
                                </>
                              )}
                              {roleOpt === "Staff" && (
                                <>
                                  <div>✓ Dashboard View</div>
                                  <div>✓ Orders</div>
                                  <div>✓ Customers</div>
                                  <div>✗ Products Edit</div>
                                  <div>✗ Settings</div>
                                </>
                              )}
                              {roleOpt === "Read Only" && (
                                <>
                                  <div>✓ View Dashboard</div>
                                  <div>✓ View Products</div>
                                  <div>✓ View Orders</div>
                                  <div>✗ Create/Edit</div>
                                  <div>✗ Delete</div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Module Permissions</CardTitle>
                    <CardDescription>Fine-grained access control for {selectedEmployee.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { label: "Dashboard & Overview", key: "dashboard", desc: "View main dashboard and KPIs" },
                        { label: "Product Management", key: "products", desc: "Create, edit and delete products" },
                        { label: "Order Management", key: "orders", desc: "View and process customer orders" },
                        { label: "Customer Management", key: "customers", desc: "Access customer data and profiles" },
                        { label: "Analytics & Reports", key: "analytics", desc: "View reports and analytics data" },
                        { label: "Coupons & Discounts", key: "coupons", desc: "Manage promotional codes" },
                        { label: "System Settings", key: "settings", desc: "Configure store settings" },
                      ].map((perm) => (
                        <div key={perm.key} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0", (selectedEmployee.permissions as Record<string, boolean>)[perm.key] ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                              {perm.label.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{perm.label}</p>
                              <p className="text-xs text-muted-foreground">{perm.desc}</p>
                            </div>
                          </div>
                          <Switch defaultChecked={(selectedEmployee.permissions as Record<string, boolean>)[perm.key]} />
                        </div>
                      ))}
                    </div>
                    <Button className="mt-4" onClick={() => toast.success("Permissions saved successfully")}>Save Permissions</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ATTENDANCE */}
            <TabsContent value="attendance" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><CheckCircle2 className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">117</p><p className="text-xs text-muted-foreground">Days Present</p></div></div></CardContent></Card>
                <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0"><XCircle className="h-5 w-5 text-destructive" /></div><div><p className="text-2xl font-bold">4</p><p className="text-xs text-muted-foreground">Absent Days</p></div></div></CardContent></Card>
                <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-[hsl(var(--warning)/0.15)] flex items-center justify-center shrink-0"><Clock className="h-5 w-5 text-[hsl(var(--warning))]" /></div><div><p className="text-2xl font-bold">9</p><p className="text-xs text-muted-foreground">Late Arrivals</p></div></div></CardContent></Card>
                <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-[hsl(var(--chart-4)/0.15)] flex items-center justify-center shrink-0"><CalendarDays className="h-5 w-5 text-[hsl(var(--chart-4))]" /></div><div><p className="text-2xl font-bold">6</p><p className="text-xs text-muted-foreground">Leaves Taken</p></div></div></CardContent></Card>
              </div>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Monthly Attendance Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={attendanceData}>
                      <defs>
                        <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="lateGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                      <Area type="monotone" dataKey="present" name="Present" stroke="hsl(var(--chart-2))" strokeWidth={2.5} fill="url(#presentGrad)" dot={{ r: 4, fill: "hsl(var(--chart-2))" }} />
                      <Area type="monotone" dataKey="absent" name="Absent" stroke="hsl(var(--chart-5))" strokeWidth={2.5} fill="url(#absentGrad)" dot={{ r: 4, fill: "hsl(var(--chart-5))" }} />
                      <Area type="monotone" dataKey="late" name="Late" stroke="hsl(var(--chart-3))" strokeWidth={2.5} fill="url(#lateGrad)" dot={{ r: 4, fill: "hsl(var(--chart-3))" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Leave Requests</CardTitle>
                  <CardDescription>Pending and recent leave applications</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { name: "David Chen", avatar: "DC", type: "Annual Leave", from: "Mar 10", to: "Mar 17", days: 6, status: "active" },
                        { name: "Alice Johnson", avatar: "AJ", type: "Sick Leave", from: "Mar 3", to: "Mar 4", days: 2, status: "delivered" },
                        { name: "Emma Davis", avatar: "ED", type: "Personal Leave", from: "Mar 20", to: "Mar 20", days: 1, status: "pending" },
                        { name: "Bob Martinez", avatar: "BM", type: "Annual Leave", from: "Apr 1", to: "Apr 5", days: 5, status: "pending" },
                      ].map((req, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7"><AvatarFallback className="text-xs bg-primary/10 text-primary">{req.avatar}</AvatarFallback></Avatar>
                              <span className="text-sm font-medium">{req.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{req.type}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{req.from}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{req.to}</TableCell>
                          <TableCell className="text-sm font-medium">{req.days}d</TableCell>
                          <TableCell><StatusBadge status={req.status as any} /></TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toast.success("Leave approved")}><CheckCircle2 className="mr-2 h-3.5 w-3.5 text-primary" /> Approve</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => toast.error("Leave rejected")}><XCircle className="mr-2 h-3.5 w-3.5" /> Reject</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PERFORMANCE */}
            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Interactive Performance Trend */}
                <Card className="pt-0">
                  <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4 sm:flex-row">
                    <div className="grid flex-1 gap-1">
                      <CardTitle className="text-base font-semibold">Performance Trend</CardTitle>
                      <CardDescription>Score vs target — {selectedEmployee.name}</CardDescription>
                    </div>
                    <Select value={perfTimeRange} onValueChange={setPerfTimeRange}>
                      <SelectTrigger className="hidden w-[130px] rounded-lg sm:ml-auto sm:flex" aria-label="Time range">
                        <SelectValue placeholder="Last 12 months" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="12m" className="rounded-lg">Last 12 months</SelectItem>
                        <SelectItem value="6m" className="rounded-lg">Last 6 months</SelectItem>
                        <SelectItem value="3m" className="rounded-lg">Last 3 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <ChartContainer config={perfTrendConfig} className="aspect-auto h-[220px] w-full">
                      <AreaChart
                        data={perfTrendFullData.slice(
                          perfTimeRange === "3m" ? 9 : perfTimeRange === "6m" ? 6 : 0
                        )}
                      >
                        <defs>
                          <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-score)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-score)" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="fillTarget" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-target)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-target)" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          minTickGap={32}
                          tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short" })}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={
                            <ChartTooltipContent
                              labelFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                              indicator="dot"
                            />
                          }
                        />
                        <Area dataKey="target" type="natural" fill="url(#fillTarget)" stroke="var(--color-target)" stackId="a" />
                        <Area dataKey="score"  type="natural" fill="url(#fillScore)"  stroke="var(--color-score)"  stackId="a" />
                        <ChartLegend content={<ChartLegendContent />} />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Skills Radar</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <RadarChart data={performanceData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <Radar name="Score" dataKey="A" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Goals & KPIs — interactive area chart */}
                <Card className="pt-0">
                  <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4 sm:flex-row">
                    <div className="grid flex-1 gap-1">
                      <CardTitle className="text-base font-semibold">Goals & KPIs</CardTitle>
                      <CardDescription>Q1 2026 — actual vs target for {selectedEmployee.name}</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => toast.success("Performance review submitted")}>Submit Review</Button>
                  </CardHeader>
                  <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <ChartContainer config={kpiChartConfig} className="aspect-auto h-[220px] w-full">
                      <BarChart
                        data={[
                          { name: "Sales", actual: 78, target: 100 },
                          { name: "Satisfaction", actual: 92, target: 95 },
                          { name: "Tickets", actual: 95, target: 100 },
                          { name: "Training", actual: 75, target: 100 },
                        ]}
                        margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                      >
                        <defs>
                          <linearGradient id="kpiActualGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-actual)" stopOpacity={1} />
                            <stop offset="100%" stopColor="var(--color-actual)" stopOpacity={0.6} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="target" fill="var(--color-target)" fillOpacity={0.35} radius={[6, 6, 0, 0]} barSize={22} />
                        <Bar dataKey="actual" fill="url(#kpiActualGrad)" radius={[6, 6, 0, 0]} barSize={22} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Department Performance — stacked area chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Department Performance Overview</CardTitle>
                    <CardDescription>Score trends across top departments — Jan to Jun</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={deptChartConfig} className="aspect-auto h-[220px] w-full">
                      <AreaChart data={deptTrendData} margin={{ left: 12, right: 12 }}>
                        <defs>
                          <linearGradient id="fillOps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-operations)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-operations)" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="fillTech" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-technology)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-technology)" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => v.slice(0, 3)} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <Area dataKey="technology" type="natural" fill="url(#fillTech)" stroke="var(--color-technology)" fillOpacity={0.4} stackId="a" />
                        <Area dataKey="operations" type="natural" fill="url(#fillOps)" stroke="var(--color-operations)" fillOpacity={0.4} stackId="a" />
                        <Area dataKey="sales" type="natural" fill="url(#fillSales)" stroke="var(--color-sales)" fillOpacity={0.4} stackId="a" />
                        <ChartLegend content={<ChartLegendContent />} />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Edit Employee Dialog */}
          <Dialog open={editEmployeeOpen} onOpenChange={setEditEmployeeOpen}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Edit Employee — {editingEmployee.name}</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Full Name</Label><Input defaultValue={editingEmployee.name} key={editingEmployee.id + "-name"} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" defaultValue={editingEmployee.email} key={editingEmployee.id + "-email"} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Phone</Label><Input defaultValue={editingEmployee.phone} key={editingEmployee.id + "-phone"} /></div>
                  <div className="space-y-2"><Label>Employee ID</Label><Input defaultValue={editingEmployee.id} readOnly className="opacity-60" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select defaultValue={editingEmployee.department} key={editingEmployee.id + "-dept"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Role / Title</Label><Input defaultValue={editingEmployee.role} key={editingEmployee.id + "-role"} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Annual Salary ($)</Label><Input type="number" defaultValue={editingEmployee.salary} key={editingEmployee.id + "-salary"} /></div>
                  <div className="space-y-2">
                    <Label>Employment Status</Label>
                    <Select defaultValue={editingEmployee.status} key={editingEmployee.id + "-status"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on-leave">On Leave</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Notes / Bio</Label><Textarea placeholder="Add notes about this employee..." rows={3} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditEmployeeOpen(false)}>Cancel</Button>
                <Button onClick={() => { toast.success(`${editingEmployee.name}'s profile updated`); setEditEmployeeOpen(false); }}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ─── PRODUCTS ──────────────────────────────────────────────────── */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-3 flex-1 w-full sm:w-auto">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." className="pl-9" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Product Name</Label><Input placeholder="e.g. Wireless Headphones" /></div>
                    <div className="space-y-2"><Label>SKU</Label><Input placeholder="e.g. WHP-001" /></div>
                  </div>
                  <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Product description..." rows={3} /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Price ($)</Label><Input type="number" placeholder="0.00" /></div>
                    <div className="space-y-2"><Label>Compare Price ($)</Label><Input type="number" placeholder="0.00" /></div>
                    <div className="space-y-2"><Label>Stock Quantity</Label><Input type="number" placeholder="0" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Product Images</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="mx-auto h-8 w-8 mb-2" />
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <Input placeholder="e.g. featured, sale, new-arrival (comma-separated)" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setProductDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => { toast.success("Product saved successfully"); setProductDialogOpen(false); }}>Save Product</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="text-2xl">{product.image || product.item_image || '📦'}</TableCell>
                      <TableCell className="font-medium">{product.name || product.item_name || 'N/A'}</TableCell>
                      <TableCell className="text-sm">{product.category || product.item_category || 'N/A'}</TableCell>
                      <TableCell className="font-medium">${(product.price || product.item_price || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-sm">{product.stock || product.item_stock || 'N/A'}</TableCell>
                      <TableCell><StatusBadge status={product.status || "active"} /></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Pencil className="mr-2 h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── CUSTOMERS ─────────────────────────────────────────────────── */}
        <TabsContent value="customers" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search customers..." className="pl-9" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {customer.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">{customer.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{customer.orders}</TableCell>
                      <TableCell className="font-medium">${customer.spent.toFixed(2)}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">192.168.1.{Math.floor(Math.random() * 254)}</TableCell>
                      <TableCell><StatusBadge status={customer.status} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{customer.joined}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Eye className="mr-2 h-3.5 w-3.5" /> View Profile</DropdownMenuItem>
                            <DropdownMenuItem><Mail className="mr-2 h-3.5 w-3.5" /> Send Email</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Ban className="mr-2 h-3.5 w-3.5" /> Block</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── COUPONS ───────────────────────────────────────────────────── */}
        <TabsContent value="coupons" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Create Coupon</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Coupon Code</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Coupon Code</Label>
                    <Input placeholder="e.g. SUMMER25" className="uppercase" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Discount Type</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                          <SelectItem value="shipping">Free Shipping</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Discount Value</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Min Order ($)</Label><Input type="number" placeholder="0" /></div>
                    <div className="space-y-2"><Label>Max Uses</Label><Input type="number" placeholder="Unlimited" /></div>
                  </div>
                  <div className="space-y-2"><Label>Expiration Date</Label><Input type="date" /></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCouponDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => { toast.success("Coupon created"); setCouponDialogOpen(false); }}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Min Order</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-bold bg-muted px-2 py-1 rounded">{coupon.code}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success(`Copied "${coupon.code}" to clipboard`); }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{coupon.discount}</TableCell>
                      <TableCell className="text-sm">${coupon.minOrder}</TableCell>
                      <TableCell>
                        <div className="space-y-1 w-28">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{coupon.used}</span>
                            <span>{coupon.maxUses}</span>
                          </div>
                          <Progress value={(coupon.used / coupon.maxUses) * 100} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={coupon.status === "active" ? "active" : "expired"} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{coupon.expires}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Pencil className="mr-2 h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── SETTINGS ──────────────────────────────────────────────────── */}
        <TabsContent value="settings">
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                  <CardDescription>Basic store details and configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Store Name</Label><Input defaultValue="ShopAdmin Store" /></div>
                    <div className="space-y-2"><Label>Store Email</Label><Input defaultValue="admin@shop.com" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Currency</Label><Input defaultValue="USD" /></div>
                    <div className="space-y-2"><Label>Timezone</Label><Input defaultValue="UTC-5 (EST)" /></div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium">Maintenance Mode</p><p className="text-xs text-muted-foreground">Temporarily disable storefront</p></div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium">Enable Reviews</p><p className="text-xs text-muted-foreground">Allow customers to leave product reviews</p></div>
                    <Switch defaultChecked />
                  </div>
                  <Button onClick={() => toast.success("Settings saved")}>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader><CardTitle>Payment Methods</CardTitle><CardDescription>Configure payment gateways</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Stripe</p><p className="text-xs text-muted-foreground">Accept credit/debit cards</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><p className="text-sm font-medium">PayPal</p><p className="text-xs text-muted-foreground">Accept PayPal payments</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Apple Pay</p><p className="text-xs text-muted-foreground">Accept Apple Pay</p></div><Switch /></div>
                  <Button onClick={() => toast.success("Payment settings saved")}>Save</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping">
              <Card>
                <CardHeader><CardTitle>Shipping Zones</CardTitle><CardDescription>Configure shipping rates by region</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Zone Name</Label><Input defaultValue="Domestic" /></div>
                    <div className="space-y-2"><Label>Flat Rate ($)</Label><Input type="number" defaultValue="5.99" /></div>
                    <div className="space-y-2"><Label>Free Above ($)</Label><Input type="number" defaultValue="75" /></div>
                  </div>
                  <Button onClick={() => toast.success("Shipping settings saved")}>Save</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader><CardTitle>Email Notifications</CardTitle><CardDescription>Configure automated emails</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Order Confirmation</p><p className="text-xs text-muted-foreground">Send after purchase</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Shipping Updates</p><p className="text-xs text-muted-foreground">Notify on status changes</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Low Stock Alerts</p><p className="text-xs text-muted-foreground">Alert when stock is below threshold</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Abandoned Cart</p><p className="text-xs text-muted-foreground">Remind customers about their cart</p></div><Switch /></div>
                  <Button onClick={() => toast.success("Notification settings saved")}>Save</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
