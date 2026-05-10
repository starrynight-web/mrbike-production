FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PORT 7860

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
# We copy requirements from the backend folder
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy project files from backend/ to /app
COPY backend/ .

# Ensure static files are collected
# This requires environment variables to be set, 
# but we can do it during the build if we provide dummy values or skip if not needed yet.
# Better to do it at runtime or ensure WhiteNoise handles it.
RUN python manage.py collectstatic --no-input --settings=core.settings.base

# Expose port 7860 for Hugging Face
EXPOSE 7860

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--workers", "4", "--timeout", "120", "core.wsgi:application"]
