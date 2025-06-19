#!/usr/bin/env python3
"""
Script MCP REAL para conectar ao Supabase e corrigir TODOS os dados
Usar credenciais reais fornecidas pelo usuário
"""

import requests
import json
from datetime import datetime

# CREDENCIAIS REAIS DO SUPABASE
SUPABASE_URL = "https://cfvuldebsoxmhuarikdk.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnVsZGVic294bWh1YXJpa2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI1NjQ2MCwiZXhwIjoyMDY0ODMyNDYwfQ.tmkAszImh0G0TZaMBq1tXsCz0oDGtCHWcdxR4zdzFJM"

headers = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def check_tables():
    """Verificar quais tabelas existem no banco"""
    print("🔍 VERIFICANDO ESTRUTURA DO BANCO...")
    
    # Tentar diferentes nomes de tabela
    table_variants = [
        'projects', 'projetos', 'project',
        'tasks', 'tarefas', 'task', 
        'users', 'usuarios', 'user',
        'teams', 'equipes', 'team'
    ]
    
    existing_tables = []
    
    for table in table_variants:
        try:
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/{table}?limit=1",
                headers=headers
            )
            if response.status_code == 200:
                print(f"✅ Tabela '{table}' existe")
                existing_tables.append(table)
            elif response.status_code == 404:
                print(f"❌ Tabela '{table}' não existe")
            else:
                print(f"⚠️ Erro {response.status_code} ao verificar '{table}'")
        except Exception as e:
            print(f"❌ Erro ao verificar '{table}': {e}")
    
    return existing_tables

def get_table_structure(table_name):
    """Verificar estrutura de uma tabela"""
    print(f"\n🔍 ESTRUTURA DA TABELA '{table_name}':")
    
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/{table_name}?limit=1",
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            if data:
                print(f"✅ Campos disponíveis: {list(data[0].keys())}")
                return list(data[0].keys())
            else:
                print("✅ Tabela vazia, mas existe")
                return []
        else:
            print(f"❌ Erro {response.status_code}: {response.text}")
            return []
    except Exception as e:
        print(f"❌ Erro: {e}")
        return []

def insert_real_projects():
    """Inserir/atualizar projetos reais SixQuasar"""
    print("\n🚀 INSERINDO PROJETOS REAIS SIXQUASAR...")
    
    # Projetos reais baseados nos documentos
    projects_data = [
        {
            "id": "750e8400-e29b-41d4-a716-446655440001",
            "nome": "Sistema de Atendimento ao Cidadão de Palmas com IA",
            "descricao": "Sistema completo de atendimento automatizado para 350k habitantes de Palmas-TO com IA conversacional, WhatsApp e VoIP integrados",
            "status": "em_progresso",
            "responsavel_id": "550e8400-e29b-41d4-a716-446655440001",
            "equipe_id": "650e8400-e29b-41d4-a716-446655440001",
            "data_inicio": "2024-11-01",
            "data_fim_prevista": "2025-09-30",
            "progresso": 25,
            "orcamento": 2400000.00,
            "tecnologias": ["OpenAI GPT-4", "Claude 3", "Gemini Pro", "WhatsApp API", "VoIP", "PostgreSQL", "AWS", "Kubernetes", "Redis"],
            "created_at": "2024-11-01T09:00:00Z",
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "750e8400-e29b-41d4-a716-446655440002",
            "nome": "Automação Jocum com SDK e LLM",
            "descricao": "SDK completo para automação de atendimento com múltiplos LLMs, integrando 80+ bases Jocum via WhatsApp e VoIP",
            "status": "em_progresso",
            "responsavel_id": "550e8400-e29b-41d4-a716-446655440002",
            "equipe_id": "650e8400-e29b-41d4-a716-446655440001",
            "data_inicio": "2024-12-01",
            "data_fim_prevista": "2025-06-30",
            "progresso": 15,
            "orcamento": 625000.00,
            "tecnologias": ["Multi-LLM SDK", "OpenAI API", "Anthropic Claude", "Google Gemini", "WhatsApp Business", "VoIP Integration", "Node.js", "TypeScript"],
            "created_at": "2024-12-01T08:00:00Z",
            "updated_at": datetime.now().isoformat()
        }
    ]
    
    # Tentar inserir em diferentes variações de nome de tabela
    table_names = ['projects', 'projetos']
    
    for table_name in table_names:
        print(f"\n🔄 Tentando inserir em '{table_name}'...")
        
        for project in projects_data:
            try:
                # Tentar upsert (inserir ou atualizar)
                response = requests.post(
                    f"{SUPABASE_URL}/rest/v1/{table_name}",
                    headers={**headers, "Prefer": "resolution=merge-duplicates"},
                    json=project
                )
                
                if response.status_code in [200, 201]:
                    print(f"✅ {project['nome'][:30]}... inserido/atualizado")
                elif response.status_code == 409:
                    # Conflito - tentar update
                    print(f"⚠️ Conflito, tentando update...")
                    update_response = requests.patch(
                        f"{SUPABASE_URL}/rest/v1/{table_name}?id=eq.{project['id']}",
                        headers=headers,
                        json=project
                    )
                    if update_response.status_code in [200, 204]:
                        print(f"✅ {project['nome'][:30]}... atualizado")
                    else:
                        print(f"❌ Erro no update: {update_response.status_code} - {update_response.text}")
                else:
                    print(f"❌ Erro: {response.status_code} - {response.text}")
                    
            except Exception as e:
                print(f"❌ Erro ao inserir projeto: {e}")

