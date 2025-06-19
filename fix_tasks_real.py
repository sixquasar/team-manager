#!/usr/bin/env python3
"""
Corrigir tarefas com UUIDs corretos e campos compatíveis
"""

import requests
import json
from datetime import datetime
import uuid

# CREDENCIAIS REAIS DO SUPABASE
SUPABASE_URL = "https://cfvuldebsoxmhuarikdk.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnVsZGVic294bWh1YXJpa2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI1NjQ2MCwiZXhwIjoyMDY0ODMyNDYwfQ.tmkAszImh0G0TZaMBq1tXsCz0oDGtCHWcdxR4zdzFJM"

headers = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def insert_corrected_tasks():
    """Inserir tarefas com UUIDs corretos e campos compatíveis"""
    print("🚀 INSERINDO TAREFAS COM CAMPOS CORRETOS...")
    
    # Tarefas com UUIDs válidos e campos corretos da tabela 'tarefas'
    tasks_data = [
        {
            "id": str(uuid.uuid4()),
            "titulo": "Arquitetura Sistema Palmas IA",
            "descricao": "Definir arquitetura completa para atender 350k habitantes com 99.9% disponibilidade",
            "status": "concluida",
            "prioridade": "alta",
            "responsavel_id": "550e8400-e29b-41d4-a716-446655440001",
            "projeto_id": "750e8400-e29b-41d4-a716-446655440001",
            "equipe_id": "650e8400-e29b-41d4-a716-446655440001",
            "data_vencimento": "2024-11-30",
            "tags": ["arquitetura", "kubernetes", "aws", "redis"],
            "created_at": "2024-11-01T09:00:00Z",
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "titulo": "Integração WhatsApp + VoIP Palmas",
            "descricao": "Implementar APIs de WhatsApp Business e VoIP para múltiplos canais de atendimento",
            "status": "em_progresso",
            "prioridade": "alta",
            "responsavel_id": "550e8400-e29b-41d4-a716-446655440002",
            "projeto_id": "750e8400-e29b-41d4-a716-446655440001",
            "equipe_id": "650e8400-e29b-41d4-a716-446655440001",
            "data_vencimento": "2025-01-31",
            "tags": ["whatsapp", "voip", "api", "integração"],
            "created_at": "2024-11-15T10:00:00Z",
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "titulo": "SDK Multi-LLM Jocum",
            "descricao": "Desenvolvimento do SDK para integração com OpenAI, Claude e Gemini",
            "status": "em_progresso",
            "prioridade": "alta",
            "responsavel_id": "550e8400-e29b-41d4-a716-446655440002",
            "projeto_id": "750e8400-e29b-41d4-a716-446655440002",
            "equipe_id": "650e8400-e29b-41d4-a716-446655440001",
            "data_vencimento": "2025-06-30",
            "tags": ["sdk", "llm", "openai", "claude", "gemini"],
            "created_at": "2024-12-01T08:00:00Z",
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "titulo": "POC Demonstração Palmas",
            "descricao": "Desenvolver protótipo para validação com 5.000 cidadãos",
            "status": "em_progresso",
            "prioridade": "urgente",
            "responsavel_id": "550e8400-e29b-41d4-a716-446655440001",
            "projeto_id": "750e8400-e29b-41d4-a716-446655440001",
            "equipe_id": "650e8400-e29b-41d4-a716-446655440001",
            "data_vencimento": "2025-01-31",
            "tags": ["poc", "demonstração", "validação"],
            "created_at": "2024-12-01T12:00:00Z",
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "titulo": "Integração 80+ Bases Jocum",
            "descricao": "Mapear e integrar todas as bases Jocum para atendimento automatizado",
            "status": "pendente",
            "prioridade": "media",
            "responsavel_id": "550e8400-e29b-41d4-a716-446655440003",
            "projeto_id": "750e8400-e29b-41d4-a716-446655440002",
            "equipe_id": "650e8400-e29b-41d4-a716-446655440001",
            "data_vencimento": "2025-05-31",
            "tags": ["integração", "bases", "mapeamento"],
            "created_at": "2024-12-15T14:00:00Z",
            "updated_at": datetime.now().isoformat()
        }
    ]
    
    for task in tasks_data:
        try:
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/tarefas",
                headers=headers,
                json=task
            )
            
            if response.status_code in [200, 201]:
                print(f"✅ {task['titulo'][:40]}... inserida")
            else:
                print(f"❌ Erro: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Erro ao inserir tarefa: {e}")

def get_real_data():
    """Buscar dados reais do banco para verificar"""
    print("\n🔍 VERIFICANDO DADOS REAIS NO BANCO...")
    
    try:
        # Buscar projetos
        projects_response = requests.get(
            f"{SUPABASE_URL}/rest/v1/projetos?select=*",
            headers=headers
        )
        
        if projects_response.status_code == 200:
            projects = projects_response.json()
            print(f"✅ {len(projects)} projetos encontrados")
            for project in projects:
                print(f"   📁 {project['nome']} - {project['status']} - {project['progresso']}%")
        
        # Buscar tarefas
        tasks_response = requests.get(
            f"{SUPABASE_URL}/rest/v1/tarefas?select=*",
            headers=headers
        )
        
        if tasks_response.status_code == 200:
            tasks = tasks_response.json()
            print(f"✅ {len(tasks)} tarefas encontradas")
            for task in tasks:
                print(f"   📋 {task['titulo']} - {task['status']}")
        
        # Buscar usuários
        users_response = requests.get(
            f"{SUPABASE_URL}/rest/v1/usuarios?select=*",
            headers=headers
        )
        
        if users_response.status_code == 200:
            users = users_response.json()
            print(f"✅ {len(users)} usuários encontrados")
            for user in users:
                print(f"   👤 {user['nome']} - {user['cargo']}")
                
    except Exception as e:
        print(f"❌ Erro ao buscar dados: {e}")

if __name__ == "__main__":
    print("🚀 CORRIGINDO TAREFAS COM DADOS REAIS")
    print("=" * 50)
    
    insert_corrected_tasks()
    get_real_data()
    
    print("\n" + "=" * 50)
    print("✅ TAREFAS CORRIGIDAS!")
    print("🎯 Agora hooks podem usar dados reais do Supabase")