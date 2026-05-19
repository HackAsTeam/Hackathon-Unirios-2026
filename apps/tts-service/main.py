from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from kokoro import KPipeline
import soundfile as sf
import numpy as np
import io

app = FastAPI()
pipeline = KPipeline(lang_code='p')


@app.get("/tts")
def tts(text: str):
    if not text.strip():
        raise HTTPException(status_code=400, detail="text is required")

    chunks = [audio for _, _, audio in pipeline(text, voice='pm_alex', speed=1)]
    if not chunks:
        raise HTTPException(status_code=500, detail="no audio generated")

    combined = np.concatenate(chunks) if len(chunks) > 1 else chunks[0]
    buf = io.BytesIO()
    sf.write(buf, combined, 24000, format='WAV')
    buf.seek(0)

    return Response(content=buf.read(), media_type="audio/wav")
