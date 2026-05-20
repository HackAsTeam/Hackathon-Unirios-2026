from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import Response
from kokoro import KPipeline
import soundfile as sf
import numpy as np
import threading
import asyncio
import time
import os
import re
import io

app = FastAPI()
pipeline = KPipeline(lang_code='p')
_tts_lock = threading.Lock()


@app.on_event('startup')
async def _startup():
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _get_oww_model)

# ─── Wake word ────────────────────────────────────────────────────────────────

_MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
_WAKEWORD_MODEL_PATH = os.environ.get(
    'WAKEWORD_MODEL_PATH',
    os.path.join(_MODELS_DIR, 'Hey_dilo.onnx')
)
_oww_model = None
_oww_lock = threading.Lock()


def _get_oww_model():
    global _oww_model
    with _oww_lock:
        if _oww_model is None:
            from openwakeword.model import Model
            _oww_model = Model(
                wakeword_models=[_WAKEWORD_MODEL_PATH],
                inference_framework='onnx',
                melspec_model_path=os.path.join(_MODELS_DIR, 'melspectrogram.onnx'),
                embedding_model_path=os.path.join(_MODELS_DIR, 'embedding_model.onnx'),
            )
    return _oww_model


def _predict_wakeword(audio_bytes: bytes) -> list:
    if len(audio_bytes) % 2 == 1:
        audio_bytes += b'\x00'
    audio = np.frombuffer(audio_bytes, dtype=np.int16)
    model = _get_oww_model()
    with _oww_lock:
        preds = model.predict(audio)
    return [k for k, v in preds.items() if v >= 0.5]


_ACTIVATION_COOLDOWN = 2.0  # seconds between activations (per connection)


def _reset_oww_buffers():
    model = _get_oww_model()
    with _oww_lock:
        for buf in model.prediction_buffer.values():
            buf.clear()


@app.websocket('/ws/wakeword')
async def wakeword_ws(websocket: WebSocket):
    await websocket.accept()
    loop = asyncio.get_event_loop()
    last_activation = 0.0
    try:
        while True:
            data = await websocket.receive_bytes()
            activations = await loop.run_in_executor(None, _predict_wakeword, data)
            now = time.monotonic()
            if activations and (now - last_activation) >= _ACTIVATION_COOLDOWN:
                last_activation = now
                await websocket.send_json({'activations': activations})
                await loop.run_in_executor(None, _reset_oww_buffers)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f'[WakeWord] ws error: {e}')

# ─── TTS ──────────────────────────────────────────────────────────────────────

def _sanitize(text: str) -> str:
    text = re.sub(r'\.{2,}', '.', text)
    text = re.sub(r'[:\-–—]', ', ', text)
    text = re.sub(r'[^\w\s.,!?áéíóúàâêôãõçüñÁÉÍÓÚÀÂÊÔÃÕÇÜÑ]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


@app.get('/tts')
def tts(text: str):
    if not text.strip():
        raise HTTPException(status_code=400, detail='text is required')

    text = _sanitize(text)
    with _tts_lock:
        chunks = [audio for _, _, audio in pipeline(text, voice='pm_alex', speed=1)]
    if not chunks:
        raise HTTPException(status_code=500, detail='no audio generated')

    combined = np.concatenate(chunks) if len(chunks) > 1 else chunks[0]
    buf = io.BytesIO()
    sf.write(buf, combined, 24000, format='WAV')
    buf.seek(0)

    return Response(content=buf.read(), media_type='audio/wav')
