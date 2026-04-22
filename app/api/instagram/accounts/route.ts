import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ig_access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    // Busca as páginas que o usuário gerencia e a conta do IG associada
    const res = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name,instagram_business_account{id,username,profile_picture_url}&access_token=${token}`);
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    // Filtra apenas páginas que têm uma conta do Instagram
    const igAccounts = data.data
      .filter((page: any) => page.instagram_business_account)
      .map((page: any) => ({
        pageId: page.id,
        pageName: page.name,
        igId: page.instagram_business_account.id,
        igUsername: page.instagram_business_account.username,
        igPicture: page.instagram_business_account.profile_picture_url,
      }));

    return NextResponse.json({ accounts: igAccounts });
  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
