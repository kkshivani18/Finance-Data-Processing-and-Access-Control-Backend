import os
import subprocess

# Get PORT from environment, default to 8000
port = os.environ.get('PORT', '8000')

subprocess.call([
    'python', '-m', 'uvicorn',
    'app.main:app',
    '--host', '0.0.0.0',
    '--port', port
])
