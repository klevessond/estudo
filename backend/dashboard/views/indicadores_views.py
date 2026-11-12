"""Indicadores consolidados do dashboard (IndicadoresView).

Este arquivo era o antigo main_views.py; após a divisão por domínio,
restou aqui a IndicadoresView e seus helpers de cálculo. A quebra do
get() em partes menores é o próximo passo da refatoração (etapa 3).
"""
import logging
from collections import defaultdict
from datetime import date, datetime

from rest_framework.response import Response
from rest_framework.views import APIView

from dashboard.models import ObjetivoMixNivel
from dashboard.roles import get_role_context
from dashboard.services.indicadores.cache_aa import get_cache_aa, set_cache_aa
from dashboard.services.indicadores.cache_mes import get_cache_mes, set_cache_mes
from dashboard.services.indicadores.calculos_projecao import (
    calcular_matematica_projecao,
    get_dias_uteis_info,
)
from dashboard.services.indicadores.info_service import Todos_Vendedores, obter_cod_supervisor
from dashboard.services.indicadores.pdv_mix_service import buscar_mix_pdv_por_perfil
from dashboard.services.indicadores.pdv_service import buscar_cupons_por_vendedor, buscar_vendas_pdv
from dashboard.services.indicadores.rotas_simples import (
    buscar_rotas_usuario,
    buscar_vendedores_mesma_supervisao,
)
from dashboard.services.indicadores.ruptura_service import buscar_ruptura
from dashboard.services.indicadores.vendas_service import (
    buscar_mix_agregado,
    buscar_positivacao_por_rota,
    buscar_pre_venda,
    buscar_venda_mix,
    buscar_vendas_por_vendedor,
    buscar_vendido,
)
from dashboard.services.usuarios.funcionario_service import obter_unid_gestoras_por_vendedores

from ._helpers import (
    _meses_no_periodo,
    _num,
    _to_float,
    _to_float_safe,
    _to_int,
    safe_divide,
)
from .objetivos_views import (
    get_objetivo_mensal_serializado,
    get_objetivos_vendedores_por_mes,
)

logger = logging.getLogger(__name__)

def _calc_liquido_por_vendedor_por_rotas(ret_vendido: dict, rota_to_vendedor: dict):
    """
    ret_vendido: retorno do buscar_vendido (dict com 'detalhamento')
    rota_to_vendedor: dict {CodRota(int): CodVendedor(int)} (escopo do rotas_info['detalhado'])

    Retorna:
      {
        "valor_total": float,
        "por_vendedor": [
            {"CodVendedor": int, "Valor_liquido_total": float, "Rotas": [...]},
            ...
        ]
      }
    """
    det = (ret_vendido or {}).get("detalhamento") or []

    liquido_por_vendedor = {}
    rotas_por_vendedor = {}

    for row in det:
        # buscar_vendido pode vir com Codrota/CodRota ou CodCampo (dependendo do seu service)
        cod_rota_raw = row.get("Codrota", row.get("CodRota", row.get("CodCampo")))
        try:
            cod_rota = int(str(cod_rota_raw).strip())
        except (TypeError, ValueError):
            continue

        cod_vend = rota_to_vendedor.get(cod_rota)
        if cod_vend is None:
            continue  # rota fora do escopo do usuário

        try:
            cod_vend = int(str(cod_vend).strip())
        except (TypeError, ValueError):
            continue

        valor_prod = _to_float_safe(row.get("ValorProdutos"))
        desconto = _to_float_safe(row.get("Desconto"))
        valor_liquido = valor_prod - desconto

        liquido_por_vendedor[cod_vend] = liquido_por_vendedor.get(cod_vend, 0.0) + valor_liquido

        rotas_por_vendedor.setdefault(cod_vend, []).append({
            "CodRota": cod_rota,
            "Campo": (row.get("Campo") or "").strip(),
            "Valor_liquido": round(valor_liquido, 2),
        })

    por_vendedor = [
        {
            "CodVendedor": vend,
            "Valor_liquido_total": round(total, 2),
            "Rotas": rotas_por_vendedor.get(vend, []),
        }
        for vend, total in liquido_por_vendedor.items()
    ]
    por_vendedor.sort(key=lambda x: x["Valor_liquido_total"], reverse=True)

    valor_total = round(sum(x["Valor_liquido_total"] for x in por_vendedor), 2)

    return {"valor_total": valor_total, "por_vendedor": por_vendedor}



