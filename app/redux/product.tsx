import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios from "axios";



export const user_delivery_update = createAsyncThunk(
    "product/user_delivery_update", async ({ orderId, product_delivery_status }: { orderId: string; product_delivery_status: string }) => {
        try {
            const response = await axios.post(`api/user_delivery_update/${orderId}`, { product_delivery_status }, {
                withCredentials: true,
            });
            if (response.status === 200) {
                return response.data;
            }
        } catch (error) {
            console.error("Error updating delivery status:", error);
            throw new Error("Failed to update delivery status");    
        }
    }
);


export const cancel_order_otp_send = createAsyncThunk(
    "api/cancel_order_otp_send", async (id: string) => {
        try {
            const response = await axios.post(`api/cancel_order_otp_send/${id}`, {}, {
                withCredentials: true,
            });
            if (response.status === 200) {
                // console.log(response.data);
                return response.data;
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
            throw new Error("Failed to send OTP");
        }
    }
);
export const cancel_order_verify_otp = createAsyncThunk(
    "api/cancel_order_verify_otp", async (otp: string, { rejectWithValue }) => {
        try {   
            const response = await axios.post(`api/cancel_order_verify_otp`, { cancel_order_otp: otp }, {
                withCredentials: true,
            });
            if (response.status === 200) {
                return response.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            console.error("Error verifying OTP:", error);
            return rejectWithValue({ success: false, message: "Failed to verify OTP" });
        }
    }
);


export const updateProduct = createAsyncThunk(
    "product/updateProduct", async ({ productId, data }: { productId: string; data: any }) => {
        try {
            const response = await axios.post(`api/updateProduct/${productId}`, data, {
                withCredentials: true,
            });
            if (response.status === 200) {
                return response.data;
            }
        } catch (error) {
            console.error("Error updating product:", error);
            throw new Error("Failed to update product");
        }
    }
);


export const createOrder = createAsyncThunk(
    "product/createOrder", async (orderDetails: any) => {
        try {
            const response = await axios.post('/api/payment', orderDetails, {
                withCredentials: true,
            });
            return response.data;
        } catch (error: any) {
            console.error("Error creating order:", error);
            throw new Error(error.response?.data?.error || "Failed to create order");
        }
    }
);

export const verifyPayment = createAsyncThunk(
    "product/verifyPayment", async (paymentData: any) => {
        try {
            const response = await axios.post('/api/verifypayment', paymentData, {
                withCredentials: true,
            });
            // console.log("Payment verification response:", response);            
            return response.data;
        } catch (error: any) {
            console.error("Error verifying payment:", error);
            throw new Error(error.response?.data?.error || "Failed to verify payment");
        }
    }
);

export const savePayment = createAsyncThunk(
    "product/savePayment", async (paymentDetails: any) => {
        try {
            const response = await axios.put('/api/savepayment', paymentDetails, {
                withCredentials: true,
            });
            return response.data;
        } catch (error: any) {
            console.error("Error saving payment:", error);
            throw new Error(error.response?.data?.error || "Failed to save payment");
        }
    }
);

export const createUserProduct = createAsyncThunk(
    "product/createUserProduct", async (productDetails: any) => {
        try {
            const response = await axios.post('/api/user-product', productDetails, {
                withCredentials: true,
            });
            return response.data;
        } catch (error: any) {
            console.error("Error creating user product:", error);
            throw new Error(error.response?.data?.error || "Failed to create user product");
        }
    }
);


export const users_with_prod_details = createAsyncThunk(
    "product/users_with_prod_details", async () => {
        try {
            const response = await axios.get("api/users_with_prod_details", {
                withCredentials: true,
            });
            // console.log("Response:", response);
            if (response.status === 200) {
                return response.data;
            }
        } catch (error) {
            console.error("Error fetching users with product details:", error);
            throw new Error("Failed to fetch users with product details");
        }
    }
);


export const update_order_address = createAsyncThunk(
    "product/update_order_address", async ({ orderId, address }: { orderId: string; address: string }) => {
        try {
            const response = await axios.post(`api/update_order_address/${orderId}`, { address }, {
                withCredentials: true,
            });
            if (response.status === 200) {
                return response.data;
            }
        } catch (error) {
            console.error("Error updating address:", error);
            throw new Error("Failed to update address");
        }
    }
);


export const update_product_address = createAsyncThunk(
    "product/update_product_address",
    async ({ shippingId, address }: { shippingId: string; address: { phoneNumber: string; streetAddress: string; city: string; state: string; pinCode: string } }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`api/update_product_address/${shippingId}`, address, {
                withCredentials: true,
            });
            if (response.status === 200) {
                return response.data;
            } else {
                // console.log("Response data:", response.data);
                return rejectWithValue(response.data);
                
            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                // console.log("Error response datsda:", error.response.data);
                return rejectWithValue(error.response.data.error);
            }
            console.error("Error updating address:", error);
            return rejectWithValue({ success: false, message: "Failed to update address" });
        }
    }
);


