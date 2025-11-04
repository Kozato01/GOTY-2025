from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import csv
import os
import json
from datetime import datetime

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)  # Permite requisições do frontend

# Nome do arquivo CSV
CSV_FILE = os.getenv('CSV_FILE', 'data/usuarios.csv')  # Permite configurar via env var
CONFIG_FILE = 'data/config.json'

# Cabeçalhos das categorias TGA baseado no arquivo constants.ts
CATEGORIES = [
    "Jogo do Ano",
    "Melhor Direção de Jogo", 
    "Melhor Narrativa",
    "Melhor Direção de Arte",
    "Melhor Trilha Sonora",
    "Melhor Design de Áudio",
    "Melhor Atuação",
    "Inovação em Acessibilidade",
    "Jogos com Maior Impacto Social",
    "Melhor Jogo Contínuo",
    "Melhor Suporte à Comunidade",
    "Melhor Jogo Independente",
    "Melhor Estreia de um Estúdio Indie",
    "Melhor Jogo Mobile",
    "Melhor VR / AR",
    "Melhor Jogo de Ação",
    "Melhor Jogo de Ação / Aventura",
    "Melhor RPG",
    "Melhor Jogo de Luta",
    "Melhor Jogo para Família",
    "Melhor Jogo de Simulação / Estratégia",
    "Melhor Jogo de Esporte / Corrida",
    "Melhor Jogo Multiplayer",
    "Melhor Adaptação",
    "Jogo Mais Aguardado de 2025"
]

def ensure_csv_exists():
    """Garante que o arquivo CSV existe com os cabeçalhos corretos"""
    # Cria o diretório data se não existir
    os.makedirs(os.path.dirname(CSV_FILE), exist_ok=True)
    
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            headers = ['Nickname', 'Timestamp'] + CATEGORIES
            writer.writerow(headers)
        print(f"Arquivo {CSV_FILE} criado com cabeçalhos")

def load_config():
    """Carrega configuração do arquivo JSON"""
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r', encoding='utf-8') as file:
                return json.load(file)
        return {"show_results": True}
    except Exception:
        return {"show_results": True}

def save_config(config):
    """Salva configuração no arquivo JSON"""
    try:
        os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
        with open(CONFIG_FILE, 'w', encoding='utf-8') as file:
            json.dump(config, file, indent=2, ensure_ascii=False)
        return True
    except Exception:
        return False

