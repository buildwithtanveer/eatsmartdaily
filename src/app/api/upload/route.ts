import { NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { getMaxUploadBytes, validateImageUpload } from "@/lib/upload";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role;

  if (!session || !["ADMIN", "EDITOR", "AUTHOR"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, "api_upload");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
    );
  }

  const data = await req.formData();
  const file = data.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const maxBytes = getMaxUploadBytes();
  if (!maxBytes) {
    return NextResponse.json({ error: "Upload not configured" }, { status: 500 });
  }

  const validation = validateImageUpload({ mimeType: file.type, sizeBytes: file.size, maxBytes });
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error, maxBytes },
      { status: validation.status },
    );
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Failed to read file" }, { status: 400 });
  }

  const fileName = `${uuidv4()}.webp`;
  const uploadDir = path.join(process.cwd(), "public/uploads");
  const outputPath = path.join(uploadDir, fileName);

  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  try {
    await sharp(buffer).resize(1200).webp({ quality: 80 }).toFile(outputPath);
  } catch {
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }

  return NextResponse.json({
    url: `/uploads/${fileName}`,
  });
}