export const cancel_order = createAsyncThunk(
    "product/cancel_order", async (id: string) => {
        try {
            const response = await axios.post(`api/cancel_order/${id}`, {}, {
                withCredentials: true,
            });
            if (response.status === 200) {
                return response.data;
            }
        } catch (error) {
            console.error("Error cancelling order:", error);
            throw new Error("Failed to cancel order");
        }
    }
);


export const increase_cart_count = createAsyncThunk(
    "product/increase_cart_count", async (id: string) => {
        try {
            const response = await axios.post(`api/increase_cart_count/${id}`, {}, {
                withCredentials: true,
            });
            if (response.status === 200) {
                return response.data;
            }
        } catch (error) {
            console.error("Error adding product to cart:", error);
            throw new Error("Failed to add product to cart");
        }
    }
);

export const decrease_cart_count = createAsyncThunk(
    "product/decrease_cart_count", async (id: string) => {
        try {
            const response = await axios.post(`api/decrease_cart_count/${id}`, {
                withCredentials: true,
            });
            // console.log("Decrease cart count response:", response);
            if (response.status === 200) {
                return response.data;
            }
        } catch (error) {
            console.error("Error adding product to cart:", error);
            throw new Error("Failed to add product to cart");
        }
    }
);


export const addcart_data = createAsyncThunk(
    "product/addcart_data", async (id: string) => {
        try {
            const response = await axios.post(`api/add_cart/${id}`, {}, {
                withCredentials: true,
            });
            if (response.status === 200) {
                return response.data;
            }
        } catch (error) {
            console.error("Error adding product to cart:", error);
            throw new Error("Failed to add product to cart");
        }
    }
);

export const removecart_data = createAsyncThunk(
    "product/removecart_data", async (id: string) => {
        try {
            const response = await axios.post(`api/remove_cart/${id}`, {}, {
                withCredentials: true,
            });
            if (response.status === 200) {
                return response.data;
            }
        } catch (error) {
            console.error("Error removing product from cart:", error);
            throw new Error("Failed to remove product from cart");
        }
    }
);



