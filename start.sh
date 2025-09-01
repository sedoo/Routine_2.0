#!/bin/bash
set -e

BASE_DIR="/data/services/Routine_2.0"

# Déterminer l'environnement à charger
if [ "$APP_PROFILE" = "prod" ]; then
    ENV_FILE="$BASE_DIR/.env.prod"
else
    BASE_DIR="/home/tromuald/git/Routine_2.0"
    ENV_FILE="$BASE_DIR/.env.dev"
fi

VENV_DIR="$BASE_DIR/venv"
SETUP_SCRIPT="$BASE_DIR/setup.sh"


# Charger les variables d'environnement
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
    echo "👉 Variables chargées depuis $ENV_FILE"
else
    echo "⚠️ Aucun fichier $ENV_FILE trouvé."
fi

export APP_PROFILE=${APP_PROFILE:-dev}
echo "👉 APP_PROFILE=$APP_PROFILE"

# Vérifier que le venv et pip existent, sinon lancer setup.sh
if [ ! -x "$VENV_DIR/bin/pip" ]; then
    echo "⚠️ venv/pip introuvable, exécution de $SETUP_SCRIPT..."
    bash "$SETUP_SCRIPT"
fi

# Activer le venv
source "$VENV_DIR/bin/activate"

# Vérifier gunicorn
if [ ! -x "$VENV_DIR/bin/gunicorn" ]; then
    echo "⚠️ gunicorn introuvable, installation..."
    pip install gunicorn
fi

# Définir le port (8000 par défaut, ou aléatoire en prod si déjà occupé)
PORT=${PORT:-8000}
if [ "$APP_PROFILE" = "prod" ]; then
    PORT=$(python -c 'import socket; s=socket.socket(); s.bind(("",0)); print(s.getsockname()[1]); s.close()')
    echo "🚀 Utilisation du port libre $PORT"
else
    echo "🚀 Lancement en mode dev sur le port $PORT"
fi

export PORT

# Lancer l'application
exec gunicorn --bind 0.0.0.0:$PORT routine:app
