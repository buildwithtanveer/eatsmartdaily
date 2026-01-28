import { NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role;

  if (!session || !["ADMIN", "EDITOR", "AUTHOR"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.formData();
  const file = data.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate MIME type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
     return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const fileName = `${uuidv4()}.webp`;
  const uploadDir = path.join(process.cwd(), "public/uploads");
  const outputPath = path.join(uploadDir, fileName);

  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  await sharp(buffer).resize(1200).webp({ quality: 80 }).toFile(outputPath);

  return NextResponse.json({
    url: `/uploads/${fileName}`,
  });
}
