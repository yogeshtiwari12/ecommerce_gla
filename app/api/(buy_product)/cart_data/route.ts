// import { getServerSession } from "next-auth/next";

// import { authOptions } from "../../(auth)/auth/[...nextauth]/options";


// export async function GET(request: Request) {
  
  
//   try{
//   await connectDb();
//   const iSsessionActive = await getServerSession(authOptions);
//   if (!iSsessionActive) {
//     return Response.json({
//       message: "Authentication required",
//       success: false,
//       status: 401,
//     });
//   }
//   console.log("Session Active:", iSsessionActive.user._id);
//   const data = await ProductModel.find({
//     $and: [
//       { userid: iSsessionActive?.user?._id },
//       { cartItem: true }
//     ]
//   });

  
//   if(!data){
//     return Response.json(
//       { message: "No products found for this user", success: false },
//       { status: 404 }
//     );
//   }
//   return Response.json(
//     { message: "Products retrieved successfully", success: true, products: data },
//     { status: 200 }
//   );
// }
// catch (error) {
//   console.error("Error retrieving products:", error);
//   return Response.json(
//     { message: "Failed to retrieve products", error: (error as Error).message, success: false },
//     { status: 500 }
//   );
// }
// }