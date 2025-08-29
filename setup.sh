#!/bin/bash
set -e

APP_PROFILE=${APP_PROFILE:-dev}
BASE_DIR="/data/services/Routine_2.0"
VENV_DIR="$BASE_DIR/venv"
PYTHON_BIN="/usr/bin/python3.10"   # version dispo sur ton serveur
PIP_BIN="$VENV_DIR/bin/pip"
GUNICORN_BIN="$VENV_DIR/bin/gunicorn"

# ------------------------
# 1. Charger les variables d'env
# ------------------------
if [ "$APP_PROFILE" = "prod" ]; then
    ENV_FILE="$BASE_DIR/.env.prod"
else
    ENV_FILE="$BASE_DIR/.env.dev"
fi

if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
    echo "👉 Variables chargées depuis $ENV_FILE"
else
    echo "⚠️ Aucun fichier $ENV_FILE trouvé."
fi

echo "👉 APP_PROFILE=$APP_PROFILE"

# ------------------------
# 2. Créer le venv si besoin
# ------------------------
if [ ! -d "$VENV_DIR" ]; then
    echo "🧪 Création de l'environnement virtuel avec $PYTHON_BIN..."
    $PYTHON_BIN -m venv "$VENV_DIR"
fi

# ------------------------
# 3. Installer les dépendances
# ------------------------
if [ -f "$BASE_DIR/requirements.txt" ]; then
    echo "📦 Installation/upgrade des dépendances..."
    $VENV_DIR/bin/python -m ensurepip --upgrade
    $PIP_BIN install --upgrade pip
    $PIP_BIN install -r "$BASE_DIR/requirements.txt"
else
    echo "⚠️ Aucun requirements.txt trouvé."
fi

# ------------------------
# 4. Lancer gunicorn
# ------------------------
PORT=${PORT:-8000}
if [ "$APP_PROFILE" = "prod" ] && [ "$PORT" = "8000" ]; then
    PORT=$($VENV_DIR/bin/python -c 'import socket; s=socket.socket(); s.bind(("",0)); print(s.getsockname()[1]); s.close()')
fi
echo "🚀 Lancement sur le port $PORT"

export PYTHONPATH="$BASE_DIR/app"

if [ ! -f "$GUNICORN_BIN" ]; then
    echo "❌ gunicorn non trouvé dans le venv. Installation..."
    $PIP_BIN install gunicorn
fi

exec "$GUNICORN_BIN" --bind 0.0.0.0:$PORT routine:app
