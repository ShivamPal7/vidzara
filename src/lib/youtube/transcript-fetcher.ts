import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Robust YouTube transcript fetcher.
 * Uses the youtube-transcript library which handles various extraction methods
 * including from html and innerTube.
 */
export async function fetchYouTubeTranscript(videoId: string) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map(t => ({ text: t.text }));
  } catch (error: any) {
    console.error("YoutubeTranscript error:", error);
    
    // Fallback: InnerTube API
    try {
      const playerUrl = `https://www.youtube.com/youtubei/v1/player?key=IzaSyAO_S-9z-u5u-u5u-u5u-u5u-u5u-u5u-u`; 
      const payload = {
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20240210.01.00",
          },
        },
        videoId: videoId,
      };

      const response = await fetch(playerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`InnerTube API failed: ${response.statusText}`);
      }

      const data = await response.json();
      const captionTracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks;

      if (!captionTracks || captionTracks.length === 0) {
        throw new Error("No caption tracks found for this video.");
      }

      const englishTrack = captionTracks.find((t: any) => t.languageCode === "en") || captionTracks[0];

      const transcriptRes = await fetch(`${englishTrack.baseUrl}&fmt=json3`, {
        cache: "no-store",
      });

      if (!transcriptRes.ok) {
        throw new Error("Failed to fetch transcript content from YouTube.");
      }

      const transcriptData = await transcriptRes.json();

      return transcriptData.events
        .filter((e: any) => e.segs)
        .map((e: any) => ({
          text: e.segs.map((s: any) => s.utf8).join(" "),
        }));
    } catch (innerError: any) {
      console.error("Fallback InnerTube error:", innerError);
      throw new Error(`Failed to fetch transcript: ${error.message} | Fallback: ${innerError.message}`);
    }
  }
}
