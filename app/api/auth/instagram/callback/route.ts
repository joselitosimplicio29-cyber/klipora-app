import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/app?error=auth_failed", req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/app?error=no_code", req.url));
  }

  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://klipora-app-production.up.railway.app'}/api/auth/instagram/callback`;

  try {
    // 1. Trocar o código por um access_token de curta duração
    const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`);
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("Erro ao obter token:", tokenData);
      return NextResponse.redirect(new URL("/app?error=token_failed", req.url));
    }

    // 2. Trocar por um token de longa duração (60 dias)
    const longTokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${tokenData.access_token}`);
    const longTokenData = await longTokenRes.json();

    const finalToken = longTokenData.access_token || tokenData.access_token;

    // Salvar no cookie (Seguro, HttpOnly)
    const cookieStore = await cookies();
    cookieStore.set("ig_access_token", finalToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 60, // 60 dias
      path: "/",
    });

    return NextResponse.redirect(new URL("/app?success=ig_connected", req.url));
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(new URL("/app?error=server_error", req.url));
  }
}
