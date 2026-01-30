import { getAuthSession } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../(auth)/auth/[...nextauth]/options';


export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { phoneNumber, streetAddress, city, state, pinCode, product_ids } = data;
        if(phoneNumber.length>10){
            return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 });       
        }

        if (!phoneNumber || !streetAddress || !city || !state || !pinCode) {
            return NextResponse.json(
                { success: false, error: 'All fields are required' },
                { status: 400 }
            );
        }
        
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'User session not found' },
                { status: 401 }
            );
        }

        // Handle both single product_id and multiple product_ids
        const productIdsArray = Array.isArray(product_ids) 
            ? product_ids 
            : [product_ids];

        if (!productIdsArray || productIdsArray.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Product IDs are required' },
                { status: 400 }
            );
        }

        // Create separate address for each product
        const addresses = [];
        const errors = [];

        for (const productId of productIdsArray) {
            try {
                // Check if address already exists for this product
                const existingAddress = await prisma.shippingAddress.findUnique({
                    where: { product_id: String(productId) }
                });

                if (existingAddress) {
                    // Update existing address instead of creating new one
                    const updatedAddress = await prisma.shippingAddress.update({
                        where: { product_id: String(productId) },
                        data: {
                            phoneNumber,
                            streetAddress,
                            city,
                            state,
                            pinCode,
                            userId: session.user.id,
                        },
                    });
                    addresses.push(updatedAddress);
                    console.log(`Updated existing address for product: ${productId}`);
                } else {
                    // Create new address
                    const newAddress = await prisma.shippingAddress.create({
                        data: {
                            phoneNumber,
                            streetAddress,
                            city,
                            state,
                            pinCode,
                            userId: session.user.id,
                            product_id: String(productId),
                        },
                    });
                    addresses.push(newAddress);
                    console.log(`Created new address for product: ${productId}`);
                }
            } catch (err: any) {
                console.error(`Error processing address for product ${productId}:`, err);
                errors.push({ productId, error: err.message });
            }
        }

        if (addresses.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Failed to save any addresses', details: errors },
                { status: 500 }
            );
        }

        console.log(`Processed ${addresses.length} shipping addresses successfully`);

        return NextResponse.json({ 
            success: true, 
            message: `${addresses.length} address(es) saved successfully`,
            data: addresses,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error: any) {
        console.error('Error saving address:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to save address', details: error.message },
            { status: 500 }
        );
    }
}