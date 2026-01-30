


import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const signoutUrl = new URL('/api/auth/signout', request.url);
    signoutUrl.searchParams.set('callbackUrl', '/login');
    
    return NextResponse.redirect(signoutUrl);
}