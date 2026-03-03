/**
 * Extract YouTube video ID from various URL formats.
 * Supports: youtube.com/watch?v=X, youtu.be/X, youtube.com/embed/X
 */
export function extractVideoId(url: string): string | null {
    if (!url) return null;

    const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
    }

    // Check if the input itself is a valid video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;

    return null;
}

/**
 * Get YouTube thumbnail URL from video ID.
 */
export function getThumbnailUrl(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Fetch video title using noembed.com (free, no API key needed).
 */
export async function fetchVideoTitle(videoId: string): Promise<string> {
    try {
        const url = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.title || "Untitled Video";
    } catch {
        return "Untitled Video";
    }
}
