#!/bin/bash

# Função para instalar dependências do Node.js
install_node() {
    echo "Instalando dependências do Node.js..."
    cd node-api || exit
    npm install
    cd - || exit
}

# Função para instalar dependências do Python
install_python() {
    echo "Instalando dependências do Python..."

    cd python-llm || exit

    if [ ! -d ".venv" ]; then
        python -m venv .venv
    fi

    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        source .venv/Scripts/activate
    else
        source .venv/bin/activate
    fi

    pip install -r requirements.txt
    cd - || exit
}

# Função para executar o modo de desenvolvimento do Node.js
dev_node() {
    echo "Iniciando servidor Node.js no modo de desenvolvimento..."
    cd node-api || exit
    npm run dev
    cd - || exit
}

# Função para executar o modo de desenvolvimento do Python
dev_python() {
    echo "Iniciando servidor Python no modo de desenvolvimento..."

    cd python-llm || exit

    if [ ! -d ".venv" ]; then
        echo "Ambiente virtual nao encontrado. Execute ./setup.sh install-python primeiro."
        cd - || exit
        return 1
    fi

    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        source .venv/Scripts/activate
    else
        source .venv/bin/activate
    fi

    uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
    cd - || exit
}

# Verifica o comando passado como argumento
case $1 in
    install-node)
        install_node
        ;;
    install-python)
        install_python
        ;;
    install)
        install_node
        install_python
        ;;
    dev-node)
        dev_node
        ;;
    dev-python)
        dev_python
        ;;
    start-node)
        dev_node
        ;;
    start-python)
        dev_python
        ;;
    dev)
        echo "Iniciando Node.js e Python em modo de desenvolvimento..."
        dev_python &
        sleep 3
        dev_node
        ;;
    start)
        echo "Iniciando Node.js e Python..."
        dev_python &
        sleep 3
        dev_node
        ;;
    dev-all)
        echo "Iniciando Node.js e Python em modo de desenvolvimento..."
        dev_python &
        sleep 3
        dev_node
        ;;
    start-all)
        echo "Iniciando Node.js e Python..."
        dev_python &
        sleep 3
        dev_node
        ;;
    *)
        echo "Comando inválido. Use um dos seguintes:"
        echo "  install-node     - Instala dependências do Node.js"
        echo "  install-python   - Instala dependências do Python"
        echo "  install          - Instala todas as dependências"
        echo "  dev-node         - Inicia o servidor Node.js no modo dev"
        echo "  dev-python       - Inicia o servidor Python no modo dev"
        echo "  start-node       - Alias para dev-node (compatibilidade)"
        echo "  start-python     - Alias para dev-python (compatibilidade)"
        echo "  dev              - Inicia Node + Python juntos (1 terminal)"
        echo "  start            - Alias para dev (1 terminal)"
        echo "  dev-all          - Inicia Node + Python juntos (1 terminal)"
        echo "  start-all        - Inicia Node + Python juntos (1 terminal)"
        ;;
esac
