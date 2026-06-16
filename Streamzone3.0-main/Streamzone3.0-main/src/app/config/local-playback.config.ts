export const DEMO_VIDEO_URL = 'https://www.w3schools.com/html/mov_bbb.mp4';

const LOCAL_SAMPLE_VIDEOS = [DEMO_VIDEO_URL];

export type LocalSaga = 'starwars' | 'transformers';

export function getLocalPlaybackUrl(saga: LocalSaga, num: number): string {
  const index = Math.max(0, num - 1) % LOCAL_SAMPLE_VIDEOS.length;
  return LOCAL_SAMPLE_VIDEOS[index];
}

export function getLocalMovieTitle(saga: LocalSaga, num: number, fallbackTitle?: string): string {
  if (fallbackTitle?.trim()) {
    return fallbackTitle.trim();
  }

  if (saga === 'starwars') {
    return `Star Wars ${num}`;
  }

  return `Transformers ${num}`;
}
