import os
import subprocess

port = os.environ.get('PORT', '8080')

subprocess.call([
    'python', '-m', 'uvicorn',
    'app.main:app',
    '--host', '0.0.0.0',
    '--port', port
])