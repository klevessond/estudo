"""Vendas por vendedor, venda de hoje e resumo por segmento/área. Movido de main_views.py."""
import logging
from collections import defaultdict
from datetime import datetime

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from dashboard.roles import get_role_context
from dashboard.services.indicadores.cache_mes import (
    get_cache_mes,
    set_cache_mes,
)
from dashboard.services.indicadores.info_service import Todos_Vendedores
from dashboard.services.indicadores.pdv_mix_service import buscar_mix_pdv_por_perfil
from dashboard.services.indicadores.pdv_service import buscar_cupons_por_vendedor
from dashboard.services.indicadores.rotas_simples import (
    buscar_rotas_usuario,
    buscar_vendedores_mesma_supervisao,
)
from dashboard.services.indicadores.ruptura_service import buscar_ruptura
from dashboard.services.indicadores.vendas_service import (
    buscar_pre_venda,
    buscar_resumo_segmento_area_venda,
    buscar_vendas_por_vendedor,
)
from dashboard.services.indicadores.venda_hoje_service import buscar_venda_hoje
from dashboard.services.usuarios.funcionario_service import obter_unid_gestoras_por_vendedores

logger = logging.getLogger(__name__)


class VendasPorVendedorView(APIView):
    def get(self, request):
        data_inicio = request.GET.get("de")
        data_fim = request.GET.get("ate")

        print("\n============================")
        print("🔥 [VENDAS POR VENDEDOR] INÍCIO")
        print(f"Período solicitado: de={data_inicio} até={data_fim}")
        print("============================")

        if not data_inicio or not data_fim:
            return Response(
                {"error": "Parâmetros 'de' e 'ate' são obrigatórios."},
                status=400
            )

        # === CONTEXTO DO USUÁRIO ===
        ctx = get_role_context(request.user)

        # usa getattr para não quebrar se o atributo não existir
        is_vendedor = getattr(ctx, "is_vendedor", False)
        is_supervisor = getattr(ctx, "is_supervisor", False)
        is_gerente = getattr(ctx, "is_gerente", False) 
        is_filial = (
            bool(ctx.cod_unid_gestora and str(ctx.cod_unid_gestora) not in ('', '1', 'None'))
            and not getattr(ctx, "is_supervisor", False)   # ← supervisor nunca é "filial"
            and not getattr(ctx, "is_vendedor",   False)
        )
        ug_filial = int(ctx.cod_unid_gestora) if is_filial else None

        print(f"[DEBUG] Usuário: {request.user}")
        print(
            f"[DEBUG] Papel detectado -> "
            f"vendedor={is_vendedor}, supervisor={is_supervisor}, gerente={is_gerente}"
        )
        print(f"[DEBUG] Cod funcionário: {getattr(ctx, 'cod_funcionario', None)}")
        print("----------------------------")

        rotas_info = buscar_rotas_usuario(ctx)
        vendedores = None

        # === REGRAS DE EXIBIÇÃO (PRIORIDADE: GERENTE > SUPERVISOR > VENDEDOR) ===
        if is_gerente:
            # gerente: não aplica filtro → vê todos
            vendedores = None
            print("[DEBUG] Usuário é GERENTE → NÃO será aplicado filtro de vendedores (acesso a todos).")

        elif is_supervisor:
            # supervisor: usa o escopo já calculado em buscar_rotas_usuario
            vendedores = rotas_info.get("vendedores") if rotas_info else None
            print(f"[DEBUG] Usuário é SUPERVISOR → vendedores do escopo: {vendedores}")

        elif is_vendedor:
            # vendedor: lista apenas ele + colegas da mesma supervisão
            vendedores = buscar_vendedores_mesma_supervisao(ctx.cod_funcionario)
            print(f"[DEBUG] Usuário é VENDEDOR → vendedores da mesma supervisão: {vendedores}")

        else:
            # outros perfis “acima” ou diferentes → também não filtra
            vendedores = None
            print("[DEBUG] Usuário NÃO é vendedor/supervisor/gerente → sem filtro de vendedores (acesso a todos).")

        # helper robusto para int
        def to_int(v):
            try:
                return int(str(v).strip())
            except Exception:
                return None