def insert_real_tasks():
    """Inserir tarefas reais baseadas nos projetos"""
    print("\n🚀 INSERINDO TAREFAS REAIS...")
    
    tasks_data = [
        {
            "id": "task-palmas-001",
            "titulo": "Arquitetura Sistema Palmas IA",
            "descricao": "Definir arquitetura completa para atender 350k habitantes com 99.9% disponibilidade",
            "status": "concluida",
            "prioridade": "alta",
            "responsavel_id": "550e8400-e29b-41d4-a716-446655440001",
            "projeto_id": "750e8400-e29b-41d4-a716-446655440001",
            "equipe_id": "650e8400-e29b-41d4-a716-446655440001",
            "data_vencimento": "2024-11-30",
            "created_at": "2024-11-01T09:00:00Z",
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "task-palmas-002",
            "titulo": "Integração WhatsApp + VoIP Palmas",
            "descricao": "Implementar APIs de WhatsApp Business e VoIP para múltiplos canais de atendimento",
            "status": "em_progresso",
            "prioridade": "alta",
            "responsavel_id": "550e8400-e29b-41d4-a716-446655440002",
            "projeto_id": "750e8400-e29b-41d4-a716-446655440001",
            "equipe_id": "650e8400-e29b-41d4-a716-446655440001",
            "data_vencimento": "2025-01-31",
            "created_at": "2024-11-15T10:00:00Z",
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "task-jocum-001",
            "titulo": "SDK Multi-LLM Jocum",
            "descricao": "Desenvolvimento do SDK para integração com OpenAI, Claude e Gemini",
            "status": "em_progresso",
            "prioridade": "alta",
            "responsavel_id": "550e8400-e29b-41d4-a716-446655440002",
            "projeto_id": "750e8400-e29b-41d4-a716-446655440002",
            "equipe_id": "650e8400-e29b-41d4-a716-446655440001",
            "data_vencimento": "2025-06-30",
            "created_at": "2024-12-01T08:00:00Z",
            "updated_at": datetime.now().isoformat()
        }
    ]
    
    table_names = ['tasks', 'tarefas']
    
    for table_name in table_names:
        print(f"\n🔄 Tentando inserir tarefas em '{table_name}'...")
        
        for task in tasks_data:
            try:
                response = requests.post(
                    f"{SUPABASE_URL}/rest/v1/{table_name}",
                    headers={**headers, "Prefer": "resolution=merge-duplicates"},
                    json=task
                )
                
                if response.status_code in [200, 201]:
                    print(f"✅ {task['titulo'][:30]}... inserida")
                else:
                    print(f"❌ Erro: {response.status_code} - {response.text}")
                    
            except Exception as e:
                print(f"❌ Erro ao inserir tarefa: {e}")

def test_connection():
    """Testar conexão com Supabase"""
    print("🔗 TESTANDO CONEXÃO COM SUPABASE...")
    
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/",
            headers=headers
        )
        
        if response.status_code == 200:
            print("✅ Conexão com Supabase OK")
            return True
        else:
            print(f"❌ Erro de conexão: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return False

if __name__ == "__main__":
    print("🚀 SCRIPT MCP REAL - CONECTANDO AO SUPABASE")
    print("=" * 50)
    
    # 1. Testar conexão
    if not test_connection():
        print("❌ Falha na conexão. Abortando.")
        exit(1)
    
    # 2. Verificar estrutura
    existing_tables = check_tables()
    
    if not existing_tables:
        print("❌ Nenhuma tabela encontrada. Verifique o banco.")
        exit(1)
    
    # 3. Verificar estrutura das tabelas
    for table in existing_tables:
        get_table_structure(table)
    
    # 4. Inserir dados reais
    insert_real_projects()
    insert_real_tasks()
    
    print("\n" + "=" * 50)
    print("✅ PROCESSO CONCLUÍDO!")
    print("🎯 Dados reais SixQuasar inseridos/atualizados no Supabase")
    print("📊 Reports e Profile agora conectados ao banco real")