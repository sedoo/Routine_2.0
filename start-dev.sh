#!/bin/bash 

export APP_PROFILE=dev

# Trouver un port libre via Python 
PORT=$(/home/tromuald/git/Routine_2.0/venv/bin/python -c 'import socket; s=socket.socket(); s.bind(("", 0)); print(s.getsockname()[1]); s.close()') 
#PORT=8080 

echo "Launching on free port $PORT" 

export PYTHONPATH=$(pwd)/app
exec /home/tromuald/git/Routine_2.0/venv/bin/gunicorn \
    --bind 0.0.0.0:$PORT \
    routine:app