#!/usr/bin/env python
import os
import subprocess
import sys

port = os.environ.get('PORT', '8000')
subprocess.run([
    'python', '-m', 'uvicorn', 
    'app.main:app',
    '--host', '0.0.0.0',
    '--port', port
])
