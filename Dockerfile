# Gunakan python slim agar ringan
FROM python:3.11-slim

# Install library sistem untuk MySQL
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Setup user non-root (syarat Hugging Face)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:${PATH}"

WORKDIR /app

# Copy requirements dan install
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy semua file (termasuk folder static dan api/)
COPY --chown=user . .

# Port wajib Hugging Face
EXPOSE 7860

# Jalankan dengan Gunicorn (lebih stabil dari python index.py)
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "api.index:app"]