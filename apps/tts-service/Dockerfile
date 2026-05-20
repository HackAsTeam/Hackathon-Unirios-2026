FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    espeak-ng \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir --no-deps openwakeword==0.6.0 \
    && pip install --no-cache-dir onnxruntime tqdm scipy scikit-learn requests

# Pre-download Kokoro weights at build time so startup is instant
RUN python -c "from kokoro import KPipeline; KPipeline(lang_code='p')"

COPY models/ models/
COPY main.py .

EXPOSE 8090
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8090"]
