import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL é obrigatória" }, { status: 400 });
    }

    console.log("Vídeo recebido:", url);

    return NextResponse.json({
      message: "Recebido com sucesso",
      status: "processing",
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}