export const getproduct_data  = createAsyncThunk(
    "product/getproduct_data",async()=>{
        try {
            const response = await axios.get("api/products",{
                withCredentials: true,
            });
             if(response.status === 200){
                return response.data;
            } 
            
        } catch (error) {
            console.error("Error fetching product data:", error);
            throw new Error("Failed to fetch product data");
            
        }
    }
);
const product = createAsyncThunk(
    "product/product", async (id) => {
        try {
            const response = await axios.get(`api/product/${id}`, {
                withCredentials: true,
            });
            if (response.status === 200) {
                return response.data;
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            throw new Error("Failed to fetch product");
        }
    })

const buy_data = createAsyncThunk(
    "product/buy_data", async (pid: string) => {
        try {
            const response = await axios.get(`api/buy_data/${pid}`, {          
                withCredentials: true,
            }); 
            if (response.status === 200) {  
                return response.data;
            }
        }
     catch(error){
        console.error("Error fetching buy data:", error);
        throw new Error("Failed to fetch buy data");
       }
    } 
)

export const get_product_address = createAsyncThunk(
  "product/get_product_address",
  async (shippingId: string) => {
    try {
      const response = await axios.get(`api/update_product_address/${shippingId}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching product address:", error);
      throw new Error("Failed to fetch product address");
    }
  }
);

// Admin API Thunks
export const get_admin_dashboard_data = createAsyncThunk(
  "product/get_admin_dashboard_data",
  async () => {
    try {
      const response = await axios.get(`/api/user_data`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
      throw new Error("Failed to fetch admin dashboard data");
    }
  }
);

export const get_employees_list = createAsyncThunk(
  "product/get_employees_list",
  async () => {
    try {
      const response = await axios.get(`/api/employee`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        // console.log("Employees List:", response.data);
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw new Error("Failed to fetch employees");
    }
  }
);

export const get_all_products_admin = createAsyncThunk(
  "product/get_all_products_admin",
  async () => {
    try {
      const response = await axios.get(`/api/product`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching admin products:", error);
      throw new Error("Failed to fetch admin products");
    }
  }
);

export const update_user_role = createAsyncThunk(
  "product/update_user_role",
  async ({ userId, updateData }: { userId: string; updateData: any }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/admin/update_role/update_role/${userId}`, updateData, {
        withCredentials: true,
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error: any) {
      console.error("Error updating user role:", error);
      return rejectWithValue(error.response?.data || { message: "Failed to update user role" });
    }
  }
);

const productSlice = createSlice({
    name: "product",
    initialState: {
        productData: [],
        loading: false,
        error: null as string | null,
        cartdata: [],
        productId: null as string | null,
        successmessage: null as string | null,
        buyData: null as { message: string; buy_data: any } | null,
        addressesById: {} as Record<string, { id: string; phoneNumber: string; streetAddress: string; city: string; state: string; pinCode: string }>,
        // Admin data
        adminDashboardData: null as any,
        employeesList: [] as any[],
        adminProducts: [] as any[],
        adminLoading: false,
        adminError: null as string | null,
    },

    reducers: {
        setProductId: (state, action) => {
            state.productId = action.payload;
        }
        
    },
    extraReducers: (builder) => {
        builder
            .addCase(getproduct_data.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getproduct_data.fulfilled, (state, action) => {
                state.loading = false;
                state.productData = action.payload;
            })
            .addCase(getproduct_data.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to fetch product data";
            })



            .addCase(product.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(product.fulfilled, (state, action) => {
                state.loading = false;
                state.productData = action.payload.product;
            })
            .addCase(product.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to fetch product";
            } )
            
            
            .addCase(addcart_data.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addcart_data.fulfilled, (state, action) => {
                state.loading = false;
                state.cartdata = action.payload;
            })  
            .addCase(addcart_data.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to add product to cart";
            })

            .addCase(removecart_data.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removecart_data.fulfilled, (state, action) => {
                state.loading = false;
                state.cartdata = action.payload;
            })
            .addCase(removecart_data.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to remove product from cart";
            })

            .addCase(increase_cart_count.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(increase_cart_count.fulfilled, (state, action) => {
                state.loading = false;
                state.cartdata = action.payload;
            })
            .addCase(increase_cart_count.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to increase cart count";
            })

            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.successmessage = action.payload.message;
                // Optionally update productData if the payload contains the updated product
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to update product";
            })

            .addCase(update_order_address.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(update_order_address.fulfilled, (state, action) => {
                state.loading = false;
                state.cartdata = action.payload;
            })
            .addCase(update_order_address.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload && (action.payload as any).message ? (action.payload as any).message : action.error.message ?? "Failed to update order address";       
                
            })

            .addCase(update_product_address.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(update_product_address.fulfilled, (state, action) => {
                state.loading = false;
                state.successmessage = action.payload.message;
                // cache updated address per shippingId to avoid applying to all cards
                const updated = action.payload?.data;
                if (updated?.id) {
                  state.addressesById[updated.id] = updated;
                }
            })
            .addCase(update_product_address.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to update product address";
            })

            .addCase(get_product_address.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(get_product_address.fulfilled, (state, action) => {
                state.loading = false;
                const addr = action.payload?.data;
                if (addr?.id) {
                  state.addressesById[addr.id] = addr;
                }
            })
            .addCase(get_product_address.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to fetch product address";
            })


            .addCase(users_with_prod_details.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(users_with_prod_details.fulfilled, (state, action) => {
                state.loading = false;
                state.cartdata = action.payload;
            })
            .addCase(users_with_prod_details.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to fetch users with product details";
            })


            .addCase(cancel_order_otp_send.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancel_order_otp_send.fulfilled, (state, action) => {
                state.loading = false;
                state.successmessage = action.payload;
            })
            .addCase(cancel_order_otp_send.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload && (action.payload as any).message) || action.error.message || "Failed to send cancel order OTP";
            })
            .addCase(cancel_order_verify_otp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancel_order_verify_otp.fulfilled, (state, action) => {
                state.loading = false;  
                state.successmessage = action.payload;
            })
            .addCase(cancel_order_verify_otp.rejected, (state, action) => {
                state.loading = false;  
                state.error = (action.payload && (action.payload as any).message) || action.error.message || "Failed to verify cancel order OTP";
            })

            .addCase(buy_data.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(buy_data.fulfilled, (state, action) => {
                state.loading = false;
                state.buyData = action.payload;
            })
            .addCase(buy_data.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to fetch buy data";
            })

            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                // state is not modified, component will use the returned data
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to create order";
            })

            .addCase(verifyPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyPayment.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(verifyPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to verify payment";
            })

            .addCase(savePayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(savePayment.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(savePayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to save payment";
            })

            .addCase(createUserProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUserProduct.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(createUserProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to create user product";
            })

            // Admin Dashboard Data
            .addCase(get_admin_dashboard_data.pending, (state) => {
                state.adminLoading = true;
                state.adminError = null;
            })
            .addCase(get_admin_dashboard_data.fulfilled, (state, action) => {
                state.adminLoading = false;
                state.adminDashboardData = action.payload;
            })
            .addCase(get_admin_dashboard_data.rejected, (state, action) => {
                state.adminLoading = false;
                state.adminError = action.error.message ?? "Failed to fetch admin dashboard data";
            })

            // Employees List
            .addCase(get_employees_list.pending, (state) => {
                state.adminLoading = true;
                state.adminError = null;
            })
            .addCase(get_employees_list.fulfilled, (state, action) => {
                state.adminLoading = false;
                state.employeesList = action.payload;
            })
            .addCase(get_employees_list.rejected, (state, action) => {
                state.adminLoading = false;
                state.adminError = action.error.message ?? "Failed to fetch employees";
            })

            // Admin Products
            .addCase(get_all_products_admin.pending, (state) => {
                state.adminLoading = true;
                state.adminError = null;
            })
            .addCase(get_all_products_admin.fulfilled, (state, action) => {
                state.adminLoading = false;
                state.adminProducts = action.payload;
            })
            .addCase(get_all_products_admin.rejected, (state, action) => {
                state.adminLoading = false;
                state.adminError = action.error.message ?? "Failed to fetch admin products";
            })

            // Update User Role
            .addCase(update_user_role.pending, (state) => {
                state.adminLoading = true;
                state.adminError = null;
            })
            .addCase(update_user_role.fulfilled, (state, action) => {
                state.adminLoading = false;
            })
            .addCase(update_user_role.rejected, (state, action) => {
                state.adminLoading = false;
                state.adminError = (action.payload as any)?.message ?? "Failed to update user role";
            })
    },

})

export const productActions = productSlice.actions;
export { product, buy_data };
export const { setProductId } = productActions;
export default productSlice.reducer;