class IndicadoresView(APIView):
    
    #permission_classes = [IsAuthenticated]
    def get(self, request):
        data_inicio = request.GET.get('de')
        data_fim = request.GET.get('ate')
        
        if not data_inicio or not data_fim:
            return Response({"error": "Parâmetros 'de' e 'ate' são obrigatórios."}, status=400)
        
        meses_periodo   = _meses_no_periodo(data_inicio, data_fim)
        num_meses       = max(len(meses_periodo), 1)
        multiplos_meses = num_meses > 1

        (
            cod,
            ctx,
            grupos_supervisao,
            is_filial,
            mix_empresa_val,
            mix_supervisores_map,
            objetivo,
            objetivo_financeiro,
            objetivo_mix,
            objetivo_peso,
            objetivo_positivacao,
            objetivos_vendedores,
            rotas_codigos,
            rotas_info,
            ug_filial,
            v,
            valor,
            vendedores,
            vendedores_set,
        ) = self._montar_contexto_escopo_objetivos(data_fim, data_inicio, num_meses, request)
        (
            c_func,
            it,
            lista,
            nome,
            o,
            peso_realizado,
            v,
            venda_ano_anterior_rotas,
            venda_realizada,
            vendedores_aa_set,
            vendido,
            vid,
        ) = self._realizado_area(ctx, data_fim, data_inicio, is_filial, objetivos_vendedores, rotas_info, ug_filial, v, vendedores_set)
        # ===========================================
        # VENDAS DO MESMO PERÍODO NO ANO ANTERIOR  
        # ===========================================
        # Regras:
        # - Se o mês consultado == mês atual, comparar de data_inicio até "hoje" (mesmo dia no ano anterior).
        # - Caso contrário (mês passado), comparar mês completo como antes (de/ate - 1 ano).

        def last_day_of_month(y, m):
            # sem imports: calcula último dia do mês (considera bissexto)
            if m in (1,3,5,7,8,10,12):
                return 31
            if m in (4,6,9,11):
                return 30
            # fevereiro
            is_leap = (y % 4 == 0) and (y % 100 != 0 or y % 400 == 0)
            return 29 if is_leap else 28

        def _ajusta_data_aa(d: date) -> date:
            """Troca o ano pra (ano-1), se 29/02 ajusta p/ 28/02 quando necessário."""
            try:
                return d.replace(year=d.year - 1)
            except ValueError:
                # 29/02 em ano não-bissexto
                return d.replace(year=d.year - 1, day=28)

        # parse datas
        de_dt = datetime.strptime(data_inicio, "%Y-%m-%d").date()
        ate_dt = datetime.strptime(data_fim, "%Y-%m-%d").date()
        hoje = date.today()

        if de_dt.year == hoje.year and de_dt.month == hoje.month:
            # mês atual: vai até o "hoje" do ano anterior (limitado ao fim do mês)
            aa_ini = _ajusta_data_aa(de_dt)
            aa_last_day = last_day_of_month(aa_ini.year, aa_ini.month)
            # mesmo dia de "hoje" no ano anterior, mas não pode passar do fim do mês
            end_day = min(hoje.day, aa_last_day)
            aa_fim = date(aa_ini.year, aa_ini.month, end_day)
        else:
            # mês passado ou outro: usa o mês completo (como antes)
            aa_ini = _ajusta_data_aa(de_dt)
            aa_fim = _ajusta_data_aa(ate_dt)
        
        # ===========================================
        # ANO ANTERIOR POR ROTAS (buscar_vendido)
        # ===========================================
        
        try:
            # 1) mapa rota -> vendedor (regra gerência)
            rota_to_vendedor = {}
            for row in (rotas_info.get("detalhado") or []):
                try:
                    cod_rota = int(str(row.get("CodRota")).strip())
                    cod_vend = int(str(row.get("CodVendedor")).strip())
                    rota_to_vendedor[cod_rota] = cod_vend
                except (TypeError, ValueError):
                    pass

            aa_ini_str = aa_ini.strftime("%Y-%m-%d")
            aa_fim_str = aa_fim.strftime("%Y-%m-%d")

            _cache_key_rotas = sorted(rotas_codigos or [])
            ret_vendido_aa_rotas = get_cache_aa("vendido_rotas", aa_ini_str, aa_fim_str, _cache_key_rotas)
            if ret_vendido_aa_rotas is None:
                ret_vendido_aa_rotas = buscar_vendido(aa_ini_str, aa_fim_str, rotas=rotas_codigos)
                set_cache_aa("vendido_rotas", aa_ini_str, aa_fim_str, ret_vendido_aa_rotas, _cache_key_rotas)

            if isinstance(ret_vendido_aa_rotas, dict):
                calc = _calc_liquido_por_vendedor_por_rotas(ret_vendido_aa_rotas, rota_to_vendedor)

                venda_ano_anterior_rotas = {
                    "de": aa_ini_str,
                    "ate": aa_fim_str,
                    "valor_total": calc["valor_total"],
                    "por_vendedor": calc["por_vendedor"],
                }

                # --- MONTAGEM DO LOG FORMATADO ---
                log_lines = []
                log_lines.append(f"\n{'='*60}")
                log_lines.append(f"[AA_ROTAS][buscar_vendido] RESUMO")
                log_lines.append(f"Periodo: {aa_ini_str} ate {aa_fim_str}")
                log_lines.append(f"Total Geral: R$ {calc['valor_total']:,.2f}")
                log_lines.append(f"{'-'*60}")

                # Itera sobre cada vendedor para mostrar suas rotas
                # (Se a lista for muito grande, você pode usar um slice, ex: calc['por_vendedor'][:5])
                for v in calc["por_vendedor"]: 
                    cod_v = v.get('CodVendedor')
                    total_v = v.get('Valor_liquido_total', 0)
                    log_lines.append(f"👤 Vendedor {cod_v} | Total: R$ {total_v:,.2f}")
                    
                    rotas_v = v.get('Rotas', [])
                    for r in rotas_v:
                        cod_r = r.get('CodRota')
                        campo_r = r.get('Campo')
                        val_r = r.get('Valor_liquido', 0)
                        log_lines.append(f"   └── Rota {cod_r} ({campo_r}): R$ {val_r:,.2f}")
                    
                    log_lines.append(f"{'.'*60}") # Separador entre vendedores

                log_lines.append(f"{'='*60}\n")
                
                # Exibe o log formatado
                logger.debug("\n".join(log_lines))

            else:
                logger.warning(
                    "[AA_ROTAS][buscar_vendido] retorno inesperado tipo=%s amostra=%s",
                    type(ret_vendido_aa_rotas).__name__,
                    str(ret_vendido_aa_rotas)[:600],
                )

        except Exception:
            logger.exception("[AA_ROTAS][buscar_vendido] erro ao calcular ano anterior por rotas")
            venda_ano_anterior_rotas = None


        _aa_ini_s = aa_ini.strftime("%Y-%m-%d")
        _aa_fim_s = aa_fim.strftime("%Y-%m-%d")
        res_aa = get_cache_aa("vendas_vendedor", _aa_ini_s, _aa_fim_s)
        if is_filial:
            res_aa = buscar_vendas_por_vendedor(
                _aa_ini_s, _aa_fim_s, 
                unid_gestora=ug_filial, 
                agrupar_por_filial=True, 
                cod_representante=ctx.cod_funcionario)
        else:
            res_aa = get_cache_aa("vendas_vendedor", _aa_ini_s, _aa_fim_s)
            if res_aa is None:
                res_aa = buscar_vendas_por_vendedor(_aa_ini_s, _aa_fim_s)
                set_cache_aa("vendas_vendedor", _aa_ini_s, _aa_fim_s, res_aa)
        logger.debug("[DEBUG][VENDA ANO ANTERIOR]\n"
            f"  Total registros retornados: {len(res_aa.get('vendas_por_vendedor', []) or [])}\n"
            f"  Payload bruto: {res_aa}")
        lista_aa = res_aa.get("vendas_por_vendedor", []) or []
        logger.debug("[DEBUG][VENDA ANO ANTERIOR]\n"
            f"  Registros totais: {len(lista_aa)}\n"
            f"  Vendedores filtrados: {len(vendedores_set) if vendedores_set else 'TODOS'}\n"
            f"  IDs filtrados: {sorted(vendedores_set) if vendedores_set else 'N/A'}")

        if vendedores_aa_set: 
            lista_aa = [it for it in lista_aa if _to_int(it.get("codcampo")) in vendedores_aa_set]
            codigos_considerados = sorted(
                                                {_to_int(it.get("codcampo")) for it in lista_aa if _to_int(it.get("codcampo")) is not None}
                                            )
            
            logger.debug("[DEBUG][VENDA ANO ANTERIOR][APÓS FILTRO]\n"
                    f"  Registros considerados: {len(lista_aa)}"
                    f"  Códigos vendedores: {codigos_considerados}")
            # === ADICIONE ESTE BLOCO PARA LOGAR ===
        logger.debug("\n=== DEBUG: VENDAS ANO ANTERIOR POR VENDEDOR ===")
        for item in lista_aa:
            cod = item.get("codcampo")
            nome = item.get("Campo")
            valor = item.get("ValorLiquido")
            logger.debug(f"Vendedor: {cod} - {nome} | Valor AA: R$ {valor}")
        logger.debug("===============================================\n")
        # ======================================

        venda_ano_anterior = sum(_to_float(it.get("ValorLiquido")) for it in lista_aa) or 1.0  # evita div/0
        logger.debug(f"[DEBUG][VENDA ANO ANTERIOR] {venda_ano_anterior}")

        # índice por vendedor do ANO ANTERIOR (para merge no payload de vendas)
        aa_by_cod = {}
        for it in lista_aa:
            cod = _to_int(it.get("codcampo"))
            if cod is None:
                continue
            aa_by_cod[cod] = {
                "Ano_anterior_QtdClientes": _num(it.get("QtdClientes")),
                "Ano_anterior_ValorLiquido": _num(it.get("ValorLiquido")),
                "Ano_anterior_PesoTotal": _num(it.get("PesoTotal")),
                "Ano_anterior_Mix": _num(it.get("Mix")),
            }

        # injeta campos *Ano_anterior_* em cada item de lista (ano atual)
        for it in lista:
            cod = _to_int(it.get("codcampo"))
            aa = aa_by_cod.get(cod, {})
            it.update(aa)

        # agregado do ano anterior (da mesma amostra de vendedores)
        ano_anterior_agregado = {
            "QtdClientes": sum(_num(x.get("Ano_anterior_QtdClientes")) for x in lista),
            "ValorLiquido": sum(_num(x.get("Ano_anterior_ValorLiquido")) for x in lista),
            "PesoTotal": sum(_num(x.get("Ano_anterior_PesoTotal")) for x in lista),
            "Mix": sum(_num(x.get("Ano_anterior_Mix")) for x in lista),
        }
        
        #print(f"DEBUG VENDA DO ANO ANTERIOR ATE HOJE {ano_anterior_agregado}")

        # === NOVO: VENDAS DO MÊS COMPLETO DO ANO ANTERIOR ===
        aa_mes_ano = de_dt.year - 1
        aa_mes_mes = de_dt.month
        aa_mes_ini = date(aa_mes_ano, aa_mes_mes, 1)
        aa_mes_last_day = last_day_of_month(aa_mes_ano, aa_mes_mes)
        aa_mes_fim = date(aa_mes_ano, aa_mes_mes, aa_mes_last_day)

        _aa_mes_ini_s = aa_mes_ini.strftime("%Y-%m-%d")
        _aa_mes_fim_s = aa_mes_fim.strftime("%Y-%m-%d")
        res_aa_mes = get_cache_aa("vendas_vendedor_mes", _aa_mes_ini_s, _aa_mes_fim_s)
        if is_filial:
            res_aa_mes = buscar_vendas_por_vendedor(
                _aa_mes_ini_s, _aa_mes_fim_s, 
                unid_gestora=ug_filial, 
                agrupar_por_filial=True, 
                cod_representante=ctx.cod_funcionario
            )
        else:
            res_aa_mes = get_cache_aa("vendas_vendedor_mes", _aa_mes_ini_s, _aa_mes_fim_s)
            if res_aa_mes is None:
                res_aa_mes = buscar_vendas_por_vendedor(_aa_mes_ini_s, _aa_mes_fim_s)
                set_cache_aa("vendas_vendedor_mes", _aa_mes_ini_s, _aa_mes_fim_s, res_aa_mes)
        lista_aa_mes = res_aa_mes.get("vendas_por_vendedor", []) or []

        # aplica o MESMO filtro de escopo de vendedores
        if vendedores_aa_set:
            lista_aa_mes = [
                it for it in lista_aa_mes
                if _to_int(it.get("codcampo")) in vendedores_aa_set
            ]

        # índice por vendedor do MÊS COMPLETO do ANO ANTERIOR
        aa_mes_by_cod = {}
        for it in lista_aa_mes:
            cod = _to_int(it.get("codcampo"))
            if cod is None:
                continue
            aa_mes_by_cod[cod] = {
                "Ano_anterior_mes_QtdClientes": _num(it.get("QtdClientes")),
                "Ano_anterior_mes_ValorLiquido": _num(it.get("ValorLiquido")),
                "Ano_anterior_mes_PesoTotal": _num(it.get("PesoTotal")),
                "Ano_anterior_mes_Mix": _num(it.get("Mix")),
            }

        # injeta também os campos do MÊS CHEIO em cada item de lista (ano atual)
        for it in lista:
            cod = _to_int(it.get("codcampo"))
            if cod is None:
                continue
            aa_mes = aa_mes_by_cod.get(cod, {})
            it.update(aa_mes)

        # agregado do MÊS CHEIO do ano anterior (sobre a MESMA amostra de vendedores da lista)
        ano_anterior_agregado_mes = {
            "QtdClientes":   sum(_num(x.get("Ano_anterior_mes_QtdClientes"))   for x in lista),
            "ValorLiquido":  sum(_num(x.get("Ano_anterior_mes_ValorLiquido"))  for x in lista),
            "PesoTotal":     sum(_num(x.get("Ano_anterior_mes_PesoTotal"))     for x in lista),
            "Mix":           sum(_num(x.get("Ano_anterior_mes_Mix"))           for x in lista),
        }
        #print(f"DEBUG VENDA DO ANO ANTERIOR MES COMPLETO {ano_anterior_agregado_mes}")

        #  POSITIVAÇÃO (área)
        _esc_pos = sorted(vendedores) if vendedores else []
        _rotas_key = sorted(rotas_codigos) if rotas_codigos else []
 
        if not multiplos_meses:
            # ── 1 mês: comportamento atual (uma query cada) ──────────────────
            _esc_mix = sorted(vendedores) if vendedores else []
            dados_mix = get_cache_mes("venda_mix", data_inicio, data_fim, _esc_mix)
            if dados_mix is None:
                dados_mix = buscar_venda_mix(data_inicio, data_fim, cod_vendedores=vendedores)
                set_cache_mes("venda_mix", data_inicio, data_fim, dados_mix, _esc_mix)
            mix_realizado = float(dados_mix.get("mix_realizado") or 0)
 
            _esc_pos = (sorted(vendedores) if vendedores else []) + (sorted(rotas_codigos) if rotas_codigos else [])
            positivacao = get_cache_mes("positivacao", data_inicio, data_fim, _esc_pos)
            if positivacao is None:
                positivacao = buscar_positivacao_por_rota(
                    data_inicio, data_fim, rotas=rotas_codigos, cod_vendedores=vendedores
                )
                set_cache_mes("positivacao", data_inicio, data_fim, positivacao, _esc_pos)
            positivacao_realizado_geral = float(positivacao.get("positivacao_realizado_geral") or 0)
 
            # Mapa simples por vendedor para 1 mês
            _mix_media_por_vend = {}   # populado mais adiante no loop existente
            _pos_media_por_vend = {}   # populado mais adiante no loop existente
 
        else:
            # ── n meses: consultas mensais + médias ──────────────────────────
            _med = _calcular_media_mix_pos_por_mes(
                meses_periodo, rotas_codigos, vendedores
            )
            mix_realizado               = _med["mix_global"]
            positivacao_realizado_geral = _med["pos_global"]
            _mix_media_por_vend         = _med["mix_por_vend"]
            _pos_media_por_vend         = _med["pos_por_vend"]
 
            # Reconstrói 'positivacao' como dict compatível com o restante do código
            positivacao = {
                "positivacao_realizado_geral": positivacao_realizado_geral,
                "detalhado": _med["positivacao_detalhado_ultimo_mes"],
            }

        if grupos_supervisao:
            logger.debug("\n[DEBUG][AREAS] iniciando soma ATUAL + AA por área...")

            for area in grupos_supervisao:
                area_vendedores = [_to_int(v) for v in (area.get("vendedores") or [])]
                area_vendedores = [v for v in area_vendedores if v is not None]

                logger.debug(f"\n[DEBUG][AREA] area={area.get('cod_area_supervisao')} "
                    f"sup={area.get('cod_supervisor')} "
                    f"qtd_vendedores={len(area_vendedores)} "
                    f"vendedores(amostra)={area_vendedores[:10]}")

                if not area_vendedores:
                    area["venda_ano_anterior_area"] = 0.0
                    area["venda_realizada_area"] = 0.0
                    continue
                
                # MIX AGREGADO DA ÁREA (Distinto)
                # =========
                area_vendedores_mix = list(area_vendedores)
                # Aplica a regra do 228/4 também aqui
                try:
                    if str(ctx.cod_funcionario) in ['228', '4']:
                        if 4 not in area_vendedores_mix:
                            area_vendedores_mix.append(4)
                except: pass
                area_vendedores     = [_to_int(v) for v in (area.get("vendedores") or []) if _to_int(v)]
                area_vendedores_mix = list(area_vendedores)  # inclui vendedor 4 se regra 228 se aplicar
 
                if multiplos_meses:
                    # Média ponderada pelo objetivo de cada vendedor desta área
                    mix_vend_area = {
                        cod: _mix_media_por_vend[cod]
                        for cod in area_vendedores if cod in _mix_media_por_vend
                    }
                    mix_area = _media_ponderada_supervisor(
                        mix_vend_area, objetivos_vendedores, "objetivo_mix"
                    )
                    pos_vend_area = {
                        cod: _pos_media_por_vend[cod]
                        for cod in area_vendedores if cod in _pos_media_por_vend
                    }
                    pos_area = _media_ponderada_supervisor(
                        pos_vend_area, objetivos_vendedores, "objetivo_positivacao"
                    )
                else:
                     mix_area = buscar_mix_agregado(data_inicio, data_fim, cod_vendedores=area_vendedores_mix)
                     pos_area = 0.0
                     for item_pos in (positivacao.get("detalhado") or []):
                         c_func = _to_int(item_pos.get("CodFuncionario"))
                         if c_func in area_vendedores:
                             pos_area += float(item_pos.get("ClientesPositivadosRota") or item_pos.get("Realizado") or 0)

                
                area["mix_realizado_area"] = mix_area
                area["pos_realizado_area"] = round(pos_area, 1)
                
                # =========
                # ATUAL (período consultado)
                # =========
                res_atual_area = buscar_vendas_por_vendedor(
                    data_inicio,
                    data_fim,
                    cod_vendedores=area_vendedores,
                )
                lista_atual_area = res_atual_area.get("vendas_por_vendedor", []) or []
                soma_atual_area = sum(_to_float(it.get("ValorLiquido")) for it in lista_atual_area)
                area["venda_realizada_area"] = round(soma_atual_area, 2)

                logger.debug(f"[DEBUG][ATUAL_POR_AREA_TOTAL] "
                    f"area={area.get('cod_area_supervisao')} sup={area.get('cod_supervisor')} "
                    f"ATUAL_TOTAL={area['venda_realizada_area']}")

                # =========
                # AA (mês completo do ano anterior) — mantém sua regra
                # =========
                res_aa_area = res_aa
                lista_aa_area = res_aa_area.get("vendas_por_vendedor", []) or []
                soma_aa_area = sum(_to_float(it.get("ValorLiquido")) for it in lista_aa_area)
                area["venda_ano_anterior_area"] = round(soma_aa_area, 2)

                logger.debug(f"[DEBUG][AA_POR_AREA_TOTAL] "
                    f"area={area.get('cod_area_supervisao')} sup={area.get('cod_supervisor')} "
                    f"AA_TOTAL={area['venda_ano_anterior_area']}")

        if multiplos_meses and grupos_supervisao:
            # Média ponderada entre supervisões (peso = n vendedores)
            _mix_por_area_gerente = {
                str(area.get("cod_area_supervisao")): {
                    "media":         area.get("mix_realizado_area", 0.0),
                    "n_vendedores":  len([v for v in (area.get("vendedores") or []) if _to_int(v)]),
                }
                for area in grupos_supervisao
            }
            _pos_por_area_gerente = {
                str(area.get("cod_area_supervisao")): {
                    "media":         area.get("pos_realizado_area", 0.0),
                    "n_vendedores":  len([v for v in (area.get("vendedores") or []) if _to_int(v)]),
                }
                for area in grupos_supervisao
            }
            mix_realizado               = _media_ponderada_gerente(_mix_por_area_gerente)
            positivacao_realizado_geral = _media_ponderada_gerente(_pos_por_area_gerente)
 

        # Pré-venda (área)
        _esc_prev = sorted(vendedores) if vendedores else []
        prevenda = get_cache_mes("pre_venda", data_inicio, data_fim, _esc_prev)
        if prevenda is None:
            prevenda = buscar_pre_venda(data_inicio, data_fim, cod_vendedores=vendedores)
            set_cache_mes("pre_venda", data_inicio, data_fim, prevenda, _esc_prev)
        valor_prevenda = prevenda.get("pre_venda_valor", 0)
        valor_alocado = venda_realizada + valor_prevenda

        logger.debug("%s %s", "[DEBUG][PREVENDA_RAW] keys=", list((prevenda or {}).keys()))
        det = (prevenda.get("detalhado") or [])
        logger.debug("%s %s %s %s", "[DEBUG][PREVENDA_RAW] detalhado_len=", len(det), "amostra=", det[:3])
        

       # ==========================
        # PRÉ-VENDA: mapa por vendedor (ACUMULADO)
        # ==========================
        pre_by_cod = {}
        try:
            detalhado_pre = prevenda.get("detalhado") or []
            for row in detalhado_pre:
                cod_v = _to_int(row.get("CodVendedor"))
                if cod_v is None:
                    continue
                valor = _num(row.get("Valor"))
                pre_by_cod[cod_v] = pre_by_cod.get(cod_v, 0.0) + valor
        except Exception as e:
            logger.exception(f"[PREVENDA] erro ao montar pre_by_cod: {e}")
            pre_by_cod = {}

        logger.debug("[DEBUG] Iniciando cálculo de pré-venda…")
        logger.debug(f"[DEBUG] Pré-venda calculada para {len(pre_by_cod)} vendedores")

        # (opcional) log de alguns vendedores
        for k in list(pre_by_cod.keys())[:15]:
            logger.debug(f"[DEBUG] PRE vendedor {k}: {pre_by_cod[k]}")

        # ==========================
        # PRÉ-VENDA: soma por área (escopo_rotas -> areas_supervisao)
        # ==========================
        if grupos_supervisao:
            logger.debug("\n[DEBUG][PREVENDA_POR_AREA] iniciando...")

            pre_keys = set(pre_by_cod.keys())

            for area in grupos_supervisao:
                area_vendedores = [_to_int(v) for v in (area.get("vendedores") or [])]
                area_vendedores = [v for v in area_vendedores if v is not None]

                intersec = sorted(list(set(area_vendedores) & pre_keys))

                logger.debug(f"[DEBUG][PREVENDA_MATCH] area={area.get('cod_area_supervisao')} "
                    f"sup={area.get('cod_supervisor')} "
                    f"qtd_area_vend={len(area_vendedores)} qtd_pre_keys={len(pre_keys)} "
                    f"intersec={len(intersec)} amostra_inter={intersec[:15]}")

                soma_pre_area = sum(pre_by_cod.get(v, 0.0) for v in area_vendedores)
                area["pre_venda_area"] = round(soma_pre_area, 2)

                logger.debug(f"[DEBUG][PREVENDA_POR_AREA_TOTAL] area={area.get('cod_area_supervisao')} "
                    f"sup={area.get('cod_supervisor')} PRE_TOTAL={area['pre_venda_area']}")



        # ========= PRÉ-VENDA POR ÁREA (para gerente) =========
        if grupos_supervisao:
            logger.debug("\n[DEBUG][PREVENDA_POR_AREA] iniciando...")

            for area in grupos_supervisao:
                area_vendedores = [_to_int(v) for v in (area.get("vendedores") or [])]
                area_vendedores = [v for v in area_vendedores if v is not None]

                inter = set(area_vendedores) & set(pre_by_cod.keys())
                logger.debug(f"[DEBUG][PREVENDA_MATCH] area={area.get('cod_area_supervisao')} "
                f"qtd_area_vend={len(area_vendedores)} qtd_pre_keys={len(pre_by_cod)} "
                f"intersec={len(inter)} amostra_inter={list(inter)[:10]}")


                soma_pre_area = sum(_num(pre_by_cod.get(v, 0.0)) for v in area_vendedores)

                area["pre_venda_area"] = round(soma_pre_area, 2)

                if "venda_realizada_area" in area:
                    area["valor_alocado_area"] = round(_num(area.get("venda_realizada_area")) + soma_pre_area, 2)

                logger.debug(f"[DEBUG][PREVENDA_POR_AREA_TOTAL] "
                    f"area={area.get('cod_area_supervisao')} sup={area.get('cod_supervisor')} "
                    f"PRE_TOTAL={area['pre_venda_area']}")



        # KPIs (área)
        variacao = peso_realizado - objetivo.get("objetivo_peso", 0)
        percentual = safe_divide(peso_realizado, objetivo.get("objetivo_peso", 1)) * 100
        percentual_cobertura = safe_divide(venda_realizada, objetivo_financeiro) * 100
        variacao_financeira = venda_realizada - objetivo_financeiro
        venda_realizada_float = float(venda_realizada)
        venda_ano_anterior_float = float(venda_ano_anterior)
        evolucao_percentual = safe_divide(venda_realizada_float - venda_ano_anterior_float, venda_ano_anterior_float) * 100
        percentual_mix = safe_divide(mix_realizado, objetivo_mix) * 100
        variacao_mix = mix_realizado - objetivo_mix
        percentual_prevenda_alocado = safe_divide(valor_alocado, objetivo_financeiro) * 100
        variacao_prevenda = valor_alocado - objetivo_financeiro

        # === RUPTURA (Captado) (área) ===
        vendedores_list_int = [_to_int(v) for v in (vendedores or []) if _to_int(v) is not None]
        _esc_rupt = sorted(vendedores_list_int) if vendedores_list_int else []
        ruptura_dados = get_cache_mes("ruptura", data_inicio, data_fim, _esc_rupt)
        if ruptura_dados is None:
            if not vendedores_list_int:
                ruptura_dados = buscar_ruptura(data_inicio, data_fim, cod_vendedor=None, cod_vendedores=None)
            elif len(vendedores_list_int) == 1:
                ruptura_dados = buscar_ruptura(data_inicio, data_fim, cod_vendedor=vendedores_list_int[0], cod_vendedores=None)
            else:
                ruptura_dados = buscar_ruptura(data_inicio, data_fim, cod_vendedor=None, cod_vendedores=vendedores_list_int)
            set_cache_mes("ruptura", data_inicio, data_fim, ruptura_dados, _esc_rupt)

        #print(f"[DEBUG]RUPTURA ] {ruptura_dados}")
        ruptura_total = 0.0
        for r in (ruptura_dados.get("resumo") or []):
            ruptura_total += float(r.get("TotalValor") or 0)
        ruptura_total = round(ruptura_total, 2)
        percentual_captado = round(safe_divide(ruptura_total, venda_realizada) * 100, 2)

        # ========= NOVO: MERGE por-vendedor (Pré-venda, Ruptura, Positivação) =========
        # 1) Pré-venda detalhada (esperado: prevenda['detalhado'] = [{CodVendedor, Valor}, ...])
        """pre_by_cod = {}
        try:
            for itp in (prevenda.get("detalhado") or []):
                cod_v = _to_int(itp.get("CodVendedor"))
                if cod_v is None:
                    continue
                pre_by_cod[cod_v] = _num(itp.get("Valor"))
        except Exception:
            pre_by_cod = {}"""

        # 2) Ruptura detalhada (esperado: ruptura_dados['detalhado'] = [{CodVendedor, TotalValor}, ...])
        rup_by_cod = {}
        try:
            for itr in (ruptura_dados.get("resumo") or []):
                #print(f"[DEBUG] dado do for {itr}")
                cod_v = _to_int(itr.get("CodVendedor"))
                if cod_v is None:
                    continue
                rup_by_cod[cod_v] = _num(itr.get("TotalValor"))
        except Exception:
            rup_by_cod = {}

        # 3) Positivação detalhada (esperado: positivacao['detalhado'] = [{CodVendedor, Realizado|QtdClientes}, ...])
        pos_by_cod = {}
        try:
            if multiplos_meses:
                pos_by_cod = {cod: v for cod, v in _pos_media_por_vend.items()}
            else:
                for itpos in (positivacao.get("detalhado") or []):
                    cod_v = _to_int(itpos.get("CodFuncionario"))
                    if cod_v is None:
                        continue
                    realizado = itpos.get("Realizado", itpos.get("QtdClientes", 0))
                    pos_by_cod[cod_v] = _num(realizado)
        except Exception:
            pos_by_cod = {}

        # 4) Aplica nos itens do array principal
        for it in lista:
            cod = _to_int(it.get("codcampo"))
            it["PreVenda_Valor"]        = pre_by_cod.get(cod, 0.0)
            it["Ruptura_TotalValor"]    = rup_by_cod.get(cod, 0.0)
            it["Positivacao_Realizado"] = pos_by_cod.get(cod, 0.0)

        # 5) Agregados úteis p/ modo "área"
        pre_venda_agregado = sum(_num(it.get("PreVenda_Valor")) for it in lista)
        ruptura_agregado   = sum(_num(it.get("Ruptura_TotalValor")) for it in lista)
        positivacao_agregado = sum(_num(it.get("Positivacao_Realizado")) for it in lista)

        # ========= NOVO: BLOCO "minha_visao" (vendedor logado) =========
        minha_visao = None
        try:
            meu_cod = _to_int(ctx.cod_funcionario)
            # linha de venda do meu vendedor
            minha_linha = None
            for it in lista:
                if _to_int(it.get("codcampo")) == meu_cod:
                    minha_linha = it
                    break

            # objetivos do meu vendedor
            obj_meu = None
            for o in objetivos_vendedores or []:
                if str(o.get("vendedor_id")) == str(meu_cod):
                    obj_meu = o
                    break

            if minha_linha or obj_meu:
                my_venda = _to_float((minha_linha or {}).get("ValorLiquido"))
                my_peso  = _to_float((minha_linha or {}).get("PesoTotal"))
                my_mix = _mix_media_por_vend.get(meu_cod, _to_float((minha_linha or {}).get("Mix")))
                # pos_by_cod já resolve corretamente 1 mês (valor direto) e N meses (média mensal)
                my_pos = pos_by_cod.get(meu_cod, 0.0)

                my_obj_fin  = _to_float((obj_meu or {}).get("objetivo_financeiro"))
                my_obj_peso = _to_float((obj_meu or {}).get("objetivo_peso"))
                my_obj_mix  = _to_float((obj_meu or {}).get("objetivo_mix"))
                my_obj_pos  = _to_float((obj_meu or {}).get("objetivo_positivacao"))

                minha_visao = {
                    "cod_funcionario": meu_cod,
                    "colaborador": (minha_linha or {}).get("Campo"),
                    "realizado_financeiro": round(my_venda, 2),
                    "realizado_peso": round(my_peso, 2),
                    "mix_realizado": round(my_mix, 2),
                    "realizado_positivacao": round(my_pos, 2),
                    "objetivo_financeiro": round(my_obj_fin, 2),
                    "objetivo_peso": round(my_obj_peso, 2),
                    "objetivo_mix": round(my_obj_mix, 2),
                    "objetivo_positivacao": round(my_obj_pos, 2),
                    "percentual_cobertura": round(safe_divide(my_venda, my_obj_fin) * 100, 2) if my_obj_fin else 0.0,
                    "variacao_financeira": round(my_venda - my_obj_fin, 2),
                    "percentual_peso": round(safe_divide(my_peso, my_obj_peso) * 100, 2) if my_obj_peso else 0.0,
                    "variacao_peso": round(my_peso - my_obj_peso, 2),
                    "percentual_mix": round(safe_divide(my_mix, my_obj_mix) * 100, 2) if my_obj_mix else 0.0,
                    "variacao_mix": round(my_mix - my_obj_mix, 2),
                    "percentual_positivacao": round(safe_divide(my_pos, my_obj_pos) * 100, 2) if my_obj_pos else 0.0,
                    "variacao_positivacao": round(my_pos - my_obj_pos, 2),
                }
        except Exception as e:
            logger.exception(f"[IndicadoresView][minha_visao] erro ao montar: {e}")
            minha_visao = None

        # ====== Payload final de vendas / agregados ======
        vendido["vendas_por_vendedor"]   = lista
        vendido["ano_anterior_agregado"] = ano_anterior_agregado
        vendido["ano_anterior_agregado_mes"] = ano_anterior_agregado_mes
        vendido["agregados_area"] = {
            "PreVenda_Valor": pre_venda_agregado,
            "Ruptura_TotalValor": ruptura_agregado,
            "Positivacao_Realizado": positivacao_agregado,
        }
        vendido["venda_ano_anterior_rotas"] = venda_ano_anterior_rotas


        # =========================================================
        # 🟢 INICIO DO BLOCO: PROJEÇÃO INTEGRADA & PDV (FINAL - DETALHADO)
        # =========================================================
        
        # 1. Busca Dados Externos
        dados_pdv = get_cache_mes("vendas_pdv", data_inicio, data_fim)
        if dados_pdv is None:
            dados_pdv = buscar_vendas_pdv(data_inicio, data_fim)
            set_cache_mes("vendas_pdv", data_inicio, data_fim, dados_pdv)

        # Calcula tem_pdv aqui, antes de usá-lo
        venda_pdv_total = float(dados_pdv.get("valor_pdv") or 0)
        peso_pdv_total  = float(dados_pdv.get("peso_pdv") or 0)
        tem_pdv = venda_pdv_total > 0

        
        if tem_pdv:
            dados_cupons_pdv = get_cache_mes("cupons_pdv", data_inicio, data_fim)
            if dados_cupons_pdv is None:
                dados_cupons_pdv = buscar_cupons_por_vendedor(data_inicio, data_fim)
                set_cache_mes("cupons_pdv", data_inicio, data_fim, dados_cupons_pdv)
        else:
            dados_cupons_pdv = []
        cupons_pdv_total = sum(int(r.get("QuantidadeCupons") or 0) for r in dados_cupons_pdv)
 
        _esc_pos = sorted(vendedores) if vendedores else []
        _rotas_key = sorted(rotas_codigos) if rotas_codigos else []
 
        dados_positivacao  = get_cache_mes("positivacao", data_inicio, data_fim, _esc_pos + _rotas_key)
        if dados_positivacao  is None:
            dados_positivacao  = buscar_positivacao_por_rota(
                data_inicio, data_fim,
                rotas=rotas_codigos,
                cod_vendedores=vendedores,
            )
            set_cache_mes("positivacao", data_inicio, data_fim, dados_positivacao, _esc_pos + _rotas_key)
       
        # 2. Valores Totais Gerais
        venda_pdv_total = float(dados_pdv.get("valor_pdv") or 0)
        peso_pdv_total = float(dados_pdv.get("peso_pdv") or 0)
        pos_realizado_geral = float(dados_positivacao.get("positivacao_realizado_geral") or 0)
        
        # Totais Combinados
        venda_total_empresa = venda_realizada + venda_pdv_total
        peso_total_empresa = peso_realizado + peso_pdv_total

        # Verificação de PDV (Solicitação do usuário: não calcular se for zero)
        
        _mapa_vend_ugs = {} 

        if tem_pdv:
            _todos_ids = [_to_int(v) for v in (vendedores or []) if _to_int(v)]
            if _todos_ids:
                try:
                    raw = obter_unid_gestoras_por_vendedores(_todos_ids)
                    _mapa_vend_ugs = {
                        vid: [str(u) for u in ugs if str(u).strip() and str(u) != "1"]
                        for vid, ugs in raw.items()
                    }
                except Exception:
                    logger.exception("[mix_pdv] erro ao montar mapa de UGs")

        # 3. Mapas
        pdv_map = defaultdict(lambda: {"fin": 0.0, "peso": 0.0})
        if tem_pdv:
            for item in dados_pdv.get("detalhado", []):
                try:
                    c_func = int(item.get("CodFuncionario") or 0)
                    if c_func > 0:
                        pdv_map[c_func]["fin"] += float(item.get("ValorProdutos") or 0)
                        pdv_map[c_func]["peso"] += float(item.get("Peso") or 0)
                except: continue

        pos_map = defaultdict(float)
        for item in dados_positivacao.get("detalhado", []):
            try:
                c_func = int(item.get("CodFuncionario") or 0)
                qtd = float(item.get("ClientesPositivadosRota") or item.get("Realizado") or 0)
                if c_func > 0:
                    pos_map[c_func] += qtd
            except: continue
        
        cupons_map = {}
        for r in dados_cupons_pdv:
            try:
                c_func = int(r.get("CodVendedor") or 0)
                if c_func > 0:
                    cupons_map[c_func] = int(r.get("QuantidadeCupons") or 0)
            except: continue


        meta_map = {}
        for o in objetivos_vendedores or []:
            try:
                vid = int(str(o.get("vendedor_id")).strip())
                meta_map[vid] = {
                    "fin": float(o.get("objetivo_financeiro") or 0),
                    "peso": float(o.get("objetivo_peso") or 0),
                    "pos": float(o.get("objetivo_positivacao") or 0),
                    "mix": float(o.get("objetivo_mix") or 0)
                    
                }
            except: continue

        # 4. Calendário
        try:
            dt_ref_fim = datetime.strptime(data_fim, "%Y-%m-%d").date()
            dias_info = get_dias_uteis_info(data_base=dt_ref_fim)
        except Exception:
            dias_info = {"totais": 22, "decorridos": 1, "restantes": 21}

        # 5. Cálculo das Projeções GERAIS (Empresa)
        # Financeiro
        proj_rotas_geral = calcular_matematica_projecao(venda_realizada, 0, dias_info)
        projecao_financeira_geral = calcular_matematica_projecao(venda_total_empresa, objetivo_financeiro, dias_info)
        
        if tem_pdv:
            proj_pdv_geral = calcular_matematica_projecao(venda_pdv_total, 0, dias_info)
        else:
            proj_pdv_geral = {
                "projecao_final": 0.0, "velocidade_diaria": 0.0, 
                "falta_para_meta": 0.0, "meta_diaria_necessaria": 0.0, 
                "atingimento_projetado": 0.0
            }

        # Peso (Rotas vs Total)
        # Calcula projeção só de rotas para quando o PDV estiver desligado no front
        proj_peso_rotas_geral = calcular_matematica_projecao(peso_realizado, 0, dias_info)
        # Projeção Total (Rotas + PDV) contra a meta
        projecao_peso_geral = calcular_matematica_projecao(peso_total_empresa, objetivo_peso, dias_info)
        
        # Mix (Geral)
        projecao_mix_geral = calcular_matematica_projecao(mix_realizado, objetivo_mix, dias_info)

        # Positivação (Geral)
        projecao_positivacao_geral = calcular_matematica_projecao(pos_realizado_geral, objetivo_positivacao, dias_info)
        percentual_positivacao = round(safe_divide(positivacao_realizado_geral, objetivo_positivacao) * 100, 2) if objetivo_positivacao else 0.0
        variacao_positivacao   = round(positivacao_realizado_geral - objetivo_positivacao, 2)

        # [LOG EMPRESA DETALHADO]
        logger.debug("========================================")
        logger.debug(f"--- [PROJEÇÃO EMPRESA] ---")
        logger.debug(f"Calendário: {dias_info['decorridos']} decorridos / {dias_info['totais']} totais")
        logger.debug("FINANCEIRO (Rotas vs PDV):")
        logger.debug(f"   Rotas: Realizado R$ {venda_realizada:,.2f} -> Projeção R$ {proj_rotas_geral['projecao_final']:,.2f}")
        logger.debug(f"   TOTAL: Realizado R$ {venda_total_empresa:,.2f} -> Projeção R$ {projecao_financeira_geral['projecao_final']:,.2f}")
        logger.debug("========================================")

        # 6. Loop de Projeção INDIVIDUAL
        for vend in lista:
            try:
                vid = int(vend.get("codcampo") or 0)
                
                # Valores Realizados
                val_rotas = float(vend.get("ValorLiquido") or 0)
                peso_rotas = float(vend.get("PesoTotal") or 0)
                cod_vend_int = int(vend.get("codcampo") or 0)
 
                if multiplos_meses:
                    # Usa médias mensais pré-calculadas
                    val_mix = _mix_media_por_vend.get(cod_vend_int,
                                round(float(vend.get("Mix") or 0) / num_meses, 1))
                    pos_rotas       = _pos_media_por_vend.get(cod_vend_int, 0.0)
                    qtd_cupons_pdv  = round(cupons_map.get(cod_vend_int, 0) / num_meses, 1) if tem_pdv else 0
                    val_pos         = round(pos_rotas + qtd_cupons_pdv, 1)
                else:
                    # 1 mês: comportamento original
                    val_mix         = float(vend.get("Mix") or 0)
                    pos_rotas       = pos_map.get(cod_vend_int, 0.0)
                    qtd_cupons_pdv  = cupons_map.get(cod_vend_int, 0) if tem_pdv else 0
                    val_pos         = pos_rotas + qtd_cupons_pdv
                
                val_pdv = pdv_map[vid]["fin"]
                peso_pdv = pdv_map[vid]["peso"]
                total_fin = val_rotas + val_pdv
                total_peso = peso_rotas + peso_pdv

                # Metas (agora com Mix)
                metas = meta_map.get(vid, {"fin": 0, "peso": 0, "pos": 0, "mix": 0})

                # --- CÁLCULOS SEPARADOS ---
                p_rotas_only = calcular_matematica_projecao(val_rotas, 0, dias_info)
                
                p_pdv_only = None
                if tem_pdv:
                    p_pdv_only = calcular_matematica_projecao(val_pdv, 0, dias_info)
                else:
                    p_pdv_only = {"projecao_final": 0, "velocidade_diaria": 0, "atingimento_projetado": 0}

                # Projeções Totais
                p_fin_total = calcular_matematica_projecao(total_fin, metas["fin"], dias_info)
                p_peso = calcular_matematica_projecao(total_peso, metas["peso"], dias_info)
                p_pos = calcular_matematica_projecao(val_pos, metas["pos"], dias_info)
                p_mix = calcular_matematica_projecao(val_mix, metas["mix"], dias_info) # <--- Projeção de Mix

                # --- LOGS DETALHADOS (RESTAURADOS) ---
                logger.debug(f"--- [PROJEÇÃO VENDEDOR {vid}] {vend.get('Campo')} ---")
                logger.debug(f"   FINANCEIRO: Real R$ {total_fin:,.2f} | Meta R$ {metas['fin']:,.2f} | Proj R$ {p_fin_total['projecao_final']:,.2f} ({p_fin_total['atingimento_projetado']:.2f}%)")
                logger.debug(f"               Diário Atual: R$ {p_fin_total['velocidade_diaria']:,.2f} | Necessário: R$ {p_fin_total['meta_diaria_necessaria']:,.2f}")
                logger.debug(f"   PESO:       Real {total_peso:,.2f} | Meta {metas['peso']:,.2f} | Proj {p_peso['projecao_final']:,.2f}")
                logger.debug(f"   MIX:        Real {val_mix} | Meta {metas['mix']} | Proj {p_mix['projecao_final']:.2f}")
                logger.debug(f"   POSITIV.:   Real {val_pos} | Meta {metas['pos']} | Proj {p_pos['projecao_final']:.2f}")

                # --- INJEÇÃO NO JSON ---
                vend["projecao"] = p_fin_total 
                
                vend["venda_rotas"] = val_rotas
                vend["venda_pdv"] = val_pdv
                vend["venda_total_geral"] = total_fin
                vend["pos_rotas"] = pos_rotas   
                vend["pos_cupons_pdv"] = qtd_cupons_pdv
                vend["pos_total"] = val_pos
                if tem_pdv:
                    ugs_vend = _mapa_vend_ugs.get(vid, [])
                    if ugs_vend:
                        try:
                            _r = buscar_mix_pdv_por_perfil(
                                data_inicio, data_fim,
                                perfil="vendedor",  
                                unid_gestoras_vendedor=ugs_vend,
                            )
                            vend["mix_pdv"] = {
                                "mix"        : _r.get("Mix", 0),
                                "qtd_cupons" : _r.get("QtdCupons", 0),
                                "qtd_itens"  : _r.get("QtdItens", 0.0),
                                "valor_total": _r.get("ValorTotal", 0.0),
                            }
                        except Exception:
                            vend["mix_pdv"] = None
                    else:
                        vend["mix_pdv"] = None
                else:
                    vend["mix_pdv"] = None

                
                vend["projecao_financeira_rotas"] = p_rotas_only
                vend["projecao_financeira_pdv"] = p_pdv_only

                vend["falta_para_meta"] = p_fin_total["falta_para_meta"]
                vend["meta_diaria_necessaria"] = p_fin_total["meta_diaria_necessaria"]
                vend["venda_media_diaria_atual"] = p_fin_total["velocidade_diaria"]
                
                vend["projecoes_detalhadas"] = {
                    "financeiro_total": p_fin_total,
                    "financeiro_rotas": p_rotas_only,
                    "financeiro_pdv": p_pdv_only,
                    "peso": p_peso,
                    "positivacao": p_pos,
                    "mix": p_mix # <--- Opcional: incluir mix no JSON também
                }

            except Exception as e:
                logger.error(f"Erro projecao vendedor {vend.get('codcampo')}: {e}")
        # =========================================================
        # 🔴 FIM DO BLOCO DE PROJEÇÃO
        # =========================================================
        
        if tem_pdv and grupos_supervisao:
            # Coleta UGs de toda a empresa (para o mix geral)
            _todas_ugs_empresa = list(dict.fromkeys(
                ug for ugs in _mapa_vend_ugs.values() for ug in ugs
            ))

            for area in grupos_supervisao:
                area_vendedores = [_to_int(v) for v in (area.get("vendedores") or []) if _to_int(v)]

                # UGs de todos os vendedores desta área juntas (COUNT DISTINCT real)
                ugs_da_area = list(dict.fromkeys(
                    ug for vid in area_vendedores
                    for ug in _mapa_vend_ugs.get(vid, [])
                ))

                if ugs_da_area:
                    try:
                        _r = buscar_mix_pdv_por_perfil(
                            data_inicio, data_fim,
                            perfil="vendedor",          # recebe lista de UGs — lógica idêntica
                            unid_gestoras_vendedor=ugs_da_area,
                        )
                        area["mix_pdv_grupo"] = {
                            "mix"        : _r.get("Mix", 0),      # ← COUNT DISTINCT do grupo todo
                            "qtd_cupons" : _r.get("QtdCupons", 0),
                            "qtd_itens"  : _r.get("QtdItens", 0.0),
                            "valor_total": _r.get("ValorTotal", 0.0),
                        }
                    except Exception:
                        area["mix_pdv_grupo"] = None
                else:
                    area["mix_pdv_grupo"] = None

            # Mix geral da empresa (todas as UGs juntas — nunca soma dos supervisores)
            try:
                _r_emp = buscar_mix_pdv_por_perfil(
                    data_inicio, data_fim,
                    perfil="vendedor",
                    unid_gestoras_vendedor=_todas_ugs_empresa,
                )
                _mix_pdv_empresa = {
                    "mix"        : _r_emp.get("Mix", 0),
                    "qtd_cupons" : _r_emp.get("QtdCupons", 0),
                    "qtd_itens"  : _r_emp.get("QtdItens", 0.0),
                    "valor_total": _r_emp.get("ValorTotal", 0.0),
                }
            except Exception:
                _mix_pdv_empresa = None
        else:
            _mix_pdv_empresa = None
        mix_pdv_supervisor = None
        if tem_pdv and getattr(ctx, "is_supervisor", False) and not rotas_info.get("e_gerente"):
            _todos_ids = [_to_int(v) for v in (vendedores or []) if _to_int(v)]
            if _todos_ids and _mapa_vend_ugs:
                try:
                    mix_pdv_supervisor = buscar_mix_pdv_por_perfil(
                        data_inicio, data_fim,
                        perfil="supervisor",
                        mapa_vendedor_ugs=_mapa_vend_ugs,
                    )
                except Exception:
                    logger.exception("[mix_pdv] erro ao calcular mix supervisor")
        # ────────────────────────────────────────────────────────────────

        logger.debug(f"""
                [DEBUG][mix_pdv_grupo]
                perfil        : {'gerente' if rotas_info.get('e_gerente') else 'supervisor' if getattr(ctx, 'is_supervisor', False) else 'vendedor'}
                e_gerente     : {rotas_info.get('e_gerente')}
                vendedores    : {vendedores}
                _mapa_vend_ugs keys: {list(_mapa_vend_ugs.keys())}
                mix_pdv_supervisor : {mix_pdv_supervisor}
                grupos_supervisao  : {[a.get('cod_area_supervisao') for a in (grupos_supervisao or [])]}
                """)
        
        return Response({
            "objetivo": objetivo,
            "objetivos_vendedores": objetivos_vendedores,
            "evolucao": {
                "valor_ano_anterior": round(venda_ano_anterior, 2),
                "percentual": round(evolucao_percentual)  # positivo/negativo
            },
            "objetivos_mix_hierarquico": {
                "empresa": mix_empresa_val,
                "supervisores": mix_supervisores_map
            },
            "pre-venda": {
                "valor_prevenda": round(valor_prevenda, 2),
                "valor_alocado": round(valor_alocado, 2),
                "percentual_prevenda_alocado": round(percentual_prevenda_alocado, 2),
                "variacao_prevenda": round(variacao_prevenda, 2)
            },
            "vendas": vendido,  # já com 'vendas_por_vendedor' + merges + agregados
            "realizado_peso": {
                "realizado": round(peso_realizado, 2),  
                "percentual": round(percentual, 2),
                "variacao": round(variacao, 2),
            },
            "realizado_financeiro": {
                "valor": round(venda_realizada, 2),
                "percentual_cobertura": round(percentual_cobertura, 2),
                "variacao": round(variacao_financeira, 2),
                 
            },
            "positivacao": {
                "realizado": positivacao_realizado_geral,
                "realizado_rotas": positivacao_realizado_geral,
                "cupons_pdv": cupons_pdv_total,
                "realizado_total": positivacao_realizado_geral + cupons_pdv_total,
                "percentual": percentual_positivacao,
                "variacao": variacao_positivacao
            },
            "realizado_mix": {
                "realizado": mix_realizado,
                "percentual": percentual_mix,
                "variacao": variacao_mix,
                "mix_pdv_grupo": mix_pdv_supervisor if not rotas_info.get("e_gerente") else _mix_pdv_empresa,
            },
            "positivacao_detalhada": positivacao,
            "ruptura": {
                "total_valor": ruptura_total,
                "percentual_captado": percentual_captado
            },
            #  KPIs do vendedor logado =====
            "minha_visao": minha_visao,
            #: escopo por área de supervisão (para gerente) =====
            "escopo_rotas": {
                "e_gerente"         : rotas_info.get("e_gerente", False),
                "e_supervisor"      : getattr(ctx, "is_supervisor", False) and not rotas_info.get("e_gerente", False),  # ← NOVO
                "areas_supervisao"  : grupos_supervisao,   # populado só para gerente
                "vendedores_escopo" : vendedores or [],    # ← NOVO: lista dos vendedores do supervisor
            },
           "projecao_empresa": {
                "dias_uteis": dias_info,
                "tem_pdv": tem_pdv, 
                "financeiro": projecao_financeira_geral, 
                "financeiro_rotas": proj_rotas_geral, 
                "financeiro_pdv": proj_pdv_geral,
                "peso": projecao_peso_geral,
                "peso_rotas": proj_peso_rotas_geral,
                "positivacao": projecao_positivacao_geral,
                "mix": {
                    "realizado": mix_realizado,
                    "objetivo": objetivo_mix,
                    "percentual": percentual_mix,
                    "projecao": projecao_mix_geral
                },
                "detalhes_valores": {
                    "rotas": venda_realizada, # Certifique-se que esta variável existe (ou venda_realizada_rotas)
                    "pdv": venda_pdv_total,
                    "total": venda_total_empresa
                },
                 "mix_pdv_empresa": _mix_pdv_empresa,
                 "num_meses":       num_meses,         
                 "multiplos_meses": multiplos_meses,   
            },
            "periodo_info": {
                "num_meses":        num_meses,
                "multiplos_meses":  multiplos_meses,
                "de":               data_inicio,
                "ate":              data_fim,
            },
        })

    def _realizado_area(self, ctx, data_fim, data_inicio, is_filial, objetivos_vendedores, rotas_info, ug_filial, v, vendedores_set):
        # =========================
        # VENDAS REALIZADAS (ÁREA)
        # =========================
        eh_gerente = getattr(ctx, "is_supervisor", False) and rotas_info.get("e_gerente")

        _esc_vend = sorted(vendedores_set) if vendedores_set else []
 
        if is_filial:
            vendido = buscar_vendas_por_vendedor(
                data_inicio, data_fim, 
                unid_gestora=ug_filial, 
                agrupar_por_filial=True, 
                cod_representante=ctx.cod_funcionario
            )
        elif eh_gerente and vendedores_set:
            vendido = get_cache_mes("vendas_por_vendedor", data_inicio, data_fim, _esc_vend)
            if vendido is None:
                vendido = buscar_vendas_por_vendedor(
                    data_inicio, data_fim, cod_vendedores=list(vendedores_set)
                )
                set_cache_mes("vendas_por_vendedor", data_inicio, data_fim, vendido, _esc_vend)
        else:
            vendido = get_cache_mes("vendas_por_vendedor", data_inicio, data_fim, _esc_vend)
            if vendido is None:
                vendido = buscar_vendas_por_vendedor(data_inicio, data_fim)
                set_cache_mes("vendas_por_vendedor", data_inicio, data_fim, vendido, _esc_vend)

        lista = vendido.get("vendas_por_vendedor", []) or []

        # Só mantém o filtro em memória para quem NÃO é gerente
        if not eh_gerente and vendedores_set:
            lista = [it for it in lista if _to_int(it.get("codcampo")) in vendedores_set]

            # =========================================================
            existing_ids = set()
            for it in lista:
                cid = _to_int(it.get("codcampo"))
                if cid is not None:
                    existing_ids.add(cid)
            
            missing_ids = vendedores_set - existing_ids
            
            if missing_ids:
                # Mapa de nomes para usar no fallback (tenta pegar dos objetivos)
                name_map = {}
                for o in (objetivos_vendedores or []):
                     try:
                         vid = int(str(o.get("vendedor_id")).strip())
                         name_map[vid] = o.get("nome_vendedor")
                     except: pass
                
                for mid in missing_ids:
                    # Tenta achar o nome, senão usa o ID
                    nome = name_map.get(mid, f"Vendedor {mid}")
                    
                    # Cria o objeto "zerado". 
                    # NOTA: O Ano Anterior e as Projeções serão calculados/preenchidos
                    # nos passos seguintes do código (linhas abaixo), pois inserimos isso NO INÍCIO.
                    lista.append({
                        "codcampo": str(mid),
                        "Campo": nome,
                        "ValorLiquido": 0.0,
                        "PesoTotal": 0.0,
                        "Mix": 0,
                        "QtdClientes": 0,
                        "PreVenda_Valor": 0.0,
                        "Ruptura_TotalValor": 0.0,
                        "Positivacao_Realizado": 0.0,
                        # Inicializa AA com 0, mas o bloco "ANO ANTERIOR" logo abaixo vai atualizar isso
                        "Ano_anterior_QtdClientes": 0,
                        "Ano_anterior_ValorLiquido": 0,
                        "Ano_anterior_PesoTotal": 0,
                        "Ano_anterior_Mix": 0
                    })


        # somatórios
        venda_realizada = sum(_to_float(it.get("ValorLiquido")) for it in lista)
        peso_realizado  = sum(_to_float(it.get("PesoTotal"))    for it in lista)
        venda_ano_anterior_rotas = None


        # ==============================================================================
        # 🔧 REGRA ESPECÍFICA: TIME DO SUPERVISOR 228 (Apenas para o Ano Anterior)
        # ==============================================================================
        vendedores_aa_set = vendedores_set.copy()
        
        cod_logado = getattr(ctx, "cod_funcionario", None)
        eh_time_228 = False

        if cod_logado:
            # 1. É o próprio supervisor 228?
            if str(cod_logado) == '228':
                eh_time_228 = True
            # 2. Se não, verifica se o supervisor dele é o 228
            else:
                cod_chefe = obter_cod_supervisor(int(cod_logado))
                if cod_chefe and str(cod_chefe) == '228':
                    eh_time_228 = True

        if eh_time_228:
            # Busca todos do banco para aplicar o filtro customizado
            todos_dados = Todos_Vendedores().get("detalhamento", [])
            
            custom_aa = set()
            for v in todos_dados:
                try:
                    c_func = int(v.get("CodFuncionario"))
                    c_ug   = int(v.get("unidgestora") or 0)
                    
                    # Filtro: UnidGestora = 1 AND CodFuncionario NOT IN (1, 4)
                    if c_ug == 1 and c_func not in (1, 4):
                        custom_aa.add(c_func)
                except (TypeError, ValueError):
                    continue
            
            vendedores_aa_set = custom_aa
            
            logger.debug(
                f"[IndicadoresView] Regra Time 228 (Logado: {cod_logado}) aplicada p/ Ano Anterior. "
                f"Vendedores filtrados: {len(vendedores_aa_set)}"
            )

        venda_realizada = sum(_to_float(it.get("ValorLiquido")) for it in lista)
        peso_realizado  = sum(_to_float(it.get("PesoTotal"))    for it in lista)

      
        _vars = locals()  # fallback: variáveis só definidas em alguns ramos
        return (
            _vars.get("c_func"),
            _vars.get("it"),
            _vars.get("lista"),
            _vars.get("nome"),
            _vars.get("o"),
            _vars.get("peso_realizado"),
            _vars.get("v"),
            _vars.get("venda_ano_anterior_rotas"),
            _vars.get("venda_realizada"),
            _vars.get("vendedores_aa_set"),
            _vars.get("vendido"),
            _vars.get("vid"),
        )

    def _montar_contexto_escopo_objetivos(self, data_fim, data_inicio, num_meses, request):

        # ===== LOG DO PERFIL QUE ESTÁ FAZENDO A CHAMADA =====
        ctx = get_role_context(request.user)
        logger.info(
            "[IndicadoresView] user=%s id=%s roles=%s cod_funcionario=%s cod_unid_gestora=%s de=%s ate=%s ip=%s",
            getattr(request.user, "username", None),
            getattr(request.user, "id", None),
            ",".join(ctx.roles) if ctx.roles else "-",
            ctx.cod_funcionario,
            ctx.cod_unid_gestora,
            data_inicio,
            data_fim,
            request.META.get("REMOTE_ADDR"),
        )
        # ====================================================
        is_filial = (
            bool(ctx.cod_unid_gestora and str(ctx.cod_unid_gestora) not in ('', '1', 'None'))
            and not getattr(ctx, "is_supervisor", False)   # ← supervisor nunca é "filial"
            and not getattr(ctx, "is_vendedor",   False)
        )
        ug_filial = int(ctx.cod_unid_gestora) if is_filial else None
        # 1) Rotas / vendedores conforme papel
        rotas_info = buscar_rotas_usuario(ctx)  # -> {'rotas': None|[...], 'detalhado': [...], 'vendedores': [...]}
        logger.debug(
            "[IndicadoresView] escopo rotas: eh_supervisor=%s eh_vendedor=%s eh_admin=%s "
            "rotas=%s vendedores=%s e_gerente=%s qtd_detalhado=%s amostra_detalhado=%s",
            getattr(ctx, "is_supervisor", False),
            getattr(ctx, "is_vendedor", False),
            getattr(ctx, "is_admin", False),
            rotas_info.get("rotas"),
            rotas_info.get("vendedores"),
            rotas_info.get("e_gerente"),
            len(rotas_info.get("detalhado") or []),
            (rotas_info.get("detalhado") or [])[:3],  # só uma amostra pra não floodar o log
            
        )
        if is_filial:
            vendedores = [int(ctx.cod_funcionario)] # Força ser só ele
        elif getattr(ctx, "is_supervisor", False):
            vendedores = rotas_info.get("vendedores") if rotas_info else None

        
        rotas_codigos = rotas_info.get("rotas") if rotas_info else None
        logger.debug("%s %s", ">>> ROTAS X VENDEDOR", rotas_info)

        # 🔧 PRIORIDADE: supervisor/gerente > vendedor
        if getattr(ctx, "is_supervisor", False):
            # supervisor/gerente: usa o escopo calculado no serviço (NÃO pode cair no escopo "mesma supervisão")
            vendedores = rotas_info.get("vendedores") if rotas_info else None
        else:
            # vendedor "puro": usa lista da mesma supervisão
            if getattr(ctx, "is_vendedor", False):
                try:
                    vendedores = buscar_vendedores_mesma_supervisao(ctx.cod_funcionario) or [int(ctx.cod_funcionario)]
                except Exception:
                    vendedores = [int(ctx.cod_funcionario)] if ctx.cod_funcionario else None
            else:
                # admin/outros: usa o escopo calculado no serviço
                vendedores = rotas_info.get("vendedores") if rotas_info else None

        # 🔧 Se for SUPERVISOR-GERENTE, montamos também grupos por área de supervisão
        grupos_supervisao = None
        if getattr(ctx, "is_supervisor", False) and rotas_info.get("e_gerente"):
            grupos_supervisao = rotas_info.get("areas_supervisao")
            logger.debug(
                "[IndicadoresView] supervisor-gerente detectado: cod_func=%s qtd_areas=%s grupos=%s",
                ctx.cod_funcionario,
                len(grupos_supervisao or []),
                grupos_supervisao,
            )
            

        logger.debug(
            "[IndicadoresView] vendedores considerados para escopo: %s (e_gerente=%s)",
            vendedores,
            rotas_info.get("e_gerente"),
        )
        #  OBJETIVOS — tudo do SQLite agora
        objetivo_mensal_data = get_objetivo_mensal_serializado(
                request.user, data_inicio, data_fim=data_fim, cod_vendedores=vendedores
            )

        objetivo = {
            "financeiro":           round(float(objetivo_mensal_data.get("objetivo_financeiro") or 0), 2),
            "objetivo_mix":         round(float(objetivo_mensal_data.get("objetivo_mix") or 0), 2),
            "objetivo_peso":        round(float(objetivo_mensal_data.get("objetivo_peso") or 0), 2),
            "objetivo_positivacao": round(float(objetivo_mensal_data.get("objetivo_positivacao") or 0), 2),
        }
        
        # ------------------------------------------------------------------
        # 🆕 LÓGICA DE MIX HIERÁRQUICO (Empresa/Supervisor)
        # ------------------------------------------------------------------
        mix_empresa_val = 0
        mix_supervisores_map = {} # { 'cod_supervisor_str': valor }

        try:
            meses_mix = _meses_no_periodo(data_inicio, data_fim)
            mix_nivel_qs = ObjetivoMixNivel.objects.filter(mes_referencia__in=meses_mix)
            
            for m in mix_nivel_qs:
                if m.nivel == 'EMPRESA':
                    mix_empresa_val += m.objetivo_mix          # ← acumula (soma bruta dos meses)
                elif m.nivel == 'SUPERVISOR':
                    cod = str(m.codigo_alvo)
                    mix_supervisores_map[cod] = mix_supervisores_map.get(cod, 0) + m.objetivo_mix  # ← acumula (soma bruta dos meses)

            # 🔧 CORREÇÃO: Mix/Positivação são metas MENSAIS recorrentes — o restante
            # do sistema (get_objetivo_mensal_serializado, get_objetivos_vendedores_por_mes,
            # _calcular_media_mix_pos_por_mes) sempre trabalha com MÉDIA mensal.
            # Aqui a soma dos meses precisa virar média também, senão o objetivo fica
            # "num_meses vezes maior" que o realizado (que já vem em média) quando o
            # período consultado abrange mais de um mês.
            if num_meses > 1:
                mix_empresa_val = round(mix_empresa_val / num_meses, 1)
                mix_supervisores_map = {
                    cod: round(valor / num_meses, 1)
                    for cod, valor in mix_supervisores_map.items()
                }

            # --- AJUSTE DO OBJETIVO PRINCIPAL (Card de Mix) ---
            # Se for Gerente/Admin, a meta geral padrão é a da EMPRESA
            eh_gerente_rotas = rotas_info.get("e_gerente", False)

            # Verifica se é Gerente pelo Profile (ctx) OU pelas Rotas (ERP)
            if getattr(ctx, "is_gerente", False) or getattr(ctx, "is_admin", False) or eh_gerente_rotas:
                # Se for Gerente/Admin, a meta geral padrão é a da EMPRESA
                if mix_empresa_val > 0:
                    objetivo["objetivo_mix"] = mix_empresa_val
            
            # Se for Supervisor, a meta geral dele é a SUA meta de nível
            elif getattr(ctx, "is_supervisor", False):
                cod_sup = str(ctx.cod_funcionario)
                if cod_sup in mix_supervisores_map:
                    objetivo["objetivo_mix"] = mix_supervisores_map[cod_sup]

        except Exception as e:
            logger.error(f"Erro ao buscar ObjetivoMixNivel: {e}")

        # ------------------------------------------------------------------
        
        
        objetivos_vendedores = get_objetivos_vendedores_por_mes(data_inicio, data_fim=data_fim)



        # == agrega objetivos por área de supervisão (para gerente) ===
        def _agregar_objetivos_por_area(areas_supervisao, objetivos_vendedores, mix_map):
            """
            Soma Financeiro/Peso/Positivação dos vendedores.
            PARA MIX: Usa a meta do Supervisor (mix_map) se existir, senão soma (fallback).
            """
            if not areas_supervisao:
                return areas_supervisao

            # Mapa auxiliar de objetivos individuais
            obj_by_vendedor = {}
            for o in objetivos_vendedores or []:
                try:
                    vend_id = int(str(o.get("vendedor_id")).strip())
                    obj_by_vendedor[vend_id] = {
                        "financeiro": float(o.get("objetivo_financeiro") or 0),
                        "peso":       float(o.get("objetivo_peso") or 0),
                        "mix":        float(o.get("objetivo_mix") or 0),
                        "pos":        float(o.get("objetivo_positivacao") or 0),
                    }
                except (ValueError, TypeError):
                    continue

            for area in areas_supervisao:
                soma_fin  = 0.0
                soma_peso = 0.0
                soma_mix_vendedores = 0.0
                soma_pos  = 0.0

                for vend in area.get("vendedores") or []:
                    try:
                        vend_id = int(str(vend).strip())
                        obj = obj_by_vendedor.get(vend_id)
                        if obj:
                            soma_fin  += obj["financeiro"]
                            soma_peso += obj["peso"]
                            soma_mix_vendedores += obj["mix"]
                            soma_pos  += obj["pos"]
                    except: pass

                area["objetivo_financeiro_area"]  = round(soma_fin, 2)
                area["objetivo_peso_area"]        = round(soma_peso, 2)
                area["objetivo_positivacao_area"] = round(soma_pos, 2)
                
                # 🔥 AQUI: Se existe meta para este supervisor, usa ela. 
                # Caso contrário, usa a soma dos vendedores.
                cod_sup = str(area.get("cod_supervisor"))
                if cod_sup in mix_map:
                    area["objetivo_mix_area"] = mix_map[cod_sup]
                else:
                    area["objetivo_mix_area"] = round(soma_mix_vendedores, 2)

            return areas_supervisao

        # Se for supervisor-gerente, já devolve as áreas com os objetivos agregados
        if grupos_supervisao:
            grupos_supervisao = _agregar_objetivos_por_area(
            grupos_supervisao, 
            objetivos_vendedores, 
            mix_supervisores_map  # <--- Adicione este argumento
        )

        # variáveis locais
        objetivo_financeiro   = objetivo["financeiro"]
        objetivo_mix          = objetivo["objetivo_mix"]
        objetivo_peso         = objetivo["objetivo_peso"]
        objetivo_positivacao  = objetivo["objetivo_positivacao"]
        

        vendedores_list = vendedores or []
        vendedores_set = { _to_int(v) for v in vendedores_list if _to_int(v) is not None }
        # 🔧 REGRA 228/4: LISTA ESPECÍFICA PARA O MIX
        # Adiciona o vendedor 4 apenas para a consulta de quantidade de Mix
        # =========================================================
        vendedores_mix_list = list(vendedores_list)
        try:
            cod_logado_str = str(ctx.cod_funcionario)
            if cod_logado_str in ['228', '4']:
                if 4 not in vendedores_mix_list:
                    vendedores_mix_list.append(4)
                    logger.debug(f"[IndicadoresView] Regra 228/4 aplicada: Vendedor 4 incluído no cálculo do MIX.")
        except Exception:
            pass

        _vars = locals()  # fallback: variáveis só definidas em alguns ramos
        return (
            _vars.get("cod"),
            _vars.get("ctx"),
            _vars.get("grupos_supervisao"),
            _vars.get("is_filial"),
            _vars.get("mix_empresa_val"),
            _vars.get("mix_supervisores_map"),
            _vars.get("objetivo"),
            _vars.get("objetivo_financeiro"),
            _vars.get("objetivo_mix"),
            _vars.get("objetivo_peso"),
            _vars.get("objetivo_positivacao"),
            _vars.get("objetivos_vendedores"),
            _vars.get("rotas_codigos"),
            _vars.get("rotas_info"),
            _vars.get("ug_filial"),
            _vars.get("v"),
            _vars.get("valor"),
            _vars.get("vendedores"),
            _vars.get("vendedores_set"),
        )
        



    




    







    







    










 
 

    





    






 
