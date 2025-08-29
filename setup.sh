#!/bin/bash
set -e

# Choisir la version de Python
PYTHON_BIN="/usr/bin/python3.10"   # ← utilise le Python système dispo
VENV_DIR="/data/services/Routine_2.0/venv"

echo "🔍 Vérification de la présence de $PYTHON_BIN ..."
if ! command -v $PYTHON_BIN &> /dev/null; then
    echo "❌ $PYTHON_BIN non trouvé. Installe-le avant de continuer."
    exit 1
fi

echo "🧪 Création de l'environnement virtuel dans $VENV_DIR ..."
$PYTHON_BIN -m venv $VENV_DIR

# Toujours utiliser pip/python du venv, jamais celui du système
PIP_BIN="$VENV_DIR/bin/pip"
PY_BIN="$VENV_DIR/bin/python"

echo "⚙️ Activation du venv..."
source "$VENV_DIR/bin/activate"

echo "📦 Installation des dépendances depuis requirements.txt..."
if [ -f requirements.txt ]; then
    $PY_BIN -m ensurepip --upgrade
    $PIP_BIN install --upgrade pip
    $PIP_BIN install -r requirements.txt
else
    echo "❌ Fichier requirements.txt introuvable."
    deactivate
    exit 1
fi

echo "✅ Installation terminée dans $VENV_DIR"
