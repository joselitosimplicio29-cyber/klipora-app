import { NextResponse } from "next/server";
import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileKey = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET || "klipora-videos",
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
    });

    await r2.send(command);

    // Gera o link para você usar no seu portal de notícias
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileKey}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl 
    });

  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json({ error: "Erro ao subir para o R2" }, { status: 500 });
  }
}