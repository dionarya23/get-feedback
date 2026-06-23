import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: 'get_feedback',
    });

    const slug = nanoid(8);

    await prisma.feedback.create({
      data: {
        slug,
        imageUrl: uploadResponse.secure_url,
      },
    });

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('Share API error:', error);
    return NextResponse.json({ error: 'Failed to share image' }, { status: 500 });
  }
}
