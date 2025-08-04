# backend/dashboard/services/indicadores/funcionario_service.py
from django.db import connections

def listar_funcionarios(search='', limit=20):
    """
    Lista funcionarios com base no termo de busca
    Retorna apenas funcionarios ativos com campos relevantes para o cadastro
    """
    with connections['dados_industria'].cursor() as cursor:
        cursor.execute("""
            SELECT TOP (%s)
                f.CodFuncionario,
                f.Funcionario,
                f.Vendedor,
                f.Supervisor,
                f.Transportador,
                f.TransportadorAux,
                f.Entregador,
                f.Cobrador,
                f.Gerente,
                f.UnidGestora,
                f.email
            FROM Funcionario f
            WHERE f.Ativo = 1
              AND f.Funcionario LIKE %s
            ORDER BY f.Funcionario
        """, [limit, f'%{search}%'])
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]

def obter_funcionario_por_codigo(cod_funcionario):
    """
    Obtem os dados de um funcionario especifico pelo codigo
    """
    with connections['dados_industria'].cursor() as cursor:
        cursor.execute("""
            SELECT 
                CodFuncionario,
                Funcionario,
                Vendedor,
                Supervisor,
                Transportador,
                TransportadorAux,
                Entregador,
                Cobrador,
                Gerente,
                UnidGestora,
                email
            FROM Funcionario
            WHERE CodFuncionario = %s
              AND Ativo = 1
        """, [cod_funcionario])

        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        return dict(zip(columns, rows[0])) if rows else None