# --- 1. PREPARA O FILTRO (Restaurado) ---
        vendedores_set = set()
        if vendedores:
            vendedores_set = {to_int(v) for v in vendedores if to_int(v) is not None}
            print(f"[DEBUG] vendedores_set gerado para filtro: {vendedores_set}")

        print("----------------------------")

        # --- 2. BUSCA DADOS NO BANCO (Restaurado - AQUI estava o erro) ---
        if is_filial:
            resultado = buscar_vendas_por_vendedor(
                data_inicio, data_fim, 
                unid_gestora=ug_filial, 
                agrupar_por_filial=True, 
                cod_representante=ctx.cod_funcionario
            )
        else:
            _esc_tabela = []   # sem escopo = todos
            resultado = get_cache_mes("vendas_por_vendedor", data_inicio, data_fim, _esc_tabela)
            if resultado is None:
                resultado = buscar_vendas_por_vendedor(data_inicio, data_fim)
                set_cache_mes("vendas_por_vendedor", data_inicio, data_fim, resultado, _esc_tabela)
        
        lista = resultado.get("vendas_por_vendedor", []) or []

        print(f"[DEBUG] Total bruto retornado por buscar_vendas_por_vendedor: {len(lista)} vendedores")

        # === 3. APLICA FILTRO + PREENCHIMENTO (Gap Filling) ===
        if vendedores_set:
            lista_filtrada = [
                item for item in lista
                if to_int(item.get("codcampo")) in vendedores_set
            ]
            
            # --- FIX: Gap Filling (Vendedores sem venda mas no escopo) ---
            existing_ids = {to_int(it.get("codcampo")) for it in lista_filtrada if to_int(it.get("codcampo")) is not None}
            missing_ids = vendedores_set - existing_ids
            
            if missing_ids:
                print(f"[DEBUG] Gap Filling Tabela: Adicionando {len(missing_ids)} vendedores sem venda: {missing_ids}")
                
                # --- BUSCA ROBUSTA DE NOMES ---
                name_map = {}
                
                # Tentativa 1: Todos_Vendedores (Dados Comerciais)
                try:
                    todos = Todos_Vendedores().get("detalhamento", [])
                    for v in todos:
                        # Tenta pegar código e nome com variações de chave
                        c = v.get("CodFuncionario") or v.get("cod_funcionario")
                        n = v.get("Funcionario") or v.get("Nome") or v.get("nome")
                        if c and n:
                            try:
                                # Salva como INT e STRING para garantir o match
                                name_map[int(c)] = n.strip()
                                name_map[str(c).strip()] = n.strip()
                            except: pass
                except Exception as e:
                    print(f"[DEBUG] Erro ao carregar Todos_Vendedores: {e}")

                # Tentativa 2: listar_funcionarios (Dados de Cadastro - Fallback)
                if len(name_map) < len(missing_ids):
                    try:
                        from dashboard.services.usuarios.funcionario_service import listar_funcionarios
                        funcs = listar_funcionarios()
                        for f in funcs:
                            c = f.get("codigo") or f.get("id")
                            n = f.get("nome") or f.get("usuario")
                            if c and n:
                                try:
                                    name_map[int(c)] = n.strip()
                                    name_map[str(c).strip()] = n.strip()
                                except: pass
                    except Exception as e:
                        print(f"[DEBUG] Erro ao carregar listar_funcionarios: {e}")

                # Preenchimento
                for mid in missing_ids:
                    # Busca o nome no mapa (tenta como int e str)
                    nome = name_map.get(mid) or name_map.get(str(mid)) or f"Vendedor {mid}"
                    
                    lista_filtrada.append({
                        "codcampo": str(mid),
                        "Campo": nome, # Agora deve vir o nome correto!
                        "ValorLiquido": 0.0,
                        "PesoTotal": 0.0,
                        "Mix": 0,
                        "QtdClientes": 0,
                        "PreVenda_Valor": 0.0,
                        "Ruptura_TotalValor": 0.0,
                        "Positivacao_Realizado": 0.0,
                        "Ano_anterior_QtdClientes": 0,
                        "Ano_anterior_ValorLiquido": 0,
                        "Ano_anterior_PesoTotal": 0,
                        "Ano_anterior_Mix": 0
                    })

            print(
                f"[DEBUG] Filtro APLICADO → de {len(lista)} foram mantidos "
                f"{len(lista_filtrada)} vendedores (com gap filling)."
            )
            resultado["vendas_por_vendedor"] = lista_filtrada
            
        # Atualiza a lista final
        lista = resultado.get("vendas_por_vendedor", [])
        print(f"[DEBUG] Total bruto retornado por buscar_vendas_por_vendedor: {len(lista)} vendedores")

        # === APLICA FILTRO (somente se houver lista de vendedores) ===
        if vendedores_set:
            lista_filtrada = [
                item for item in lista
                if to_int(item.get("codcampo")) in vendedores_set
            ]
            print(
                f"[DEBUG] Filtro APLICADO → de {len(lista)} foram mantidos "
                f"{len(lista_filtrada)} vendedores."
            )
            resultado["vendas_por_vendedor"] = lista_filtrada
        else:
            print("[DEBUG] Nenhum filtro aplicado → mantendo TODOS os vendedores retornados.")

        print("----------------------------")
        print("[DEBUG] Iniciando cálculo de pré-venda…")

        chave = f"prevenda_{data_inicio}_{data_fim}"
        prevenda = get_cache_mes("pre_venda", data_inicio, data_fim, [])
        if prevenda is None:
            prevenda = buscar_pre_venda(data_inicio, data_fim)
            set_cache_mes("pre_venda", data_inicio, data_fim, prevenda, [])
        prevenda_por_vendedor = defaultdict(float)
        for item in prevenda.get("detalhado", []):
            cod_vend = to_int(item.get("CodVendedor"))
            if cod_vend is None:
                continue
            valor = float(item.get("Valor", 0) or 0)
            prevenda_por_vendedor[cod_vend] += valor
        
        print("[DEBUG] Iniciando cálculo de cupons PDV...")
        lista_cupons = buscar_cupons_por_vendedor(data_inicio, data_fim)
        
        # Cria um dicionário para facilitar a busca por código do vendedor
        cupons_por_vendedor = {}
        for c in lista_cupons:
            cod_vend = to_int(c.get("CodVendedor"))
            if cod_vend is not None:
                cupons_por_vendedor[cod_vend] = {
                    "quantidade": c.get("QuantidadeCupons", 0),
                    "valor": float(c.get("ValorTotalCupons", 0) or 0)
                }
        # ── Mix PDV por vendedor (1 query de UGs + 2 queries do service) ──
        _mix_pdv_por_vendedor = {}
        _lista_ids = [
            to_int(v.get("codcampo"))
            for v in resultado.get("vendas_por_vendedor", [])
            if to_int(v.get("codcampo"))
        ]
        if _lista_ids:
            try:
                _raw_ugs = obter_unid_gestoras_por_vendedores(_lista_ids)
                _mapa_ugs = {
                    vid: [str(u) for u in ugs if str(u).strip() and str(u) != "1"]
                    for vid, ugs in _raw_ugs.items()
                }
                for vid, ugs_v in _mapa_ugs.items():
                    if ugs_v:
                        _r = buscar_mix_pdv_por_perfil(
                            data_inicio, data_fim,
                            perfil="vendedor",
                            unid_gestoras_vendedor=ugs_v,
                        )
                        _mix_pdv_por_vendedor[vid] = _r.get("Mix", 0)
            except Exception as e:
                print(f"[DEBUG] Erro ao calcular mix_pdv por vendedor: {e}")
        # ────────────────────────────────────────────────────────────────
        # ── Linha 2168 — ADICIONAR após o bloco de mix_pdv (────────────) ──

            # Ano anterior por vendedor — envolvido em try para não quebrar a view
