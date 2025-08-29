#!/bin/bash

set -e  # arrêter le script en cas d'erreur

VENV_DIR="venv"
PYTHON_BIN="python3.11"

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
echo "👉 APP_PROFILE=$APP_PROFILE"

# Vérifier que Python existe
if ! command -v $PYTHON_BIN &> /dev/null; then
    echo "❌ $PYTHON_BIN non trouvé. Installe-le avant de continuer."
    exit 1
fi

# Création ou activation du venv
if [ ! -d "$VENV_DIR" ]; then
    echo "🧪 Création de l'environnement virtuel..."
    $PYTHON_BIN -m venv $VENV_DIR
fi

# Activer le venv
if [ -f "$VENV_DIR/bin/activate" ]; then
    source "$VENV_DIR/bin/activate"
else
    echo "❌ Impossible de trouver $VENV_DIR/bin/activate"
    exit 1
fi

# Installer les dépendances si jamais venv fraîchement créé
if [ -f "requirements.txt" ]; then
    echo "📦 Installation/upgrade des dépendances..."
    pip install --upgrade pip
    pip install -r requirements.txt
else
    echo "⚠️ Aucun requirements.txt trouvé."
fi

PORT=${PORT:-8000}
# Déterminer un port libre si non défini
if [ "$APP_PROFILE" = "prod" ]; then
  PORT=$(python -c 'import socket; s=socket.socket(); s.bind(("", 0)); print(s.getsockname()[1]); s.close()')
fi
echo "🚀 Lancement sur le port $PORT"

export PYTHONPATH=$(pwd)/app

# Lancer gunicorn
if ! command -v gunicorn &> /dev/null; then
    echo "❌ gunicorn non trouvé dans le venv. Installe-le avec 'pip install gunicorn'."
    exit 1
fi

exec gunicorn \
    --bind 0.0.0.0:$PORT \
    routine:app
