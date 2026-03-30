import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.name.replace(/\s/g, '_')}`;
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        const path = join(uploadDir, filename);

        // create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        await writeFile(path, buffer);

        return NextResponse.json({ success: true, url: `/uploads/${filename}` });
    } catch (e: any) {
        console.error('Upload Error:', e);
        return NextResponse.json({ success: false, error: e.message || 'Error uploading file' }, { status: 500 });
    }
}
