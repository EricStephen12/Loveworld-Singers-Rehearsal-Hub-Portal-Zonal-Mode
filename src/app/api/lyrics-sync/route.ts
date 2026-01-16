/**
 * Lyrics Sync API - Uses AssemblyAI to align existing lyrics with audio timing
 * 
 * This endpoint takes an audio URL and existing lyrics text,
 * then returns the lyrics with accurate timestamps for karaoke display
 */

import { NextRequest, NextResponse } from 'next/server';

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const ASSEMBLYAI_BASE_URL = 'https://api.assemblyai.com/v2';

interface LyricLine {
  time: number;      // Start time in seconds
  text: string;      // The lyric text
  duration?: number; // Duration of the line
  words?: {          // Individual word timestamps
    text: string;
    start: number;
    end: number;
    confidence: number;
  }[];
}

interface AssemblyAIWord {
  text: string;
  start: number;  // milliseconds
  end: number;    // milliseconds
  confidence: number;
}

interface AssemblyAITranscript {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text: string;
  words: AssemblyAIWord[];
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!ASSEMBLYAI_API_KEY) {
      return NextResponse.json(
        { error: 'AssemblyAI API key not configured. Add ASSEMBLYAI_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { audioUrl, songId, existingLyrics } = body;

    if (!audioUrl) {
      return NextResponse.json(
        { error: 'Audio URL is required' },
        { status: 400 }
      );
    }

    // Parse existing lyrics into words for word boosting
    const lyricsWords = existingLyrics 
      ? extractWordsFromLyrics(existingLyrics)
      : [];

        const submitResponse = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript`, {
      method: 'POST',
      headers: {
        'Authorization': ASSEMBLYAI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        // Word boost helps AssemblyAI recognize specific words from lyrics
        word_boost: lyricsWords.slice(0, 1000), // API limit
        boost_param: 'high', // Strong boost for lyrics words
        speech_model: 'best',
      }),
    });

    if (!submitResponse.ok) {
      const error = await submitResponse.text();
      console.error('[LyricsSync] Submit error:', error);
      return NextResponse.json(
        { error: 'Failed to submit transcription' },
        { status: 500 }
      );
    }

    const submitData = await submitResponse.json();
    const transcriptId = submitData.id;

        let transcript: AssemblyAITranscript | null = null;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5s intervals)

    while (attempts < maxAttempts) {
      const pollResponse = await fetch(
        `${ASSEMBLYAI_BASE_URL}/transcript/${transcriptId}`,
        {
          headers: {
            'Authorization': ASSEMBLYAI_API_KEY,
          },
        }
      );

      transcript = await pollResponse.json();

      if (transcript?.status === 'completed') {
        break;
      } else if (transcript?.status === 'error') {
        return NextResponse.json(
          { error: transcript.error || 'Transcription failed' },
          { status: 500 }
        );
      }

      // Wait 5 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    if (!transcript || transcript.status !== 'completed') {
      return NextResponse.json(
        { error: 'Transcription timed out' },
        { status: 504 }
      );
    }

        let lyrics: LyricLine[];
    
    if (existingLyrics && existingLyrics.trim()) {
      // Align existing lyrics with detected timestamps
      lyrics = alignLyricsWithTranscription(existingLyrics, transcript.words);
    } else {
      // No existing lyrics - just convert transcription to lines
      lyrics = convertToLyricLines(transcript.words);
    }

    return NextResponse.json({
      success: true,
      songId,
      lyrics,
      rawText: transcript.text,
      wordCount: transcript.words.length,
      aligned: !!(existingLyrics && existingLyrics.trim()),
    });

  } catch (error) {
    console.error('[LyricsSync] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Extract unique words from lyrics for word boosting
 */
function extractWordsFromLyrics(lyrics: string): string[] {
  // Clean HTML and extract words
  const cleanText = lyrics
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .toLowerCase();
  
  const words = cleanText.match(/\b[a-z']+\b/g) || [];
  
  // Return unique words
  return [...new Set(words)];
}

/**
 * Align existing lyrics lines with transcription word timestamps
 * This matches each lyric line to the audio timing
 */
function alignLyricsWithTranscription(
  existingLyrics: string,
  transcribedWords: AssemblyAIWord[]
): LyricLine[] {
  if (!transcribedWords || transcribedWords.length === 0) {
    // Fallback: return lyrics without timing
    return existingLyrics.split('\n')
      .filter(line => line.trim())
      .map((text, i) => ({ time: i * 5, text: text.trim() }));
  }

  // Clean and split lyrics into lines
  const cleanLyrics = existingLyrics
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/div>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ');
  
  const lyricLines = cleanLyrics
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lyricLines.length === 0) {
    return convertToLyricLines(transcribedWords);
  }

  // Build a map of transcribed words with their timestamps
  const wordTimestamps: { word: string; start: number; end: number }[] = 
    transcribedWords.map(w => ({
      word: w.text.toLowerCase().replace(/[^a-z']/g, ''),
      start: w.start / 1000,
      end: w.end / 1000,
    }));

  const alignedLyrics: LyricLine[] = [];
  let wordIndex = 0;

  for (const line of lyricLines) {
        const lineWords = line.toLowerCase().match(/\b[a-z']+\b/g) || [];
    
    if (lineWords.length === 0) {
      // Empty line or just punctuation - skip
      continue;
    }

    // Find the first word of this line in the transcription
    let lineStartTime: number | null = null;
    let lineEndTime: number | null = null;
    let matchedWords: typeof wordTimestamps = [];

    // Search for matching words starting from current position
    const searchStart = Math.max(0, wordIndex - 10); // Allow some backtrack
    const searchEnd = Math.min(wordTimestamps.length, wordIndex + lineWords.length + 20);

    for (let i = searchStart; i < searchEnd; i++) {
      const transcribedWord = wordTimestamps[i];
      
            if (lineWords.some(lw => isSimilarWord(lw, transcribedWord.word))) {
        if (lineStartTime === null) {
          lineStartTime = transcribedWord.start;
        }
        lineEndTime = transcribedWord.end;
        matchedWords.push(transcribedWord);
        
        // Move word index forward
        if (i >= wordIndex) {
          wordIndex = i + 1;
        }
      }
    }

    // If we found timing for this line
    if (lineStartTime !== null) {
      alignedLyrics.push({
        time: lineStartTime,
        text: line,
        duration: lineEndTime ? lineEndTime - lineStartTime : undefined,
        words: matchedWords.map(w => ({
          text: w.word,
          start: w.start,
          end: w.end,
          confidence: 1,
        })),
      });
    } else {
      // Couldn't find timing - estimate based on previous line
      const prevTime = alignedLyrics.length > 0 
        ? (alignedLyrics[alignedLyrics.length - 1].time + (alignedLyrics[alignedLyrics.length - 1].duration || 3))
        : 0;
      
      alignedLyrics.push({
        time: prevTime,
        text: line,
        duration: 3, // Default 3 seconds
      });
    }
  }

  return alignedLyrics;
}

/**
 * Check if two words are similar (handles minor transcription differences)
 */
function isSimilarWord(word1: string, word2: string): boolean {
  if (word1 === word2) return true;
  if (word1.length < 2 || word2.length < 2) return word1 === word2;
  
    if (word1.includes(word2) || word2.includes(word1)) return true;
  
  // Simple edit distance check for minor differences
  if (Math.abs(word1.length - word2.length) <= 2) {
    let matches = 0;
    const shorter = word1.length < word2.length ? word1 : word2;
    const longer = word1.length < word2.length ? word2 : word1;
    
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) matches++;
    }
    
    return matches >= shorter.length * 0.7;
  }
  
  return false;
}

/**
 * Convert AssemblyAI word timestamps to lyric lines (fallback)
 * Groups words into lines based on pauses and punctuation
 */
function convertToLyricLines(words: AssemblyAIWord[]): LyricLine[] {
  if (!words || words.length === 0) return [];

  const lines: LyricLine[] = [];
  let currentLine: AssemblyAIWord[] = [];
  let lineStartTime = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const nextWord = words[i + 1];

    if (currentLine.length === 0) {
      lineStartTime = word.start;
    }

    currentLine.push(word);

    // Determine if we should start a new line
    const shouldBreak = 
      // End of sentence punctuation
      /[.!?]$/.test(word.text) ||
      // Long pause (more than 1 second)
      (nextWord && (nextWord.start - word.end) > 1000) ||
      // Line is getting too long (8+ words)
      currentLine.length >= 8 ||
      // Comma with pause
      (/,$/.test(word.text) && nextWord && (nextWord.start - word.end) > 500);

    if (shouldBreak || i === words.length - 1) {
      const lineText = currentLine.map(w => w.text).join(' ');
      const lineEndTime = currentLine[currentLine.length - 1].end;

      lines.push({
        time: lineStartTime / 1000, // Convert to seconds
        text: lineText,
        duration: (lineEndTime - lineStartTime) / 1000,
        words: currentLine.map(w => ({
          text: w.text,
          start: w.start / 1000,
          end: w.end / 1000,
          confidence: w.confidence,
        })),
      });

      currentLine = [];
    }
  }

  return lines;
}

// GET endpoint to check transcription status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const transcriptId = searchParams.get('id');

  if (!transcriptId) {
    return NextResponse.json(
      { error: 'Transcript ID is required' },
      { status: 400 }
    );
  }

  if (!ASSEMBLYAI_API_KEY) {
    return NextResponse.json(
      { error: 'AssemblyAI API key not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${ASSEMBLYAI_BASE_URL}/transcript/${transcriptId}`,
      {
        headers: {
          'Authorization': ASSEMBLYAI_API_KEY,
        },
      }
    );

    const transcript = await response.json();

    if (transcript.status === 'completed') {
      const lyrics = convertToLyricLines(transcript.words);
      return NextResponse.json({
        status: 'completed',
        lyrics,
        rawText: transcript.text,
      });
    }

    return NextResponse.json({
      status: transcript.status,
      error: transcript.error,
    });

  } catch (error) {
    console.error('[LyricsSync] Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
