import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = cookies();

    const nextAuthCookies = [
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.csrf-token",
      "__Secure-next-auth.csrf-token",
      "next-auth.callback-url",
      "__Secure-next-auth.callback-url",
    ];

    // Delete each cookie by setting maxAge to 0
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    nextAuthCookies.forEach((name) => {
      response.cookies.set(name, "", {
        maxAge: 0,
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    });

    return response;
  } catch (error) {
    console.error("[LOGOUT ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}