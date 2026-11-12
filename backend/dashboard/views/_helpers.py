"""Funções utilitárias compartilhadas pelas views (conversão de tipos e datas).

Movidas de main_views.py sem alteração de lógica.
"""
from datetime import datetime
from decimal import Decimal


def _to_int(v):
    try:
        return int(str(v).strip())
    except (TypeError, ValueError):
        return None


def _to_float(v):
    try:
        return float(v or 0)
    except (TypeError, ValueError):
        return 0.0


def _num(v):
    try:
        return float(v or 0)
    except (TypeError, ValueError):
        return 0.0


def _to_float_safe(v):
    # Decimal -> float, string número -> float, None -> 0.0
    try:
        if isinstance(v, Decimal):
            return float(v)
        return float(v or 0)
    except Exception:
        return 0.0


def _to_int_list(seq):
    out = []
    for v in (seq or []):
        try:
            out.append(int(str(v).strip()))
        except (TypeError, ValueError):
            pass
    return out


def safe_divide(numerator, denominator, default=0):
    try:
        numerator = float(numerator)
        denominator = float(denominator)
        if denominator == 0:
            return default
        return numerator / denominator
    except (TypeError, ValueError):
        return default


def _meses_no_periodo(data_inicio: str, data_fim: str):
    """Retorna lista de date(YYYY, MM, 1) para cada mês dentro do período."""
    ini = datetime.strptime(data_inicio, "%Y-%m-%d").date().replace(day=1)
    fim = datetime.strptime(data_fim,    "%Y-%m-%d").date().replace(day=1)
    meses = []
    cur = ini
    while cur <= fim:
        meses.append(cur)
        # avança para o próximo mês
        if cur.month == 12:
            cur = cur.replace(year=cur.year + 1, month=1)
        else:
            cur = cur.replace(month=cur.month + 1)
    return meses


def ajustar_data_para_ano_anterior(data_str):
    data_atual = datetime.strptime(data_str, "%Y-%m-%d")
    try:
        return data_atual.replace(year=data_atual.year - 1).strftime("%Y-%m-%d")
    except ValueError:
        # Se o dia não existir (ex: 29/02 em ano não bissexto), ajusta para 28/02
        return data_atual.replace(year=data_atual.year - 1, day=28).strftime("%Y-%m-%d")
