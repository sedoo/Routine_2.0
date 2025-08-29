#!/bin/bash

VENV_DIR="venv"
PYTHON_BIN="python3.11"

# Choisir quel fichier .env charger
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

# Valeur par défaut si non défini dans .env
export APP_PROFILE=${APP_PROFILE:-dev}

echo "👉 APP_PROFILE=$APP_PROFILE"

# Vérifier Python
if ! command -v $PYTHON_BIN &> /dev/null; then
    echo "❌ $PYTHON_BIN non trouvé. Installe-le avant de continuer."
    exit 1
fi

# Création du venv si nécessaire
if [ ! -d "$VENV_DIR" ]; then
    echo "🧪 Création de l'environnement virtuel..."
    $PYTHON_BIN -m venv $VENV_DIR
    
    echo "⚙️ Activation du venv..."
    source $VENV_DIR/bin/activate
    
    if [ -f requirements.txt ]; then
        echo "📦 Installation des dépendances..."
        pip install --upgrade pip
        pip install -r requirements.txt
    else
        echo "⚠️ Aucun requirements.txt trouvé."
    fi
else
    echo "✅ Environnement virtuel déjà présent."
    source $VENV_DIR/bin/activate
fi

# Trouver un port libre si non défini
if [ -z "$PORT" ]; then
  PORT=$(python -c 'import socket; s=socket.socket(); s.bind(("", 0)); print(s.getsockname()[1]); s.close()')
fi
echo "🚀 Lancement sur le port $PORT"

export PYTHONPATH=$(pwd)/app

# Lancer gunicorn
exec gunicorn \
    --bind 0.0.0.0:$PORT \
    routine:app
