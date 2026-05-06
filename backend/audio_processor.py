"""
vitqa - AI Music Humanizer
HPSS-based audio processing pipeline (v2 optimized)
Separates vocals from background, applies encoding to background,
mixes back with controlled ratio to bypass AI detection.
"""

import os
import subprocess
import tempfile
import uuid
import shutil
from pathlib import Path

UPLOAD_DIR = Path(__file__).parent / "uploads"
OUTPUT_DIR = Path(__file__).parent / "outputs"
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)


def allowed_file(filename: str) -> bool:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in {"wav", "mp3", "flac", "m4a", "ogg", "aac"}


def get_audio_duration(filepath: str) -> float:
    """Get audio duration in seconds using ffprobe."""
    try:
        cmd = [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            filepath
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        return float(result.stdout.strip())
    except Exception:
        return 0.0


def process_audio(
    input_path: str,
    vocal_ratio: float = 0.24,
    background_bitrate: str = "48k",
    output_bitrate: str = "128k",
    mix_vocal_gain: float = 1.6,
    mix_bg_gain: float = 0.4
) -> dict:
    """
    HPSS-based audio processing pipeline (v2 optimized).

    Args:
        input_path: Path to input audio file
        vocal_ratio: Percentage of original vocal to retain (0.0-1.0)
        background_bitrate: Bitrate for background encoding (low to mask AI)
        output_bitrate: Final output bitrate (128k CBR recommended)
        mix_vocal_gain: Vocal volume multiplier in final mix
        mix_bg_gain: Background volume multiplier in final mix

    Returns:
        dict with status, output_path, and details
    """
    job_id = uuid.uuid4().hex[:12]
    workdir = Path(tempfile.mkdtemp())
    output_filename = f"vitqa_{job_id}.mp3"
    output_path = str(OUTPUT_DIR / output_filename)

    try:
        # Phase 1: Convert input to WAV for processing
        wav_input = workdir / "input.wav"
        subprocess.run([
            "ffmpeg", "-y", "-i", input_path,
            "-ar", "44100", "-ac", "2",
            "-sample_fmt", "s16",
            str(wav_input)
        ], check=True, capture_output=True, timeout=120)

        # Phase 2: HPSS-style separation using ffmpeg filters
        # Use a combination of lowpass and highpass with crossover to
        # approximate harmonic-percussive separation
        vocal_wav = workdir / "vocal.wav"
        background_wav = workdir / "background.wav"

        # Extract "vocal-like" content (mid-range, harmonic)
        # Using bandpass filter to isolate vocal frequencies
        subprocess.run([
            "ffmpeg", "-y", "-i", str(wav_input),
            "-af", "bandpass=f=1000:t=h,volume=1.0",
            str(vocal_wav)
        ], check=True, capture_output=True, timeout=120)

        # Extract "background-like" content (full range minus vocal band)
        subprocess.run([
            "ffmpeg", "-y", "-i", str(wav_input),
            "-af", "bandreject=f=1000:t=h",
            str(background_wav)
        ], check=True, capture_output=True, timeout=120)

        # Phase 3: Apply encoding degradation to background
        bg_encoded = workdir / "bg_encoded.mp3"
        subprocess.run([
            "ffmpeg", "-y", "-i", str(background_wav),
            "-c:a", "libmp3lame",
            "-b:a", background_bitrate,
            "-q:a", "9",
            str(bg_encoded)
        ], check=True, capture_output=True, timeout=120)

        # Decode back to WAV for mixing
        bg_decoded = workdir / "bg_decoded.wav"
        subprocess.run([
            "ffmpeg", "-y", "-i", str(bg_encoded),
            str(bg_decoded)
        ], check=True, capture_output=True, timeout=120)

        # Phase 4: Mix vocal + encoded background
        # Apply gain to each track then mix
        vocal_gain = workdir / "vocal_gain.wav"
        bg_gain = workdir / "bg_gain.wav"
        mixed = workdir / "mixed.wav"

        subprocess.run([
            "ffmpeg", "-y", "-i", str(vocal_wav),
            "-af", f"volume={mix_vocal_gain}",
            str(vocal_gain)
        ], check=True, capture_output=True, timeout=120)

        subprocess.run([
            "ffmpeg", "-y", "-i", str(bg_decoded),
            "-af", f"volume={mix_bg_gain}",
            str(bg_gain)
        ], check=True, capture_output=True, timeout=120)

        subprocess.run([
            "ffmpeg", "-y",
            "-i", str(vocal_gain),
            "-i", str(bg_gain),
            "-filter_complex", "[0:a][1:a]amix=inputs=2:duration=first:weights=1 1",
            str(mixed)
        ], check=True, capture_output=True, timeout=120)

        # Phase 5: Final encode to 128kbps CBR MP3
        subprocess.run([
            "ffmpeg", "-y", "-i", str(mixed),
            "-c:a", "libmp3lame",
            "-b:a", output_bitrate,
            "-q:a", "2",
            "-write_xing", "0",
            output_path
        ], check=True, capture_output=True, timeout=120)

        # Cleanup
        shutil.rmtree(workdir, ignore_errors=True)

        duration = get_audio_duration(output_path)
        size_mb = os.path.getsize(output_path) / (1024 * 1024)

        return {
            "status": "success",
            "output_path": output_path,
            "output_filename": output_filename,
            "duration_seconds": round(duration, 1),
            "size_mb": round(size_mb, 2),
            "vocal_ratio": vocal_ratio,
            "background_bitrate": background_bitrate,
            "output_bitrate": output_bitrate,
            "mix_ratio": f"{mix_vocal_gain}:{mix_bg_gain}"
        }

    except subprocess.CalledProcessError as e:
        shutil.rmtree(workdir, ignore_errors=True)
        return {
            "status": "error",
            "error": f"FFmpeg error: {e.stderr.decode() if e.stderr else str(e)}"
        }
    except Exception as e:
        shutil.rmtree(workdir, ignore_errors=True)
        return {
            "status": "error",
            "error": str(e)
        }


def cleanup_old_files(max_age_hours: int = 24):
    """Clean up processed files older than max_age_hours."""
    import time
    now = time.time()
    for d in [UPLOAD_DIR, OUTPUT_DIR]:
        for f in d.iterdir():
            if f.is_file():
                age_hours = (now - f.stat().st_mtime) / 3600
                if age_hours > max_age_hours:
                    f.unlink()
