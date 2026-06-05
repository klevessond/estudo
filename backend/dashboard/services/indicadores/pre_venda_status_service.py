# backend/dashboard/services/indicadores/pre_venda_status_service.py
from __future__ import annotations

from typing import Iterable, Optional, List, Dict, Any
from datetime import datetime, timedelta, date

from dashboard.db_conn import query_all


# ─── utilidades locais ────────────────────────────────────────────

def _validar_data(data: str | date) -> date:
    if isinstance(data, date):
        return data
    return datetime.strptime(str(data), "%Y-%m-%d").date()


def _dt_bounds(data_inicio: str | date, data_fim: str | date):
    di = _validar_data(data_inicio)
    df = _validar_data(data_fim) + timedelta(days=1)
    return di, df


# ─── serviço principal ───────────────────────────────────────────

def buscar_status_pre_vendas(
    data_inicio: str | date,
    data_fim: str | date,
    cod_vendedores: Optional[Iterable[int]] = None,  # None = todos (gerente)
) -> List[Dict[str, Any]]:
    """
    Retorna as pré-vendas do período com seu status de processamento.

    Regras de negócio:
      - Sem registro em PocketDocProcessDoc  → situacao = 'NAO_PROCESSADA'
      - Com registro e Status <> 10          → situacao = 'COM_PROBLEMA'
        (exibe o campo Observacao como motivo)
      - Com registro e Status = 10           → OK, NÃO retornado

    Filtro de acesso:
      - cod_vendedores=None   → sem filtro (gerente vê todos)
      - cod_vendedores=[...]  → supervisor/vendedor vê apenas os seus

    Retorno por item:
    {
        "CodPocket":       int,
        "CodPocketDocumento": int,
        "CodVendedor":     int,
        "Funcionario":     str,
        "Cliente":         str,
        "DataDoc":         str (YYYY-MM-DD),
        "Valor":           float,
        "Situacao":        "NAO_PROCESSADA" | "COM_PROBLEMA",
        "Motivo":          str | None,   # None quando NAO_PROCESSADA
        "StatusCodigo":    int | None,   # código retornado pelo PocketDocProcessDoc
    }
    """
    di, df = _dt_bounds(data_inicio, data_fim)

    # Monta filtro de vendedores
    vend_filter = ""
    if cod_vendedores:
        v = [int(x) for x in cod_vendedores if x is not None]
        v = list(dict.fromkeys(v))
        if v:
            vend_filter = f"AND PD.CodVendedor IN ({','.join(map(str, v))})"

    sql = f"""
        DECLARE @P1 DATE = '{di:%Y-%m-%d}';
        DECLARE @P2 DATE = '{df:%Y-%m-%d}';

        SELECT
            PD.CodPocket,
            PD.Coddoc,
            PD.CodVendedor,
            F.Funcionario,
            C.Cliente,
            C.ClienteFantasia,
            CONVERT(VARCHAR(10), PD.DataDoc, 120)   AS DataDoc,
            ISNULL(PD.Valor, 0)                     AS Valor,

            -- Status retornado pelo processamento (NULL = nunca processado)
            DPPC.Status                             AS StatusProcessamento,
            DPPC.Observacao                         AS ObservacaoProcessamento,

            CASE
                WHEN DPPC.CodPocket IS NULL THEN 'NAO_PROCESSADA'
                WHEN DPPC.Status <> 10      THEN 'COM_PROBLEMA'
                ELSE                             'OK'
            END AS Situacao

        FROM PocketDocumento PD
        LEFT JOIN PocketDocProcessDoc DPPC
            ON  DPPC.CodPocket          = PD.CodPocket
            AND DPPC.CodPocketDocumento = PD.Coddoc

        JOIN Funcionario        F    ON PD.CodVendedor         = F.CodFuncionario
        JOIN Cliente            C    ON PD.CodCliente          = C.CodCliente
        JOIN TipoDocumento      TD   ON PD.CodTipoDoc          = TD.CodTipoDoc
        JOIN NaturezaOperacao   NOPE ON TD.CodNaturezaOperacao = NOPE.CodNaturezaOperacao

        WHERE PD.Status IN (0, 1)
          AND NOPE.Venda        = 1
          AND TD.TipoOperacao  <> 4
          AND (
              ISNULL(PD.UnidGestora, 0) = 0
              OR PD.UnidGestora IN (
                  SELECT UnidGestora FROM UserUsuarioUnidade WHERE ID = 'ESIGMA'
              )
          )
          AND PD.DataDoc >= @P1
          AND PD.DataDoc  < @P2
          -- exclui as que processaram OK → não há nada a mostrar
          AND (DPPC.CodPocket IS NULL OR DPPC.Status <> 10)
          {vend_filter}

        ORDER BY F.Funcionario, PD.DataDoc, C.Cliente
    """

    rows = query_all(sql)

    resultado = []
    for r in rows:
        situacao = (r.get("Situacao") or "NAO_PROCESSADA").strip()
        obs_raw  = (r.get("ObservacaoProcessamento") or "").strip()

        resultado.append({
            "CodPocket":           int(r.get("CodPocket")           or 0),
            "CodPocketDocumento":  int(r.get("CodPocketDocumento")  or 0),
            "CodVendedor":         int(r.get("CodVendedor")         or 0),
            "Funcionario":  (r.get("Funcionario")    or "").strip(),
            "Cliente":      (r.get("Cliente")        or "").strip(),
            "ClienteFantasia": (r.get("ClienteFantasia") or "").strip(),
            "DataDoc":      (r.get("DataDoc")        or ""),
            "Valor":        round(float(r.get("Valor") or 0), 2),
            "Situacao":     situacao,
            # Motivo só exibe quando há problema; NAO_PROCESSADA não tem obs
            "Motivo":       obs_raw if situacao == "COM_PROBLEMA" and obs_raw else None,
            "StatusCodigo": int(r.get("StatusProcessamento")) if r.get("StatusProcessamento") is not None else None,
        })

    return resultado
