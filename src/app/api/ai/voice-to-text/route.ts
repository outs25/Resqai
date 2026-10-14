import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/services/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const audioData = body.audio || '';

    const transcript = await aiService.transcribeVoiceAudio(audioData);

    return NextResponse.json({
      success: true,
      transcript,
    });
  } catch (error: any) {
    console.error('Voice-to-text error:', error);
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
  }
}