def _calcular_media_mix_pos_por_mes(
    meses_periodo: list,
    rotas_codigos,
    vendedores,
) -> dict:
    """
    Consulta mix e positivação mês a mês (usando cache) e devolve:
    {
        "mix_global":      float,   # média mensal do grupo inteiro
        "pos_global":      float,   # média mensal do grupo inteiro
        "mix_por_vend":    {cod: float},  # média mensal por vendedor
        "pos_por_vend":    {cod: float},  # média mensal por vendedor
        "positivacao_detalhado_ultimo_mes": list,  # último mês (para merges)
        "cupons_pdv_total": int,
    }
    """
    from datetime import date, timedelta
 
    mix_totais    = []   # [mix_jan, mix_fev, mix_mar]
    pos_totais    = []   # [pos_jan, pos_fev, pos_mar]
 
    # acumuladores por vendedor: {cod: [v_jan, v_fev, v_mar]}
    mix_por_vend_acc = {}
    pos_por_vend_acc = {}
 
    positivacao_detalhado_ultimo = []
 
    for mes_date in meses_periodo:
        mes_ini = mes_date.strftime("%Y-%m-%d")
        # último dia do mês
        if mes_date.month == 12:
            ultimo = date(mes_date.year + 1, 1, 1) - timedelta(days=1)
        else:
            ultimo = date(mes_date.year, mes_date.month + 1, 1) - timedelta(days=1)
        mes_fim = ultimo.strftime("%Y-%m-%d")
 
        _esc_v = sorted(int(v) for v in (vendedores or []) if v is not None)
        _esc_r = sorted(int(r) for r in (rotas_codigos or []) if r is not None)
        _esc_pos = _esc_v + _esc_r
 
        # ── Mix global do mês ────────────────────────────────────────────────
        dm = get_cache_mes("venda_mix", mes_ini, mes_fim, _esc_v)
        if dm is None:
            dm = buscar_venda_mix(mes_ini, mes_fim, cod_vendedores=vendedores)
            set_cache_mes("venda_mix", mes_ini, mes_fim, dm, _esc_v)
        mix_totais.append(float(dm.get("mix_realizado") or 0))
 
        # ── Mix por vendedor (vem do campo Mix em vendas_por_vendedor) ───────
        vv = get_cache_mes("vendas_por_vendedor", mes_ini, mes_fim, _esc_v)
        if vv is None:
            vv = buscar_vendas_por_vendedor(
                mes_ini, mes_fim,
                cod_vendedores=vendedores if vendedores else None
            )
            set_cache_mes("vendas_por_vendedor", mes_ini, mes_fim, vv, _esc_v)
 
        for row in (vv.get("vendas_por_vendedor") or []):
            cod = _to_int(row.get("codcampo"))
            if cod is not None:
                mix_por_vend_acc.setdefault(cod, []).append(
                    float(row.get("Mix") or 0)
                )
 
        # ── Positivação global do mês ────────────────────────────────────────
        pm = get_cache_mes("positivacao", mes_ini, mes_fim, _esc_pos)
        if pm is None:
            pm = buscar_positivacao_por_rota(
                mes_ini, mes_fim,
                rotas=rotas_codigos,
                cod_vendedores=vendedores,
            )
            set_cache_mes("positivacao", mes_ini, mes_fim, pm, _esc_pos)
        pos_totais.append(float(pm.get("positivacao_realizado_geral") or 0))
        positivacao_detalhado_ultimo = pm.get("detalhado") or []
 
        # ── Positivação por vendedor ─────────────────────────────────────────
        for item in positivacao_detalhado_ultimo:
            cod = _to_int(item.get("CodFuncionario"))
            if cod is not None:
                realizado = float(
                    item.get("ClientesPositivadosRota")
                    or item.get("Realizado")
                    or 0
                )
                pos_por_vend_acc.setdefault(cod, []).append(realizado)
 
    n = max(len(meses_periodo), 1)
 
    # Médias simples por vendedor
    mix_media_vend = {
        cod: round(sum(vals) / len(vals), 1)
        for cod, vals in mix_por_vend_acc.items()
    }
    pos_media_vend = {
        cod: round(sum(vals) / len(vals), 1)
        for cod, vals in pos_por_vend_acc.items()
    }
 
    return {
        "mix_global":   round(sum(mix_totais) / n, 1),
        "pos_global":   round(sum(pos_totais) / n, 1),
        "mix_por_vend": mix_media_vend,
        "pos_por_vend": pos_media_vend,
        "positivacao_detalhado_ultimo_mes": positivacao_detalhado_ultimo,
    }
 
 
