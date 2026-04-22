import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://klipora-app-production.up.railway.app'}/api/auth/instagram/callback`;

  if (!clientId) {
    return NextResponse.json({ error: "INSTAGRAM_CLIENT_ID não configurado" }, { status: 500 });
  }

  // URLs de OAuth do Facebook para Instagram Graph API
  const scope = "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement";
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&display=page&extras={"setup":{"channel":"IG_API"}}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(authUrl);
}
