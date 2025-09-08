#!/bin/bash

# Modifier cette variable si tu veux une autre version de Python
PYTHON_BIN="python3.11"
VENV_DIR="venv"

echo "🔍 Vérification de la présence de $PYTHON_BIN ..."
if ! command -v $PYTHON_BIN &> /dev/null; then
    echo "❌ $PYTHON_BIN non trouvé. Installe-le avant de continuer."
    exit 1
fi

echo "🧪 Création de l'environnement virtuel..."
$PYTHON_BIN -m venv $VENV_DIR

echo "⚙️ Activation de l'environnement virtuel..."
source $VENV_DIR/bin/activate

echo "📦 Installation des dépendances depuis requirements.txt..."
if [ -f requirements.txt ]; then
    pip install --upgrade pip
    pip install -r requirements.txt
else
    echo "❌ Fichier requirements.txt introuvable."
    deactivate
    exit 1
fi
