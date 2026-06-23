import { NextResponse } from 'next/server';
import { chromium } from 'playwright';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });

    const screenshotBuffer = await page.screenshot({ fullPage: true });
    const base64Image = screenshotBuffer.toString('base64');

    await browser.close();

    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${base64Image}`
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json({ error: 'Failed to capture screenshot' }, { status: 500 });
  }
}