# Ano anterior por vendedor
            _aa_by_cod = {}
            _aa_mes_by_cod = {}
            try:
                _de_dt  = datetime.strptime(data_inicio, "%Y-%m-%d").date()
                _ate_dt = datetime.strptime(data_fim,    "%Y-%m-%d").date()
                _aa_ini = _de_dt.replace(year=_de_dt.year - 1)
                from datetime import date
                _hoje_aa = date.today().replace(year=date.today().year - 1)
                _aa_fim_candidato = _ate_dt.replace(year=_ate_dt.year - 1)
                _aa_fim = min(_aa_fim_candidato, _hoje_aa)

                # até hoje do AA
                if is_filial:
                    _res_aa = buscar_vendas_por_vendedor(
                        _aa_ini.strftime("%Y-%m-%d"), _aa_fim.strftime("%Y-%m-%d"), 
                        unid_gestora=ug_filial, agrupar_por_filial=True, cod_representante=ctx.cod_funcionario
                    )
                else:
                    _res_aa = buscar_vendas_por_vendedor(_aa_ini.strftime("%Y-%m-%d"), _aa_fim.strftime("%Y-%m-%d"))
                    
                for _it in (_res_aa.get("vendas_por_vendedor") or []):
                    _cod = to_int(_it.get("codcampo"))
                    if _cod:
                        _aa_by_cod[_cod] = float(_it.get("ValorLiquido") or 0)

                # mês completo do AA
                import calendar
                _aa_mes_ultimo = calendar.monthrange(_aa_ini.year, _aa_ini.month)[1]
                _aa_mes_fim = _aa_ini.replace(day=_aa_mes_ultimo)
                
                if is_filial:
                    _res_aa_mes = buscar_vendas_por_vendedor(
                        _aa_ini.strftime("%Y-%m-%d"), _aa_mes_fim.strftime("%Y-%m-%d"), 
                        unid_gestora=ug_filial, agrupar_por_filial=True, cod_representante=ctx.cod_funcionario
                    )
                else:
                    _res_aa_mes = buscar_vendas_por_vendedor(_aa_ini.strftime("%Y-%m-%d"), _aa_mes_fim.strftime("%Y-%m-%d"))
                    
                for _it in (_res_aa_mes.get("vendas_por_vendedor") or []):
                    _cod = to_int(_it.get("codcampo"))
                    if _cod:
                        _aa_mes_by_cod[_cod] = float(_it.get("ValorLiquido") or 0)
            except Exception as _e:
                print(f"[DEBUG] Erro ao calcular AA para tabela: {_e}")
            # ────────────────────────────────────────────────────────────────

        print(f"[DEBUG] Pré-venda calculada para {len(prevenda_por_vendedor)} vendedores")

        print(f"[DEBUG] Pré-venda calculada para {len(prevenda_por_vendedor)} vendedores")

        _rup_by_cod = {}
        try:
            _ids_ruptura = [
                to_int(v.get("codcampo"))
                for v in resultado.get("vendas_por_vendedor", [])
                if to_int(v.get("codcampo"))
            ]
            if _ids_ruptura:
                if len(_ids_ruptura) == 1:
                    _rup_dados = buscar_ruptura(data_inicio, data_fim, cod_vendedor=_ids_ruptura[0], cod_vendedores=None)
                else:
                    _rup_dados = buscar_ruptura(data_inicio, data_fim, cod_vendedor=None, cod_vendedores=_ids_ruptura)
                for _r in (_rup_dados.get("resumo") or []):
                    _cod_v = to_int(_r.get("CodVendedor"))
                    if _cod_v is not None:
                        _rup_by_cod[_cod_v] = float(_r.get("TotalValor") or 0)
            print(f"[DEBUG] Ruptura por vendedor carregada: {len(_rup_by_cod)} registros")
        except Exception as _e:
            print(f"[DEBUG] Erro ao calcular ruptura por vendedor: {_e}")

        
        
        
        # Enriquecendo vendedores
        for vendedor in resultado.get("vendas_por_vendedor", []):
            codcampo_int = to_int(vendedor.get("codcampo"))
            valor_prevenda = prevenda_por_vendedor.get(codcampo_int, 0.0)
            # Pega os cupons (se não tiver, retorna 0)
            dados_cupom = cupons_por_vendedor.get(codcampo_int, {"quantidade": 0})
            valor_realizado = float(vendedor.get("ValorLiquido", 0) or 0)
            vendedor["pre-venda"] = round(valor_prevenda, 2)
            vendedor["alocado"] = round(valor_realizado + valor_prevenda, 2)
            # Adiciona as novas chaves no dicionário do vendedor que vai para o FrontEnd
            vendedor["cupons_quantidade"] = dados_cupom["quantidade"]
            vendedor["mix_pdv_realizado"] = _mix_pdv_por_vendedor.get(codcampo_int, 0)
            vendedor["Ano_anterior_ValorLiquido"]     = _aa_by_cod.get(codcampo_int, 0)     
            vendedor["Ano_anterior_mes_ValorLiquido"] = _aa_mes_by_cod.get(codcampo_int, 0)
            vendedor["Ruptura_TotalValor"]            = _rup_by_cod.get(codcampo_int, 0.0)
            # ── venda/dia: PDV conta sábado, rota só seg-sex ──

            print(
                f"[DEBUG] Vendedor {codcampo_int}: "
                f"ValorLiquido={valor_realizado}, prevenda={valor_prevenda}, alocado={vendedor['alocado']}"
                f" Cupons(Qtd)={dados_cupom['quantidade']}, "
            )

        print("🔥 [VENDAS POR VENDEDOR] FIM")
        print("============================\n")

        return Response({"resultado": resultado})


