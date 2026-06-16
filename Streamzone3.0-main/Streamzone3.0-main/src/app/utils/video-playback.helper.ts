import { DEMO_VIDEO_URL } from '../config/local-playback.config';

export type PlaybackMode = 'video' | 'iframe';

export interface ResolvedPlayback {
  mode: PlaybackMode;
  src: string;
  isFallback: boolean;
}

function extractYoutubeId(url: string): string | null {
  const trimmed = url.trim();

  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
  if (embedMatch?.[1]) {
    return embedMatch[1];
  }

  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watchMatch?.[1]) {
    return watchMatch[1];
  }

  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (shortMatch?.[1]) {
    return shortMatch[1];
  }

  return null;
}

function extractVimeoId(url: string): string | null {
  const match = url.trim().match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] ?? null;
}

function looksLikeImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|webp|gif|svg)(\?|#|$)/i.test(url);
}

function looksLikeDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url) || /^assets\//i.test(url) || /^\/assets\//i.test(url);
}

export function resolveVideoPlayback(videoUrl: string | null | undefined): ResolvedPlayback {
  const trimmed = videoUrl?.trim();

  if (!trimmed) {
    return {
      mode: 'video',
      src: DEMO_VIDEO_URL,
      isFallback: true,
    };
  }

  if (looksLikeImageUrl(trimmed)) {
    return {
      mode: 'video',
      src: DEMO_VIDEO_URL,
      isFallback: true,
    };
  }

  // URLs demo antiguas de Google Storage suelen devolver 403 fuera de ciertos entornos.
  if (/commondatastorage\.googleapis\.com/i.test(trimmed)) {
    return {
      mode: 'video',
      src: DEMO_VIDEO_URL,
      isFallback: true,
    };
  }

  const youtubeId = extractYoutubeId(trimmed);
  if (youtubeId) {
    return {
      mode: 'iframe',
      src: `https://www.youtube.com/embed/${youtubeId}`,
      isFallback: false,
    };
  }

  const vimeoId = extractVimeoId(trimmed);
  if (vimeoId) {
    return {
      mode: 'iframe',
      src: `https://player.vimeo.com/video/${vimeoId}`,
      isFallback: false,
    };
  }

  if (looksLikeDirectVideoUrl(trimmed)) {
    return {
      mode: 'video',
      src: trimmed,
      isFallback: false,
    };
  }

  return {
    mode: 'video',
    src: trimmed,
    isFallback: false,
  };
}

export function buildYoutubeEmbedUrl(youtubeKey: string): string {
  return `https://www.youtube.com/embed/${youtubeKey}`;
}
