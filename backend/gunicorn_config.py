"""
Gunicorn configuration file for MrBikeBD production environment.
Usage: gunicorn -c gunicorn_config.py core.wsgi:application
"""

import multiprocessing
import os

# Server socket
bind = "0.0.0.0:" + os.getenv("PORT", "8000")
backlog = 2048

# Worker processes
# Calculate workers based on machine cores: (2 x NUM_CORES) + 1
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = 'gthread'
threads = 4
worker_connections = 1000
timeout = 30
keepalive = 2

# Process naming
proc_name = 'mrbikebd_gunicorn'

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# Logging
errorlog = '-'
loglevel = 'info'
accesslog = '-'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Redis configuration (if using gevent/eventlet and redis)
# Uncomment for async workers if heavy IO
# worker_class = 'gevent'
