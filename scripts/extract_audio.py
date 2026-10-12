import os
import sys
import subprocess
import static_ffmpeg

static_ffmpeg.add_paths()

url = "https://www.youtube.com/live/QiYEvhjLRWU"
output_path = os.path.abspath("public/audio/rain_thunder.mp3")

print(f"Target URL: {url}")
print(f"Output Path: {output_path}")

# Run yt-dlp to get stream URL
try:
    import yt_dlp
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        stream_url = info.get('url')
        print(f"Got stream URL: {stream_url[:60]}...")
except Exception as e:
    print(f"yt_dlp extraction error: {e}")
    sys.exit(1)

# Now use ffmpeg to capture 3 minutes (180 seconds) of high-quality stereo MP3 audio
cmd = [
    "ffmpeg",
    "-y",
    "-i", stream_url,
    "-t", "180",  # 3 minutes of high quality rain & thunder
    "-vn",
    "-acodec", "libmp3lame",
    "-b:a", "192k",
    "-ar", "44100",
    "-ac", "2",
    output_path
]

print(f"Running ffmpeg to record 3 minutes of audio...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode == 0:
    print(f"Successfully created: {output_path} (Size: {os.path.getsize(output_path)} bytes)")
else:
    print(f"ffmpeg failed:\n{res.stderr}")
    sys.exit(1)
