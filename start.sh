#!/bin/bash

set -e  # arrêter le script en cas d'erreur

VENV_DIR="venv"

# Déterminer le fichier .env à charger
if [ "$APP_PROFILE" = "prod" ]; then
    ENV_FILE=".env.prod"
else
    ENV_FILE=".env.dev"
fi

# Charger le fichier choisi
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
    echo "👉 Variables chargées depuis $ENV_FILE"
else
    echo "⚠️ Aucun fichier $ENV_FILE trouvé."
fi

# Valeur par défaut si non définie
export APP_PROFILE=${APP_PROFILE:-dev}

# Définir SYSTEM_PYTHON à partir de l'env ou fallback sur Python 3.11 système
SYSTEM_PYTHON=${SYSTEM_PYTHON:-/usr/bin/python3.11}

echo "👉 APP_PROFILE=$APP_PROFILE"
echo "👉 SYSTEM_PYTHON=$SYSTEM_PYTHON"

# Vérifier que Python existe
if ! command -v $SYSTEM_PYTHON &> /dev/null; then
    echo "❌ $SYSTEM_PYTHON non trouvé."
    exit 1
fi

# Créer le venv si nécessaire
if [ ! -d "$VENV_DIR" ]; then
    echo "🧪 Création de l'environnement virtuel..."
    $SYSTEM_PYTHON -m venv $VENV_DIR
fi

# Activer le venv
if [ -f "$VENV_DIR/bin/activate" ]; then
    source "$VENV_DIR/bin/activate"
else
    echo "❌ Impossible de trouver $VENV_DIR/bin/activate"
    exit 1
fi

# Définir les chemins vers pip et gunicorn dans le venv
PIP_BIN="$VENV_DIR/bin/pip"
GUNICORN_BIN="$VENV_DIR/bin/gunicorn"

# Installer les dépendances
if [ -f "requirements.txt" ]; then
    echo "📦 Installation/upgrade des dépendances..."
    $PIP_BIN install --upgrade pip
    $PIP_BIN install -r requirements.txt
else
    echo "⚠️ Aucun requirements.txt trouvé."
fi

# Définir le port
PORT=${PORT:-8000}
if [ "$APP_PROFILE" = "prod" ] && [ "$PORT" = "8000" ]; then
    PORT=$(python -c 'import socket; s=socket.socket(); s.bind(("", 0)); print(s.getsockname()[1]); s.close()')
fi
echo "🚀 Lancement sur le port $PORT"

export PYTHONPATH=$(pwd)/app

# Vérifier gunicorn
if [ ! -f "$GUNICORN_BIN" ]; then
    echo "❌ gunicorn non trouvé dans le venv. Installe-le avec '$PIP_BIN install gunicorn'."
    exit 1
fi

# Lancer gunicorn
exec "$GUNICORN_BIN" --bind 0.0.0.0:$PORT routine:app
