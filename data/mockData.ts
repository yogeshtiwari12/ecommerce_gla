// Revenue / chart data
export const revenueData = [
  { month: "Jan", revenue: 28000, profit: 9000, orders: 320 },
  { month: "Feb", revenue: 32000, profit: 11000, orders: 370 },
  { month: "Mar", revenue: 27000, profit: 8500, orders: 295 },
  { month: "Apr", revenue: 35000, profit: 13000, orders: 410 },
  { month: "May", revenue: 40000, profit: 15000, orders: 460 },
  { month: "Jun", revenue: 38000, profit: 14000, orders: 440 },
  { month: "Jul", revenue: 42000, profit: 16000, orders: 490 },
  { month: "Aug", revenue: 45000, profit: 17500, orders: 520 },
  { month: "Sep", revenue: 39000, profit: 14500, orders: 455 },
  { month: "Oct", revenue: 47000, profit: 18000, orders: 545 },
  { month: "Nov", revenue: 52000, profit: 21000, orders: 610 },
  { month: "Dec", revenue: 58000, profit: 24000, orders: 680 },
];

// Category breakdown
export const categoryData = [
  { name: "Electronics", value: 35, fill: "hsl(var(--chart-1))" },
  { name: "Clothing", value: 25, fill: "hsl(var(--chart-2))" },
  { name: "Home & Garden", value: 20, fill: "hsl(var(--chart-3))" },
  { name: "Sports", value: 12, fill: "hsl(var(--chart-4))" },
  { name: "Books", value: 8, fill: "hsl(var(--chart-5))" },
];

// Traffic sources
export const trafficData = [
  { source: "Organic", visitors: 42000 },
  { source: "Direct", visitors: 28000 },
  { source: "Social", visitors: 22000 },
  { source: "Email", visitors: 15000 },
  { source: "Referral", visitors: 10000 },
  { source: "Paid Ads", visitors: 8000 },
];

// Orders
export const orders = [
  { id: "#ORD-001", customer: "Alice Johnson", email: "alice@example.com", items: 3, total: 149.99, payment: "Credit Card", status: "delivered" as const, date: "Jan 15, 2025" },
  { id: "#ORD-002", customer: "Bob Smith", email: "bob@example.com", items: 1, total: 59.99, payment: "PayPal", status: "shipped" as const, date: "Jan 16, 2025" },
  { id: "#ORD-003", customer: "Carol White", email: "carol@example.com", items: 5, total: 299.50, payment: "Credit Card", status: "processing" as const, date: "Jan 17, 2025" },
  { id: "#ORD-004", customer: "David Brown", email: "david@example.com", items: 2, total: 89.00, payment: "Apple Pay", status: "pending" as const, date: "Jan 18, 2025" },
  { id: "#ORD-005", customer: "Eve Davis", email: "eve@example.com", items: 4, total: 219.95, payment: "PayPal", status: "cancelled" as const, date: "Jan 19, 2025" },
  { id: "#ORD-006", customer: "Frank Miller", email: "frank@example.com", items: 2, total: 120.00, payment: "Credit Card", status: "delivered" as const, date: "Jan 20, 2025" },
  { id: "#ORD-007", customer: "Grace Wilson", email: "grace@example.com", items: 1, total: 45.00, payment: "PayPal", status: "shipped" as const, date: "Jan 21, 2025" },
  { id: "#ORD-008", customer: "Henry Moore", email: "henry@example.com", items: 6, total: 380.00, payment: "Credit Card", status: "processing" as const, date: "Jan 22, 2025" },
];

// Customers
export const customers = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", orders: 12, spent: 1420.50, status: "active" as const, joined: "Mar 2023" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", orders: 5, spent: 340.00, status: "active" as const, joined: "Jul 2023" },
  { id: 3, name: "Carol White", email: "carol@example.com", orders: 28, spent: 3810.75, status: "active" as const, joined: "Jan 2022" },
  { id: 4, name: "David Brown", email: "david@example.com", orders: 2, spent: 89.00, status: "inactive" as const, joined: "Nov 2023" },
  { id: 5, name: "Eve Davis", email: "eve@example.com", orders: 19, spent: 2100.20, status: "active" as const, joined: "Apr 2022" },
  { id: 6, name: "Frank Miller", email: "frank@example.com", orders: 7, spent: 620.00, status: "active" as const, joined: "Sep 2023" },
  { id: 7, name: "Grace Wilson", email: "grace@example.com", orders: 0, spent: 0, status: "inactive" as const, joined: "Dec 2023" },
  { id: 8, name: "Henry Moore", email: "henry@example.com", orders: 34, spent: 4950.00, status: "active" as const, joined: "Feb 2022" },
];

// Products
export const products = [
  { id: 1, name: "Wireless Headphones", sku: "WHP-001", category: "Electronics", price: 79.99, stock: 142, rating: 4.5, status: "active" as const, image: "🎧" },
  { id: 2, name: "Running Shoes", sku: "RS-042", category: "Sports", price: 119.99, stock: 58, rating: 4.3, status: "active" as const, image: "👟" },
  { id: 3, name: "Linen Shirt", sku: "LS-018", category: "Clothing", price: 34.99, stock: 210, rating: 4.1, status: "active" as const, image: "👕" },
  { id: 4, name: "Smart Watch", sku: "SW-007", category: "Electronics", price: 199.99, stock: 30, rating: 4.7, status: "active" as const, image: "⌚" },
  { id: 5, name: "Garden Hose", sku: "GH-033", category: "Home & Garden", price: 24.99, stock: 85, rating: 3.9, status: "active" as const, image: "🌿" },
  { id: 6, name: "Novel: The Journey", sku: "BK-112", category: "Books", price: 14.99, stock: 320, rating: 4.8, status: "active" as const, image: "📚" },
  { id: 7, name: "Yoga Mat", sku: "YM-009", category: "Sports", price: 29.99, stock: 0, rating: 4.4, status: "draft" as const, image: "🧘" },
  { id: 8, name: "Desk Lamp", sku: "DL-055", category: "Home & Garden", price: 49.99, stock: 67, rating: 4.2, status: "active" as const, image: "💡" },
];

// Coupons
export const coupons = [
  { id: 1, code: "SUMMER25", discount: "25% off", minOrder: 50, used: 142, maxUses: 500, status: "active" as const, expires: "Aug 31, 2025" },
  { id: 2, code: "WELCOME10", discount: "$10 off", minOrder: 30, used: 890, maxUses: 1000, status: "active" as const, expires: "Dec 31, 2025" },
  { id: 3, code: "FLASH50", discount: "50% off", minOrder: 100, used: 200, maxUses: 200, status: "expired" as const, expires: "Jan 15, 2025" },
  { id: 4, code: "FREESHIP", discount: "Free Ship", minOrder: 0, used: 320, maxUses: 750, status: "active" as const, expires: "Jun 30, 2025" },
  { id: 5, code: "SAVE15", discount: "15% off", minOrder: 40, used: 55, maxUses: 300, status: "active" as const, expires: "Mar 31, 2025" },
];
