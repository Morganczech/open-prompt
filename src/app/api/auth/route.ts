
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { password } = body;

    // Simple check against env var, default to 'admin' if not set (for safety in dev)
    const validPassword = process.env.AUTH_PASSWORD || "admin";

    if (password === validPassword) {
        const response = NextResponse.json({ success: true });
        response.cookies.set("auth_token", "authenticated", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        });
        return response;
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