class ResumoSegmentoAreaVendaView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        de = request.GET.get("de")
        ate = request.GET.get("ate")
        cods = request.GET.get("cod_funcionarios")  # opcional: "23,45,209"

        if not de or not ate:
            return Response({"error": "Parâmetros 'de' e 'ate' são obrigatórios."}, status=400)

        def _to_int_list_from_csv(s: str | None):
            out = []
            if not s:
                return out
            for part in s.split(","):
                part = part.strip()
                if not part:
                    continue
                try:
                    out.append(int(part))
                except ValueError:
                    pass
            # únicos e ordenados
            return sorted(set(out))

        # 1) Se o cliente passou a lista via querystring, usamos ela
        cod_func_list = _to_int_list_from_csv(cods)

        # 2) Senão, decidimos conforme o papel do usuário
        if not cod_func_list:
            ctx = get_role_context(request.user)

            if getattr(ctx, "is_supervisor", False):
                # igual ao IndicadoresView: pega vendedores das rotas do supervisor
                rotas_info = buscar_rotas_usuario(ctx)  # {'rotas': [...], 'vendedores': [...], ...}
                vendedores = rotas_info.get("vendedores") if rotas_info else None
                cod_func_list = vendedores or []  # se None, sem filtro
            elif getattr(ctx, "is_vendedor", False):
                # vendedores da mesma área de supervisão do vendedor logado
                cod_func_list = buscar_vendedores_mesma_supervisao(ctx.cod_funcionario) or [ctx.cod_funcionario]
            else:
                # admin / outro papel -> sem filtro (lista vazia = todos)
                cod_func_list = []

         # === busca crua ===
        rows = buscar_resumo_segmento_area_venda(
            de, ate, cod_funcionarios=(cod_func_list or None)
        )

        # === agrega por segmento e prepara os vetores para os gráficos ===
        def to_int(v):
            try:
                return int(v or 0)
            except (TypeError, ValueError):
                return 0

        agrup = defaultdict(lambda: {"QtdCliente": 0, "QtdClientePedido": 0})

        for r in rows or []:
            seg = r.get("Segmento") or r.get("segmento") or "—"
            agrup[seg]["QtdCliente"] += to_int(r.get("QtdCliente"))
            agrup[seg]["QtdClientePedido"] += to_int(r.get("QtdClientePedido"))

        total_cli = sum(v["QtdCliente"] for v in agrup.values())
        total_pos = sum(v["QtdClientePedido"] for v in agrup.values())

        def pct(n, d):
            return round((n / d * 100) if d else 0, 2)

        segmentos_clientes = [
            {
                "Segmento": seg,
                "QtdCliente": vals["QtdCliente"],
                "PercCliente": pct(vals["QtdCliente"], total_cli),
            }
            for seg, vals in agrup.items()
            if vals["QtdCliente"] > 0
        ]
        segmentos_positivacoes = [
            {
                "Segmento": seg,
                "QtdClientePedido": vals["QtdClientePedido"],
                "PercPositivacao": pct(vals["QtdClientePedido"], total_pos),
            }
            for seg, vals in agrup.items()
            if vals["QtdClientePedido"] > 0
        ]
        segmentos_taxa_positivacao = []
        for seg, vals in agrup.items():  # agrup tem QtdCliente e QtdClientePedido por segmento
            base = vals["QtdCliente"]
            posi = vals["QtdClientePedido"]
            if base > 0:
                taxa = round((posi / base) * 100, 2)
                segmentos_taxa_positivacao.append({
                    "Segmento": seg,
                    "QtdCliente": base,
                    "QtdClientePedido": posi,
                    "PercTaxaPositivacao": taxa,
                })

        # ordena decrescente para facilitar o plot
        segmentos_clientes.sort(key=lambda x: x["QtdCliente"], reverse=True)
        segmentos_positivacoes.sort(key=lambda x: x["QtdClientePedido"], reverse=True)
        segmentos_taxa_positivacao.sort(key=lambda x: x["PercTaxaPositivacao"], reverse=True)

        return Response({
            "graficos": {
                "segmentos_clientes": segmentos_clientes,
                "segmentos_positivacoes": segmentos_positivacoes,
                "segmentos_taxa_positivacao": segmentos_taxa_positivacao,
                "totais": {"clientes": total_cli, "positivacoes": total_pos},
            },
            # mantém o payload antigo para compatibilidade, se você ainda precisar
            "resultado": rows,
        })


class VendaHojeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ctx = get_role_context(request.user)

        try:
            # Mesmo critério de escopo usado em IndicadoresView / VendasPorVendedorView
            rotas_info = buscar_rotas_usuario(ctx)

            if getattr(ctx, "is_supervisor", False):
                # supervisor/gerente: vendedores do seu escopo de rotas
                cod_vendedores = rotas_info.get("vendedores") or []

            elif getattr(ctx, "is_vendedor", False):
                # vendedor puro: só ele mesmo (a tela de hoje é individual)
                cod_vendedores = [ctx.cod_funcionario] if ctx.cod_funcionario else []

            else:
                # admin/outros: sem filtro → todos
                cod_vendedores = None

            resultado = buscar_venda_hoje(cod_vendedores=cod_vendedores)
            return Response(resultado)

        except Exception:
            logger.exception("[VendaHojeView] erro")
            return Response({"error": "Erro interno"}, status=500)
