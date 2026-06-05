# backend/dashboard/services/indicadores/rotas_simples.py
from typing import Dict, Any, List
from dashboard.db_conn import query_all  # usa a conexão pyodbc via FreeTDS
import logging
logger = logging.getLogger(__name__)


def buscar_rotas_usuario(ctx, db_alias: str = "dados_industria") -> Dict[str, Any]:
    """
    Regras:
      - Admin             -> não filtra (rotas=None).
      - Supervisor        -> rotas das áreas que supervisiona (S.Ativa=1 e V.Ativa=1).
      - Supervisor+Gerente-> rotas das áreas em que é supervisor OU gerente,
                             agrupadas por área de supervisão.
      - Vendedor          -> rotas das áreas de venda onde ele é o vendedor (R.Ativa=1).
    """
    is_admin = bool(getattr(ctx, "is_admin", False))
    is_supervisor = bool(getattr(ctx, "is_supervisor", False))
    is_vendedor = bool(getattr(ctx, "is_vendedor", False))
    cod_func = getattr(ctx, "cod_funcionario", None)

    # ====================
    # 1) ADMIN → sem filtro
    # ====================
    if is_admin:
        sql = """
            SELECT
                S.CodAreaSupervisao,
                S.AreaSupervisao,
                S.CodSupervisor,
                S.CodGerente,
                F.Nome          AS NomeSupervisor,
                R.CodRota,
                R.Rota,
                V.CodVendedor
            FROM dbo.AreaSupervisao S
            INNER JOIN dbo.AreaVenda V ON S.CodAreaSupervisao = V.CodAreaSupervisao
            INNER JOIN dbo.Rota R ON R.CodAreaVenda = V.CodAreaVenda
            LEFT JOIN dbo.Funcionario F on F.CodFuncionario = S.CodSupervisor
            WHERE S.Ativa = 1
              AND V.Ativa = 1
        """
        dados = query_all(sql)

        rotas = [int(d["CodRota"]) for d in dados] if dados else []
        vendedores = sorted(
            {int(d["CodVendedor"]) for d in dados if d.get("CodVendedor") is not None}
        )

        # ==== Agrupar TODAS as áreas de supervisão ====
        grupos = {}
        for row in dados:
            cod_area = row.get("CodAreaSupervisao")
            if cod_area is None:
                continue

            cod_area = int(cod_area)
            if cod_area not in grupos:
                grupos[cod_area] = {
                    "cod_area_supervisao": cod_area,
                    "area_supervisao": row.get("AreaSupervisao"),
                    "cod_supervisor": row.get("CodSupervisor"),
                    "cod_gerente": row.get("CodGerente"),
                    "nome_supervisor": row.get("NomeSupervisor"),
                    "rotas": set(),
                    "vendedores": set(),
                }

            g = grupos[cod_area]
            if row.get("CodRota") is not None:
                g["rotas"].add(int(row["CodRota"]))
            if row.get("CodVendedor") is not None:
                g["vendedores"].add(int(row["CodVendedor"]))

        areas_supervisao = []
        for g in grupos.values():
            g["rotas"] = sorted(g["rotas"])
            g["vendedores"] = sorted(g["vendedores"])
            areas_supervisao.append(g)

        return {
            "rotas": rotas,
            "vendedores": vendedores,
            "detalhado": dados,
            "e_gerente": True,
            "areas_supervisao": areas_supervisao,
        }

    # ====================
    # 2) SUPERVISOR (com ou sem gerente)
    # ====================
    if is_supervisor:
        if not cod_func:
            return {
                "rotas": [],
                "vendedores": [],
                "detalhado": [],
                "e_gerente": False,
                "areas_supervisao": None,
            }

        cod_sup = int(cod_func)  # sanitiza

        # 2.1) Checa se este supervisor também é gerente em alguma área ativa
        sql_check_gerente = """
            SELECT TOP 1 1 AS EGerente
            FROM dbo.AreaSupervisao
            WHERE Ativa = 1
              AND CodGerente = ?
        """
        row_gerente = query_all(sql_check_gerente, [cod_sup])
        e_gerente = bool(row_gerente)

        # ========================
        # 2.2) Supervisor + Gerente
        # ========================
        if e_gerente:
            # Aqui buscamos TODAS as áreas em que ele é supervisor OU gerente
            sql = """
                SELECT
                    S.CodAreaSupervisao,
                    S.AreaSupervisao,
                    S.CodSupervisor,
                    S.CodGerente,
                    F.Nome          AS NomeSupervisor,
                    R.CodRota,
                    R.Rota,
                    V.CodVendedor
                FROM dbo.AreaSupervisao S
                INNER JOIN dbo.AreaVenda V ON S.CodAreaSupervisao = V.CodAreaSupervisao
                INNER JOIN dbo.Rota R ON R.CodAreaVenda = V.CodAreaVenda
                INNER JOIN dbo.Funcionario F on F.CodFuncionario = S.CodSupervisor
                WHERE S.Ativa = 1
                  AND V.Ativa = 1
                  AND (S.CodSupervisor = ? OR S.CodGerente = ?)
            """
            dados: List[Dict[str, Any]] = query_all(sql, [cod_sup, cod_sup])

            # rotas e vendedores (mesmo comportamento que antes)
            rotas = [int(d["CodRota"]) for d in dados] if dados else []
            vendedores = sorted(
                {int(d["CodVendedor"]) for d in dados if d.get("CodVendedor") is not None}
            )

            # ==== NOVO: agrupar por área de supervisão ====
            # Estrutura de saída:
            # areas_supervisao = [
            #   {
            #     "cod_area_supervisao": ...,
            #     "area_supervisao": ...,
            #     "cod_supervisor": ...,
            #     "cod_gerente": ...,
            #     "nome_supervisor": ...,
            #     "rotas": [codRota1, codRota2, ...],
            #     "vendedores": [codVend1, codVend2, ...],
            #   },
            #   ...
            # ]
            grupos: Dict[int, Dict[str, Any]] = {}

            for row in dados:
                cod_area = row.get("CodAreaSupervisao")
                if cod_area is None:
                    continue

                cod_area = int(cod_area)
                # cria o "bucket" da área se ainda não existir
                if cod_area not in grupos:
                    grupos[cod_area] = {
                        "cod_area_supervisao": cod_area,
                        "area_supervisao": row.get("AreaSupervisao"),
                        "cod_supervisor": row.get("CodSupervisor"),
                        "cod_gerente": row.get("CodGerente"),
                        "nome_supervisor": row.get("NomeSupervisor"),
                        "rotas": set(),        # sets temporários, convertidos depois
                        "vendedores": set(),
                    }

                g = grupos[cod_area]
                # adiciona rota
                if row.get("CodRota") is not None:
                    g["rotas"].add(int(row["CodRota"]))
                # adiciona vendedor
                if row.get("CodVendedor") is not None:
                    g["vendedores"].add(int(row["CodVendedor"]))

            # converte os sets para listas ordenadas (para serializar em JSON)
            areas_supervisao = []
            for g in grupos.values():
                g["rotas"] = sorted(g["rotas"])
                g["vendedores"] = sorted(g["vendedores"])
                areas_supervisao.append(g)

            return {
                "rotas": rotas,
                "vendedores": vendedores,
                "detalhado": dados,
                "e_gerente": True,
                "areas_supervisao": areas_supervisao,
            }

        # ========================
        # 2.3) Supervisor "normal" (não é gerente)
        # ========================
        sql = """
            SELECT
                R.CodRota,
                R.Rota,
                V.CodVendedor
            FROM dbo.AreaSupervisao S
            INNER JOIN dbo.AreaVenda V ON S.CodAreaSupervisao = V.CodAreaSupervisao
            INNER JOIN dbo.Rota R ON R.CodAreaVenda = V.CodAreaVenda
            WHERE S.Ativa = 1
              AND V.Ativa = 1
              AND S.CodSupervisor = ?
        """
        dados: List[Dict[str, Any]] = query_all(sql, [cod_sup])

        rotas = [int(d["CodRota"]) for d in dados] if dados else []
        vendedores_set = {int(d["CodVendedor"]) for d in dados if d.get("CodVendedor") is not None}

        sql_inativos = """
            SELECT CodFuncionario 
            FROM dbo.Funcionario 
            WHERE Vendedor = 1 AND CodSupervisor = ?
        """
        dados_inativos = query_all(sql_inativos, [cod_sup])
        
        logger.warning(f"🚨 [DEBUG ROTAS_SIMPLES 2.3] cod_sup={cod_sup} | inativos={dados_inativos}")
        
        vendedores_set.update({int(d["CodFuncionario"]) for d in dados_inativos if d.get("CodFuncionario") is not None})
        vendedores = sorted(vendedores_set)

        return {
            "rotas": rotas,
            "vendedores": vendedores,
            "detalhado": dados,
            "e_gerente": False,
            "areas_supervisao": None,  # não é gerente, não faz sentido agrupar
        }

    # ====================
    # 3) VENDEDOR
    # ====================
    if is_vendedor:
        if not cod_func:
            return {
                "rotas": [],
                "vendedores": [],
                "detalhado": [],
                "e_gerente": False,
                "areas_supervisao": None,
            }

        cod_vend = int(cod_func)

        sql = """
            SELECT
                R.CodRota,
                V.CodVendedor
            FROM dbo.AreaVenda V
            INNER JOIN dbo.Funcionario F ON V.CodVendedor = F.CodFuncionario
            INNER JOIN dbo.Rota R ON R.CodAreaVenda = V.CodAreaVenda
            WHERE F.CodFuncionario = ?
              AND R.Ativa = 1
        """
        dados: List[Dict[str, Any]] = query_all(sql, [cod_vend])

        rotas = [int(d["CodRota"]) for d in dados] if dados else []

        return {
            "rotas": rotas,
            "vendedores": [cod_vend],
            "detalhado": dados,
            "e_gerente": False,
            "areas_supervisao": None,
        }

    # ====================
    # 4) Outros papéis (sem filtro)
    # ====================
    return {
        "rotas": None,
        "vendedores": None,
        "detalhado": [],
        "e_gerente": False,
        "areas_supervisao": None,
    }


def buscar_vendedores_mesma_supervisao(
    cod_vendedor: int, db_alias: str = "dados_industria"
) -> List[int]:
    """
    Retorna os CodVendedor que pertencem à mesma Área de Supervisão do 'cod_vendedor' informado (apenas ativos).
    """
    if cod_vendedor is None:
        return []

    cod_vend = int(cod_vendedor)

    sql = """
        WITH Base AS (
            SELECT TOP 1 CodAreaSupervisao
            FROM dbo.AreaVenda
            WHERE CodVendedor = ?
        )
        SELECT DISTINCT V.CodVendedor
        FROM dbo.AreaVenda V
        CROSS JOIN Base B
        WHERE V.CodAreaSupervisao = B.CodAreaSupervisao
          AND V.Ativa = 1
    """
    rows = query_all(sql, [cod_vend])

    # Normaliza para int e remove nulos
    return sorted(
        {int(r["CodVendedor"]) for r in rows if r.get("CodVendedor") is not None}
    )