@app.route('/api/vote', methods=['POST'])
def save_vote():
    """Endpoint para salvar um novo voto"""
    try:
        # Recebe os dados JSON da requisição
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
        
        # Valida os campos obrigatórios
        if 'nickname' not in data or 'votes' not in data:
            return jsonify({"error": "Campos 'nickname' e 'votes' são obrigatórios"}), 400
        
        nickname = data['nickname']
        timestamp = data.get('timestamp', datetime.now().isoformat())
        votes = data['votes']
        
        # Garante que o arquivo CSV existe
        ensure_csv_exists()
        
        # Prepara a linha para adicionar ao CSV
        row = [nickname, timestamp]
        
        # Adiciona os votos na ordem correta das categorias
        for category in CATEGORIES:
            vote = votes.get(category, "")  # String vazia se não houver voto para a categoria
            row.append(vote)
        
        # Adiciona a nova linha ao arquivo CSV
        with open(CSV_FILE, 'a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(row)
        
        print(f"Voto salvo para {nickname}")
        return jsonify({"status": "success", "message": "Voto salvo com sucesso"}), 201
        
    except Exception as e:
        print(f"Erro ao salvar voto: {str(e)}")
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@app.route('/api/votes', methods=['GET'])
def get_all_votes():
    """Endpoint para obter todos os votos"""
    try:
        # Verifica se o arquivo existe
        if not os.path.exists(CSV_FILE):
            return jsonify([]), 200
        
        votes_list = []
        
        # Lê o arquivo CSV
        with open(CSV_FILE, 'r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                # Constrói o objeto de voto
                vote_obj = {
                    "nickname": row.get('Nickname', ''),
                    "timestamp": row.get('Timestamp', ''),
                    "votes": {}
                }
                
                # Adiciona os votos de cada categoria
                for category in CATEGORIES:
                    vote_value = row.get(category, '')
                    if vote_value:  # Só adiciona se não for string vazia
                        vote_obj["votes"][category] = vote_value
                
                votes_list.append(vote_obj)
        
        return jsonify(votes_list), 200
        
    except Exception as e:
        print(f"Erro ao ler votos: {str(e)}")
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@app.route('/api/delete', methods=['POST'])
def delete_votes():
    """Endpoint para deletar votos de um usuário específico"""
    try:
        # Tenta obter dados de diferentes formas para aceitar diversos Content-Types
        data = None
        
        # Primeiro tenta JSON normal
        if request.is_json:
            data = request.get_json()
        # Se não conseguir, força a leitura como JSON
        else:
            try:
                data = request.get_json(force=True)
            except:
                # Se ainda não conseguir, tenta como form data
                if request.form:
                    data = request.form.to_dict()
                # Última tentativa: dados raw
                elif request.data:
                    try:
                        data = json.loads(request.data.decode('utf-8'))
                    except:
                        pass
        
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
        
        # Obtém o nickname a ser deletado
        nickname = data.get('nickname', '').strip()
        
        if not nickname:
            return jsonify({"error": "Campo 'nickname' é obrigatório"}), 400
        
        # Verifica se o arquivo existe
        if not os.path.exists(CSV_FILE):
            return jsonify({"error": "Arquivo de votos não encontrado"}), 404
        
        # Se nickname for "all", apaga todos os votos
        if nickname.lower() == "all":
            # Apaga todo o conteúdo e reescreve apenas os cabeçalhos
            with open(CSV_FILE, 'w', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)
                headers = ['Nickname', 'Timestamp'] + CATEGORIES
                writer.writerow(headers)
            
            print("Todos os votos foram apagados do arquivo CSV")
            return jsonify({"status": "success", "message": "Todos os votos foram apagados com sucesso"}), 200
        
        # Caso contrário, deleta apenas o usuário específico
        temp_rows = []
        deleted_count = 0
        
        # Lê o arquivo e filtra as linhas
        with open(CSV_FILE, 'r', newline='', encoding='utf-8') as file:
            reader = csv.reader(file)
            headers = next(reader)  # Lê o cabeçalho
            temp_rows.append(headers)
            
            for row in reader:
                if len(row) > 0 and row[0].strip().lower() != nickname.lower():
                    temp_rows.append(row)
                else:
                    deleted_count += 1
        
        # Reescreve o arquivo sem as linhas do usuário especificado
        with open(CSV_FILE, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerows(temp_rows)
        
        if deleted_count > 0:
            print(f"Deletados {deleted_count} voto(s) do usuário '{nickname}'")
            return jsonify({
                "status": "success", 
                "message": f"Deletados {deleted_count} voto(s) do usuário '{nickname}'"
            }), 200
        else:
            return jsonify({
                "status": "info", 
                "message": f"Nenhum voto encontrado para o usuário '{nickname}'"
            }), 404
        
    except Exception as e:
        print(f"Erro ao deletar votos: {str(e)}")
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@app.route('/api/config', methods=['GET'])
def get_config():
    """Retorna configurações da aplicação"""
    try:
        config = load_config()
        return jsonify({
            'status': 'success',
            'config': {
                'showResults': config.get('show_results', True)
            }
        }), 200
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@app.route('/api/toggle-results', methods=['POST'])
def toggle_results():
    """Liga ou desliga a exibição dos resultados"""
    try:
        config = load_config()
        current_state = config.get('show_results', True)
        new_state = not current_state
        config['show_results'] = new_state
        
        if save_config(config):
            return jsonify({
                'status': 'success',
                'show_results': new_state
            }), 200
        else:
            return jsonify({'error': 'Erro ao salvar configuração'}), 500
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint para verificar se a API está funcionando"""
    return jsonify({"status": "API funcionando!", "timestamp": datetime.now().isoformat()}), 200

# Rotas para servir o frontend React
@app.route('/')
def serve_react_app():
    """Serve a página principal do React"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_react_static(path):
    """Serve arquivos estáticos do React"""
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # Para Single Page Application, sempre retorna index.html para rotas não encontradas
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    print("Iniciando servidor Flask...")
    print("Categorias configuradas:", len(CATEGORIES))
    ensure_csv_exists()
    
    if not os.path.exists(CONFIG_FILE):
        save_config({"show_results": True})
    
    # Configuração para produção ou desenvolvimento
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') != 'production'
    host = '0.0.0.0'
    
    print(f"Servidor rodando em http://{host}:{port}")
    if not debug:
        print("Modo: PRODUÇÃO")
    else:
        print("Modo: DESENVOLVIMENTO")
    
    app.run(debug=debug, host=host, port=port)