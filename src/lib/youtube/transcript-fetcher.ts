import { YoutubeTranscript } from 'youtube-transcript';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as https from 'https';

const PROXY_URL = process.env.YOUTUBE_PROXY || process.env.PROXY_URL;

/**
 * Custom HTTPS fetcher supporting headers, redirects, and proxying.
 */
function fetchUrl(url: string, proxyUrl?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options: any = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    };
    
    if (proxyUrl) {
      options.agent = new HttpsProxyAgent(proxyUrl);
    }
    
    https.get(options, (res) => {
      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        if (res.statusCode === 301 || res.statusCode === 302) {
          // Follow redirect
          const redirectUrl = res.headers.location;
          if (redirectUrl) {
            fetchUrl(redirectUrl, proxyUrl).then(resolve).catch(reject);
            return;
          }
        }
        reject(new Error(`Failed to fetch ${url}: Status ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Robust YouTube transcript fetcher.
 * Uses a custom proxy-aware watch page fetcher, with fallback to youtube-transcript.
 */
export async function fetchYouTubeTranscript(videoId: string) {
  console.log(`[Transcript Fetcher] Starting fetch for video: ${videoId}. Proxy configured: ${!!PROXY_URL}`);
  
  // 1. Try our custom proxy-aware parser first (especially useful in production with proxy)
  try {
    const html = await fetchUrl(`https://www.youtube.com/watch?v=${videoId}`, PROXY_URL);
    
    // Extract ytInitialPlayerResponse
    const regex = /ytInitialPlayerResponse\s*=\s*({.+?});/;
    const match = html.match(regex);
    if (!match) {
      throw new Error("Could not find initial player response in page HTML. YouTube might be blocking or page structure changed.");
    }
    
    const playerResponse = JSON.parse(match[1]);
    const captionTracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    
    if (!captionTracks || captionTracks.length === 0) {
      throw new Error("No caption tracks found for this video in player response.");
    }
    
    // Pick English or the first one available
    const englishTrack = captionTracks.find((t: any) => t.languageCode === 'en') || captionTracks[0];
    
    // Fetch the transcript content
    const transcriptUrl = `${englishTrack.baseUrl}&fmt=json3`;
    const transcriptJsonStr = await fetchUrl(transcriptUrl, PROXY_URL);
    const transcriptData = JSON.parse(transcriptJsonStr);
    
    if (!transcriptData.events) {
      throw new Error("Transcript data format is unexpected (no events).");
    }
    
    return transcriptData.events
      .filter((e: any) => e.segs)
      .map((e: any) => ({
        text: e.segs.map((s: any) => s.utf8).join(" "),
      }));
  } catch (customError: any) {
    console.warn(`[Transcript Fetcher] Custom proxy-aware fetcher failed: ${customError.message}. Trying library fallback...`);
    
    // 2. Fallback to youtube-transcript library
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      return transcript.map(t => ({ text: t.text }));
    } catch (libError: any) {
      console.error("[Transcript Fetcher] Library fallback also failed:", libError);
      throw new Error(
        `Failed to fetch transcript. Custom fetcher: ${customError.message} | Library: ${libError.message}`
      );
    }
  }
}
