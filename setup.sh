#!/bin/bash
set -e

# Choisir la version de Python
PYTHON_BIN="/usr/bin/python3.11"   # ← utilise le Python système dispo
VENV_DIR="/data/services/Routine_2.0/venv"

echo "🔍 Vérification de la présence de $PYTHON_BIN ..."
if ! command -v $PYTHON_BIN &> /dev/null; then
    echo "❌ $PYTHON_BIN non trouvé. Installe-le avant de continuer."
    exit 1
fi

echo "🧪 Création de l'environnement virtuel dans $VENV_DIR ..."
$PYTHON_BIN -m venv $VENV_DIR

echo "⚙️ Activation du venv..."
source "$VENV_DIR/bin/activate"

# Vérifier si pip existe, sinon l'installer avec ensurepip
if [ ! -x "$VENV_DIR/bin/pip" ]; then
    echo "⚠️ pip introuvable dans le venv, tentative d'installation..."
    $VENV_DIR/bin/python -m ensurepip --upgrade --default-pip
    $VENV_DIR/bin/python -m pip install --upgrade pip setuptools wheel
fi

echo "📦 Installation des dépendances depuis requirements.txt..."
if [ -f requirements.txt ]; then
    $VENV_DIR/bin/pip install -r requirements.txt
else
    echo "❌ Fichier requirements.txt introuvable."
    deactivate
    exit 1
fi

echo "✅ Installation terminée dans $VENV_DIR"
