"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { useRouter } from "next/navigation";

import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Package, ShoppingCart, Heart, Star, Eye, Zap, Search, SlidersHorizontal, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { addcart_data, getproduct_data, product } from "../redux/product";
import { AppDispatch } from '../redux/store';
import { toast } from "sonner";
import { NumberTicker } from "./NumberTicker";

console.log("Product component loaded");

function ProductPage() {
  const [data, setdata] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All Prices");
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // console.log("Selected Price Range:", data);

  const categories = ["All", "Electronics", "Wearables", "Bags", "Fashion", "Home & Living", "Clothing"];
  const priceRanges = ["All Prices", "Under $1000", "$1000 - $2000", "$2000 - $3000", "Above $3000"];
  // console.log("Selected Category:", selectedCategory);

  const addcart = async (productId: string) => {
    try {
      let resultAction = await dispatch(addcart_data(productId));
      // console.log("Add to cart result:", resultAction.payload.success);
      if (resultAction.payload.success) {
        toast.success(resultAction.payload.message);
      } else {
        toast.error(resultAction.payload.message);
      }
    } catch (error:string | any ) {
      toast.error(error.payload.message || "Failed to add product to cart");
      console.error("Failed to add product to cart:", error);
    }
  };

  // console.log("Product data:", data)
  const handleBuyNow = (productId: string) => {
    
    router.push(`/buy?pid=${productId}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await dispatch(getproduct_data());
        const response = unwrapResult(result);
        if (response.success && response.data) {
          setdata(response.data);
        } else {
          setError("API response doesn't contain data");
          // console.error("API response doesn't contain data:", response);
        }
      } catch (error) {
        setError("Failed to fetch data");
        // console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  const getCategoryGradient = (category: string) => {
    const gradients: Record<string, string> = {
      Electronics: "from-blue-400 via-cyan-300 to-teal-300",
      Wearables: "from-indigo-400 via-purple-300 to-pink-300",
      Bags: "from-amber-400 via-orange-300 to-yellow-300",
      Fashion: "from-rose-400 via-pink-300 to-fuchsia-300",
      "Home & Living": "from-emerald-400 via-green-300 to-lime-300",
      Clothing: "from-orange-400 via-amber-300 to-yellow-300",
    };
    return gradients[category] || "from-gray-400 via-gray-300 to-slate-300";
  };

  // console.log("Data before filtering:", data)
  const filteredData = data.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      (product.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || // Ensure `name` is a string
      (product.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()); // Ensure `title` is a string

    let matchesPrice = true;
    if (selectedPrice === "Under $1000") matchesPrice = product.price < 1000;
    else if (selectedPrice === "$1000 - $2000") matchesPrice = product.price >= 1000 && product.price < 2000;
    else if (selectedPrice === "$2000 - $3000") matchesPrice = product.price >= 2000 && product.price < 3000;
    else if (selectedPrice === "Above $3000") matchesPrice = product.price >= 3000;

    return matchesCategory && matchesPrice && matchesSearch;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center p-4">
        <Alert className="max-w-md bg-red-950/80 border-red-800 backdrop-blur-xl shadow-2xl">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200">
            {error}. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white pt-24 border-b border-gray-200">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="flex items-center justify-center mb-6 animate-fade-in">
            <span className="text-blue-600 text-sm font-semibold flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
              <Zap className="w-4 h-4" />
              New Collection 2026
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-center mb-6 text-gray-900 animate-fade-in-up">
            Discover <span className="text-blue-600">Premium</span><br />Products
          </h1>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10 text-lg leading-relaxed animate-fade-in-up delay-200">
            Curated selection of high-quality products designed for modern living.<br />
            <span className="text-blue-600 font-medium">Experience luxury at exceptional value.</span>
          </p>
          <div className="flex items-center justify-center gap-4 animate-fade-in-up delay-300">
            <button className="group bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-lg transition-all duration-300 flex items-center gap-2 hover:scale-105 shadow-md">
              Shop Now
              {/* <span className="group-hover:translate-x-1` transition-transform">→</span> */}
            </button>
            <button className="bg-white border-2 border-gray-300 hover:border-blue-500 hover:bg-gray-50 text-gray-900 font-bold px-10 py-4 rounded-lg transition-all duration-300 hover:scale-105">
              View Collection
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-20 animate-fade-in-up delay-500">
            <div className="text-center group cursor-pointer">
              <div className="text-5xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                <NumberTicker 
                  value={data.length} 
                  className="text-5xl font-bold text-blue-600"
                />+
              </div>
              <div className="text-gray-600 text-sm font-medium">Premium Products</div>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="text-5xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                <NumberTicker 
                  value={50000} 
                  className="text-5xl font-bold text-blue-600"
                />+
              </div>
              <div className="text-gray-600 text-sm font-medium">Happy Customers</div>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="text-5xl font-bold flex items-center justify-center gap-1 mb-2 group-hover:scale-110 transition-transform">
                <NumberTicker 
                  value={4.9} 
                  decimalPlaces={1}
                  className="text-blue-600"
                />
                {/* <Star className="w-7 h-7 fill-blue-500 text-blue-500" /> */}
              </div>
              <div className="text-gray-600 text-sm font-medium">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="w-full bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-bold mb-2 text-gray-900 tracking-tight">
              Featured <span className="text-blue-600">Products</span>
            </h2>
            <p className="text-gray-600 text-xl">
              Discover our handpicked selection of premium products
            </p>
          </div>

          <div className="mb-16 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border-2 border-gray-300 rounded-lg pl-14 pr-5 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
              <button className="flex items-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-6 py-3 hover:border-blue-500 hover:bg-gray-50 transition-all whitespace-nowrap group">
                <SlidersHorizontal className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300 text-gray-700" />
                <span className="font-semibold text-gray-700">Price: Low to High</span>
              </button>
              {(searchQuery || selectedCategory !== "All" || selectedPrice !== "All Prices") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setSelectedPrice("All Prices");
                  }}
                  className="flex items-center gap-3 bg-red-50 border-2 border-red-200 rounded-lg px-7 py-4 hover:bg-red-100 hover:border-red-300 transition-all whitespace-nowrap group"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform text-red-600" />
                  <span className="font-semibold text-red-600">Clear Filters</span>
                </button>
              )}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-7 py-2 rounded-lg font-semibold transition-all duration-300 border-2 ${selectedCategory === category
                      ? "bg-blue-600 text-white border-blue-600 scale-105"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-300 hover:scale-105"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Price Filters */}
            <div className="flex flex-wrap gap-3">
              {priceRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedPrice(range)}
                  className={`px-7 py-2 rounded-lg font-semibold transition-all duration-300 border-2 ${selectedPrice === range
                      ? "bg-blue-600 text-white border-blue-600 scale-105"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-300 hover:scale-105"
                    }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                  <Skeleton className="h-64 w-full bg-gray-200" />
                  <div className="p-7 space-y-4">
                    <Skeleton className="h-4 w-3/4 bg-gray-200" />
                    <Skeleton className="h-6 w-1/2 bg-gray-200" />
                    <Skeleton className="h-10 w-full bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
              {filteredData.map((product: any, index: number) => (
                <div
                  key={product.id || index}
                  className="group bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl border-2 border-gray-200 hover:border-blue-300 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Product Image */}
                  <div className={`relative h-48 overflow-hidden bg-gray-100 flex items-center justify-center`}>
                    {product.imageUrl ? (
                      <img
                        src={typeof product.imageUrl === 'string' ? product.imageUrl : product.imageUrl.url || 'https://via.placeholder.com/400'}
                        alt={product.name || 'Product'}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <Package className="w-20 h-20 text-gray-400" />
                    )}

                    {/* Discount Badge */}
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-red-500 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-7 bg-white">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 
                        className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 min-h-[3.5rem] leading-tight"
                        title={product.name || product.title || 'Premium Product'}
                      >
                        {product.name || product.title || 'Premium Product'}
                      </h3>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-2xl font-bold text-green-600 whitespace-nowrap">
                          ${product.price || '0'}
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="text-xs text-gray-500 line-through mt-1">
                            ${product.originalPrice}
                          </div>
                        )}
                      </div>
                    </div>

                    <p 
                      className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed min-h-[2.5rem]"
                      title={product.description || 'Premium quality product with excellent features'}
                    >
                      {product.description || 'Premium quality product with excellent features'}
                    </p>

                    {(product.rating || product.brand) && (
                      <div className="flex items-center justify-between mb-5 bg-blue-50 rounded-lg p-3 border border-blue-100">
                        {product.brand && (
                          <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                            {product.brand}
                          </span>
                        )}
                        {product.rating && (
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 fill-blue-500 text-blue-500" />
                            <span className="text-sm text-gray-700 font-medium">{product.rating}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3">
                      {product.stock === 0 ? (
                        <button
                          disabled
                          className="flex-1 py-4 rounded-lg font-bold text-sm bg-gray-100 text-gray-500 cursor-not-allowed border-2 border-gray-200"
                        >
                          Out of Stock
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => addcart(product.id)}
                            className="flex-1 py-2 rounded-lg font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 transition-all duration-300 flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-blue-400 hover:scale-105"
                          >
                            Add Cart
                          </button>
                          <button
                            className="flex-1 py-3 rounded-lg font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 shadow-md"
                            onClick={() => handleBuyNow(product.id)}
                          >
                            Buy
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="p-12 rounded-3xl bg-gray-100 border-2 border-gray-200 mb-8 shadow-lg">
                <Package className="w-24 h-24 text-gray-400" />
              </div>
              <h3 className="text-4xl font-bold mb-4 text-gray-900">No products found</h3>
              <p className="text-gray-600 text-center max-w-md mb-8 leading-relaxed text-lg">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedPrice("All Prices");
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-md"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-2xl">S</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">Shopify</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Curated selection of premium products for modern living. Quality guaranteed.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:scale-110 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:scale-110 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:scale-110 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.061-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" /></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-5 text-gray-900 text-lg">Quick Links</h4>
              <ul className="space-y-3.5 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block">Home</a></li>
                <li><a href="#" className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block">Products</a></li>
                <li><a href="#" className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block">Categories</a></li>
                <li><a href="#" className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block">Deals</a></li>
                <li><a href="#" className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block">About Us</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold mb-5 text-gray-900 text-lg">Support</h4>
              <ul className="space-y-3.5 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block">FAQs</a></li>
                <li><a href="#" className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block">Shipping Info</a></li>
                <li><a href="#" className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block">Returns</a></li>
                <li><a href="#" className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block">Track Order</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-bold mb-5 text-gray-900 text-lg">Newsletter</h4>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">Subscribe to get special offers and updates.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-lg transition-all hover:scale-105">
                  ←
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © 2024 Shopify. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Add animations CSS */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

        .delay-300 {
          animation-delay: 300ms;
        }

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}

export default ProductPage;
