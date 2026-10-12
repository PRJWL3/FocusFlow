import os
import sys
import subprocess
import static_ffmpeg

static_ffmpeg.add_paths()

url = "https://www.youtube.com/live/QiYEvhjLRWU"
output_path = os.path.abspath("public/rain_nature_loop.mp4")

print(f"Target URL: {url}")
print(f"Output Path: {output_path}")

try:
    import yt_dlp
    ydl_opts = {
        'format': '232/231/bestvideo',
        'quiet': True,
        'no_warnings': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        # Find format 232 or 231
        stream_url = None
        for f in info.get('formats', []):
            if f.get('format_id') in ['232', '231', '230']:
                stream_url = f.get('url')
                print(f"Selected format {f.get('format_id')}: {f.get('resolution')}")
                break
        if not stream_url:
            stream_url = info.get('url')
        print(f"Stream URL: {stream_url[:60]}...")
except Exception as e:
    print(f"yt_dlp extraction error: {e}")
    sys.exit(1)

# Download 12 seconds of video, muted, looped, high quality 720p H.264
cmd = [
    "ffmpeg",
    "-y",
    "-i", stream_url,
    "-t", "12",  # 12 seconds loop
    "-an",       # mute video (audio handled separately)
    "-c:v", "libx264",
    "-crf", "22",
    "-preset", "veryfast",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    output_path
]

print("Running ffmpeg to record 12-second video loop...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode == 0:
    print(f"Successfully created: {output_path} (Size: {os.path.getsize(output_path)} bytes)")
else:
    print(f"ffmpeg failed:\n{res.stderr}")
    sys.exit(1)