def _media_ponderada_supervisor(
    mix_ou_pos_por_vend: dict,
    objetivos_vendedores: list,
    chave_obj: str,  # "objetivo_mix" ou "objetivo_positivacao"
) -> float:
    """
    Média ponderada de mix/pos do grupo de um supervisor.
    Peso = objetivo individual do vendedor (maior meta → maior peso).
 
    Retorna 0.0 se não houver dados.
    """
    soma_numerador   = 0.0
    soma_denominador = 0.0
 
    obj_map = {
        str(o.get("vendedor_id")): float(o.get(chave_obj) or 0)
        for o in (objetivos_vendedores or [])
    }
 
    for cod, media_vend in mix_ou_pos_por_vend.items():
        peso = obj_map.get(str(cod), 0.0)
        if peso > 0:
            soma_numerador   += media_vend * peso
            soma_denominador += peso
 
    if soma_denominador == 0:
        # fallback: média simples quando não há objetivos cadastrados
        vals = list(mix_ou_pos_por_vend.values())
        return round(sum(vals) / len(vals), 1) if vals else 0.0
 
    return round(soma_numerador / soma_denominador, 1)
 
 
def _media_ponderada_gerente(
    mix_ou_pos_por_area: dict,  # {cod_area: {"media": float, "n_vendedores": int}}
) -> float:
    """
    Média ponderada entre supervisões.
    Peso = número de vendedores de cada área.
    """
    soma_num = 0.0
    soma_den = 0
    for area_data in mix_ou_pos_por_area.values():
        n = area_data.get("n_vendedores", 0)
        m = area_data.get("media", 0.0)
        soma_num += m * n
        soma_den += n
    return round(soma_num / soma_den, 1) if soma_den else 0.0
 









