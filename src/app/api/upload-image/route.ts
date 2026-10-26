import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, filename, target, mimeType } = body || {};

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: imageBase64 string is required.',
        },
        { status: 400 }
      );
    }

    let detectedMime = mimeType || 'image/jpeg';
    let rawBase64 = imageBase64;

    // Extract mime type and raw base64 data if data URL is provided
    if (imageBase64.startsWith('data:')) {
      const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        detectedMime = match[1].toLowerCase();
        rawBase64 = match[2];
      } else {
        const svgMatch = imageBase64.match(/^data:image\/svg\+xml;utf8,(.+)$/i);
        if (svgMatch) {
          detectedMime = 'image/svg+xml';
        }
      }
    }

    // Allowed image and document MIME types
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
    ];

    if (!allowedMimes.includes(detectedMime)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported format (${detectedMime}). Only JPG, PNG, WEBP, GIF, SVG, and PDF are supported.`,
        },
        { status: 400 }
      );
    }

    // Calculate buffer size
    const bufferLength = Math.round((rawBase64.length * 3) / 4);
    const sizeKb = Math.round(bufferLength / 1024);

    if (sizeKb > 25 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: `Image size exceeds the 25MB server limit (${sizeKb} KB). Please upload a smaller image.`,
        },
        { status: 413 }
      );
    }

    // Sanitize provided filename
    const safeTarget = (target || 'product').replace(/[^a-zA-Z0-9_-]/g, '');
    let sanitizedName = (filename || `akuruhi_${safeTarget}_${Date.now()}`)
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 100);

    const ext =
      detectedMime === 'image/jpeg' || detectedMime === 'image/jpg'
        ? 'jpg'
        : detectedMime.split('/')[1]?.replace('+xml', '') || 'jpg';

    if (!sanitizedName.includes('.')) {
      sanitizedName = `${sanitizedName}.${ext}`;
    }

    // Ensure proper normalized data URL format
    const normalizedDataUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:${detectedMime};base64,${rawBase64}`;

    return NextResponse.json({
      success: true,
      url: normalizedDataUrl,
      filename: sanitizedName,
      sizeKb,
      mimeType: detectedMime,
      target: safeTarget,
      processedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Next.js API upload-image processing error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Server-side image processing failed.',
      },
      { status: 500 }
    );
  }
}
