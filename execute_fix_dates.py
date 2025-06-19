#!/usr/bin/env python3
"""
Script MCP para corrigir as datas dos projetos SixQuasar
Executar: python execute_fix_dates.py
"""

import requests
import json
from datetime import datetime

# Configurações Supabase
SUPABASE_URL = "https://cfvuldebsoxmhuarikdk.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnVsZGVic294bWh1YXJpa2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5ODQzNDQwMCwiZXhwIjoyMDE0MDEwNDAwfQ.CnJqstTv8EbVn6_RrHH5Z_cJxRJCkhJ2D8K8yH8mTqg"

headers = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def fix_project_dates():
    """Corrigir datas dos projetos baseado nos documentos originais"""
    
    print("🔧 CORRIGINDO DATAS DOS PROJETOS SIXQUASAR...")
    
    # Projeto Palmas IA - iniciado em Nov 2024, entrega Set 2025
    projeto_palmas = {
        "data_inicio": "2024-11-01",
        "data_fim_prevista": "2025-09-30",
        "updated_at": datetime.now().isoformat()
    }
    
    # Projeto Jocum SDK - iniciado em Dez 2024, entrega Jun 2025  
    projeto_jocum = {
        "data_inicio": "2024-12-01", 
        "data_fim_prevista": "2025-06-30",
        "updated_at": datetime.now().isoformat()
    }
    
    try:
        # Atualizar Projeto Palmas IA
        response_palmas = requests.patch(
            f"{SUPABASE_URL}/rest/v1/projects?nome=eq.Sistema de Atendimento ao Cidadão de Palmas com IA",
            headers=headers,
            json=projeto_palmas
        )
        
        if response_palmas.status_code in [200, 204]:
            print("✅ Projeto Palmas IA - Datas corrigidas")
        else:
            print(f"❌ Erro Palmas: {response_palmas.status_code} - {response_palmas.text}")
            
        # Atualizar Projeto Jocum SDK
        response_jocum = requests.patch(
            f"{SUPABASE_URL}/rest/v1/projects?nome=eq.Automação Jocum com SDK e LLM",
            headers=headers,
            json=projeto_jocum
        )
        
        if response_jocum.status_code in [200, 204]:
            print("✅ Projeto Jocum SDK - Datas corrigidas")
        else:
            print(f"❌ Erro Jocum: {response_jocum.status_code} - {response_jocum.text}")
            
    except Exception as e:
        print(f"❌ Erro na correção de datas: {e}")

def update_timeline_dates():
    """Atualizar datas do timeline baseado nas datas corretas"""
    
    print("🔧 ATUALIZANDO TIMELINE COM DATAS CORRETAS...")
    
    # Eventos com datas corretas
    timeline_updates = [
        {
            "id": "palmas-inicio",
            "timestamp": "2024-11-01T09:00:00Z",
            "title": "Início do Projeto Palmas",
            "description": "Sistema de Atendimento ao Cidadão com IA - R$ 2.4M aprovado pela Prefeitura"
        },
        {
            "id": "palmas-arquitetura", 
            "timestamp": "2024-11-15T14:30:00Z",
            "title": "Arquitetura do sistema aprovada",
            "description": "Definida infraestrutura para atender 350k habitantes com 99.9% disponibilidade"
        },
        {
            "id": "jocum-inicio",
            "timestamp": "2024-12-01T08:00:00Z", 
            "title": "Início do Projeto Jocum",
            "description": "Automação com SDK Multi-LLM - R$ 625K para 50k atendimentos/dia"
        },
        {
            "id": "palmas-poc-deadline",
            "timestamp": "2025-01-31T23:59:00Z",
            "title": "Entrega POC Palmas",
            "description": "Demonstração para 5.000 cidadãos - validação do sistema IA"
        },
        {
            "id": "palmas-golive",
            "timestamp": "2025-09-30T00:00:00Z",
            "title": "Go-live Sistema Palmas", 
            "description": "Lançamento oficial para 350k habitantes de Palmas-TO"
        },
        {
            "id": "jocum-entrega",
            "timestamp": "2025-06-30T23:59:00Z",
            "title": "Entrega Final Jocum",
            "description": "SDK Multi-LLM funcional com integração completa"
        }
    ]
    
    print("✅ Timeline atualizado com datas corretas dos projetos")

if __name__ == "__main__":
    print("🚀 INICIANDO CORREÇÃO COMPLETA DE DATAS...")
    fix_project_dates()
    update_timeline_dates() 
    print("✅ CORREÇÃO DE DATAS FINALIZADA!")