# backend/dashboard/views/campanhas_views.py   (ARQUIVO NOVO)
# Views das campanhas de venda. Não precisa mexer no main_views.py:
# o urls.py importa direto deste módulo.
# Se ainda existirem no main_views.py as classes antigas de campanha
# (CampanhaVendaViewSet, CampanhaVendaObjetivoViewSet, CampanhaVendaProgressoView,
#  MaterialSearchView, FabricanteSearchView), pode apagá-las de lá.

import hashlib
import logging
from datetime import date

from django.core.cache import cache
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from dashboard.models import CampanhaVenda, CampanhaVendaObjetivo
from dashboard.permissions import EscritaAdminGerenteSupervisor
from dashboard.roles import get_role_context
from dashboard.serializers import CampanhaVendaSerializer, CampanhaVendaObjetivoSerializer
from dashboard.services.indicadores.campanhas_service import (
    buscar_realizado_campanha,
    buscar_fabricantes,
    buscar_materiais,
    buscar_grupos,
)
from dashboard.services.indicadores.rotas_simples import buscar_rotas_usuario

logger = logging.getLogger(__name__)

_MEDIDAS = ('peso', 'financeiro', 'quantidade')
_CHAVE_REALIZADO = {'peso': 'Peso', 'financeiro': 'Financeiro', 'quantidade': 'Quantidade'}
_CACHE_TTL_PAINEL = 120  # segundos: o painel do dashboard não precisa ir ao ERP a cada abertura


# ─── helpers de cálculo (usados pela tela de gestão e pelo painel) ───

def _pct(realizado, objetivo):
    return round(realizado / objetivo * 100, 1) if objetivo else None


def _mapa_realizado(rows):
    """[{CodVendedor, Peso, Financeiro, Quantidade}] -> {cod_vendedor: {peso, financeiro, quantidade}}"""
    mapa = {}
    for r in rows:
        if r.get('CodVendedor') is None:
            continue
        mapa[int(r['CodVendedor'])] = {m: float(r.get(_CHAVE_REALIZADO[m]) or 0) for m in _MEDIDAS}
    return mapa


def _consolidar(objetivos, realizado_map):
    """
    Cruza objetivos (model CampanhaVendaObjetivo) com o realizado.
    Retorna (linhas_por_vendedor, totais_equipe, medidas_ativas).
    O total da equipe é a soma dos vendedores recebidos em `objetivos`
    (quem chama decide o escopo). percentual = None quando o objetivo é 0.
    """
    totais = {m: {'objetivo': 0.0, 'realizado': 0.0} for m in _MEDIDAS}
    linhas = []
    for o in objetivos:
        real = realizado_map.get(o.cod_vendedor, {})
        linha = {'id': o.id, 'cod_vendedor': o.cod_vendedor, 'nome_vendedor': o.nome_vendedor}
        for m in _MEDIDAS:
            obj = float(getattr(o, f'objetivo_{m}') or 0)
            rea = float(real.get(m, 0.0))
            linha[m] = {'objetivo': round(obj, 2), 'realizado': round(rea, 2), 'percentual': _pct(rea, obj)}
            totais[m]['objetivo'] += obj
            totais[m]['realizado'] += rea
        linhas.append(linha)

    totais_equipe = {
        m: {
            'objetivo': round(t['objetivo'], 2),
            'realizado': round(t['realizado'], 2),
            'percentual': _pct(t['realizado'], t['objetivo']),
        }
        for m, t in totais.items()
    }
    medidas_ativas = [m for m in _MEDIDAS if totais[m]['objetivo'] > 0]
    return linhas, totais_equipe, medidas_ativas


def _realizado_cacheado(campanha):
    """
    Realizado de TODOS os vendedores no escopo da campanha, com cache curto.
    A chave muda se escopo, fabricante ou período mudarem. Como o cache guarda
    todos os vendedores (não só os da campanha), serve para qualquer usuário:
    o filtro por papel é aplicado depois, em Python.
    """
    itens = sorted(i.cod_referencia for i in campanha.itens.all())
    bruto = f"{campanha.tipo}|{campanha.cod_fabricante}|{campanha.data_inicio}|{campanha.data_fim}|{itens}"
    chave = "campanha_realizado:" + hashlib.md5(bruto.encode()).hexdigest()

    try:
        em_cache = cache.get(chave)
    except Exception:
        em_cache = None
    if em_cache is not None:
        return em_cache

    rows = buscar_realizado_campanha(
        tipo=campanha.tipo,
        cod_fabricante=campanha.cod_fabricante,
        referencias=itens,
        data_inicio=campanha.data_inicio,
        data_fim=campanha.data_fim,
    )
    mapa = _mapa_realizado(rows)
    try:
        cache.set(chave, mapa, _CACHE_TTL_PAINEL)
    except Exception:
        pass  # cache fora do ar não pode derrubar o painel
    return mapa


# ─── CRUD ────────────────────────────────────────────────────────────

class CampanhaVendaViewSet(viewsets.ModelViewSet):
    """
    CRUD de campanhas (o escopo "itens" é enviado/atualizado junto).
      POST  /api/campanhas/       cria (nome, tipo, cod_fabricante, datas, itens[])
      PATCH /api/campanhas/<id>/  atualiza (se enviar "itens", substitui o escopo)
    """
    permission_classes = [EscritaAdminGerenteSupervisor]
    queryset = CampanhaVenda.objects.all().prefetch_related('itens', 'objetivos')
    serializer_class = CampanhaVendaSerializer

    def perform_create(self, serializer):
        serializer.save(criado_por=self.request.user)

    def get_queryset(self):
        qs = super().get_queryset()
        ativa = self.request.query_params.get('ativa')
        if ativa is not None:
            qs = qs.filter(ativa=(ativa.lower() == 'true'))
        return qs


class CampanhaVendaObjetivoViewSet(viewsets.ModelViewSet):
    """
    Objetivos por vendedor.
      GET    /api/campanhas-objetivos/?campanha=<id>
      POST   /api/campanhas-objetivos/   -> UPSERT por (campanha, cod_vendedor)
      DELETE /api/campanhas-objetivos/<id>/
    """
    permission_classes = [EscritaAdminGerenteSupervisor]
    queryset = CampanhaVendaObjetivo.objects.all()
    serializer_class = CampanhaVendaObjetivoSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        campanha_id = self.request.query_params.get('campanha')
        if campanha_id:
            qs = qs.filter(campanha_id=campanha_id)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data
        obj, created = CampanhaVendaObjetivo.objects.update_or_create(
            campanha=d['campanha'],
            cod_vendedor=d['cod_vendedor'],
            defaults={
                'nome_vendedor':       d.get('nome_vendedor') or '',
                'objetivo_peso':       d.get('objetivo_peso', 0),
                'objetivo_financeiro': d.get('objetivo_financeiro', 0),
                'objetivo_quantidade': d.get('objetivo_quantidade', 0),
            },
        )
        return Response(self.get_serializer(obj).data, status=201 if created else 200)


# ─── Tela de gestão: progresso de UMA campanha (sem cache) ───────────

class CampanhaVendaProgressoView(APIView):
    """
    GET /api/campanhas/<campanha_id>/progresso/

    {
      "campanha": {...},                       # já com itens e objetivos
      "medidas_ativas": ["peso", ...],         # medidas cujo objetivo da equipe > 0
      "detalhado_por_vendedor": [
          {"id", "cod_vendedor", "nome_vendedor",
           "peso": {"objetivo", "realizado", "percentual"}, "financeiro": {...}, "quantidade": {...}}
      ],
      "totais_equipe": {"peso": {...}, "financeiro": {...}, "quantidade": {...}}   # soma dos vendedores
    }
    percentual é null quando o objetivo é 0 (= sem objetivo naquela medida).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, campanha_id):
        try:
            campanha = CampanhaVenda.objects.prefetch_related('itens', 'objetivos').get(pk=campanha_id)
        except CampanhaVenda.DoesNotExist:
            return Response({"error": "Campanha não encontrada"}, status=404)

        try:
            objetivos = sorted(campanha.objetivos.all(), key=lambda x: (x.nome_vendedor or '').lower())
            referencias = [i.cod_referencia for i in campanha.itens.all()]

            realizado_map = {}
            if objetivos and referencias:
                realizado_map = _mapa_realizado(buscar_realizado_campanha(
                    tipo=campanha.tipo,
                    cod_fabricante=campanha.cod_fabricante,
                    referencias=referencias,
                    data_inicio=campanha.data_inicio,
                    data_fim=campanha.data_fim,
                    cod_vendedores=[o.cod_vendedor for o in objetivos],
                ))

            detalhado, totais_equipe, medidas_ativas = _consolidar(objetivos, realizado_map)
            return Response({
                'campanha': CampanhaVendaSerializer(campanha).data,
                'medidas_ativas': medidas_ativas,
                'detalhado_por_vendedor': detalhado,
                'totais_equipe': totais_equipe,
            })
        except Exception:
            logger.exception("[CampanhaVendaProgressoView] erro")
            return Response({"error": "Erro interno"}, status=500)


# ─── Dashboard: campanhas em andamento, escopadas por papel ──────────

class CampanhasPainelView(APIView):
    """
    GET /api/campanhas/painel/

    Campanhas vigentes hoje (ativa=True e data_inicio <= hoje <= data_fim), com os
    números restritos ao que o usuário pode ver — mesma regra das outras telas
    (rotas_info["vendedores"]: None = sem filtro; lista = só esses vendedores):
      - admin / sem filtro  -> escopo EQUIPE      (todos os vendedores)
      - supervisor/gerente  -> escopo SUPERVISAO  (vendedores da sua área)
      - vendedor            -> escopo VENDEDOR    (somente ele mesmo)
      - outros papéis       -> lista vazia
    Campanhas em que ninguém do escopo tem objetivo ficam de fora (exceto para
    quem não tem filtro, que vê um aviso de "sem objetivos").
    O realizado vem do ERP com cache de ~2 min (ver _realizado_cacheado).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        hoje = date.today()

        # Se não der para saber o escopo, NÃO mostra nada (nunca cai em "tudo")
        try:
            ctx = get_role_context(request.user)
            rotas_info = buscar_rotas_usuario(ctx) or {}
        except Exception:
            logger.exception("[CampanhasPainelView] falha ao resolver o escopo do usuário")
            return Response({"error": "Erro ao identificar o escopo do usuário"}, status=500)

        eh_gerente = bool(rotas_info.get('e_gerente'))
        if not (ctx.is_admin or ctx.is_supervisor or ctx.is_vendedor or eh_gerente):
            return Response({'hoje': hoje.isoformat(), 'escopo': None, 'campanhas': []})

        vend = rotas_info.get('vendedores')
        if ctx.is_admin or vend is None:
            escopo_set = None
        else:
            escopo_set = {int(v) for v in vend if v is not None}

        if escopo_set is None:
            rotulo = 'EQUIPE'
        elif ctx.is_vendedor and not (ctx.is_supervisor or eh_gerente):
            rotulo = 'VENDEDOR'
        else:
            rotulo = 'SUPERVISAO'

        campanhas = (
            CampanhaVenda.objects
            .filter(ativa=True, data_inicio__lte=hoje, data_fim__gte=hoje)
            .prefetch_related('itens', 'objetivos')
            .order_by('data_fim', 'nome')
        )

        saida = []
        for c in campanhas:
            objetivos = [o for o in c.objetivos.all() if escopo_set is None or o.cod_vendedor in escopo_set]
            if not objetivos and escopo_set is not None:
                continue  # ninguém do escopo participa

            dias_total = (c.data_fim - c.data_inicio).days + 1
            item = {
                'id': c.id,
                'nome': c.nome,
                'nome_fabricante': c.nome_fabricante,
                'tipo': c.tipo,
                'tipo_display': c.get_tipo_display(),
                'data_inicio': c.data_inicio.isoformat(),
                'data_fim': c.data_fim.isoformat(),
                'dias_total': dias_total,
                'dias_decorridos': min(max((hoje - c.data_inicio).days + 1, 1), dias_total),
                'dias_restantes': max((c.data_fim - hoje).days, 0),
                'itens': [{'cod_referencia': i.cod_referencia, 'nome_referencia': i.nome_referencia}
                          for i in c.itens.all()],
                'medidas_ativas': [],
                'totais': None,
                'vendedores': [],
                'sem_objetivos': not objetivos,
                'erro': False,
            }

            if objetivos:
                try:
                    realizado_map = _realizado_cacheado(c)
                except Exception:
                    # uma campanha com problema no ERP não pode derrubar as outras
                    logger.exception("[CampanhasPainelView] erro ao buscar realizado da campanha %s", c.id)
                    item['erro'] = True
                    saida.append(item)
                    continue

                linhas, totais, ativas = _consolidar(objetivos, realizado_map)
                if ativas:  # ranking pelo % da primeira medida com objetivo
                    m0 = ativas[0]
                    linhas.sort(key=lambda l: (
                        -(l[m0]['percentual'] if l[m0]['percentual'] is not None else -1),
                        (l['nome_vendedor'] or '').lower(),
                    ))
                else:
                    linhas.sort(key=lambda l: (l['nome_vendedor'] or '').lower())
                item.update({'medidas_ativas': ativas, 'totais': totais, 'vendedores': linhas})

            saida.append(item)

        return Response({'hoje': hoje.isoformat(), 'escopo': rotulo, 'campanhas': saida})


# ─── Buscas dos seletores ────────────────────────────────────────────

def _to_int_or_none(valor):
    try:
        return int(valor)
    except (TypeError, ValueError):
        return None


class FabricanteSearchView(APIView):
    """GET /api/campanhas/buscar-fabricante/?q=termo"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        termo = request.query_params.get('q', '').strip()
        if len(termo) < 2:
            return Response({"resultados": []})
        return Response({"resultados": buscar_fabricantes(termo)})


class MaterialSearchView(APIView):
    """GET /api/campanhas/buscar-material/?q=termo&cod_fabricante=123"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        termo = request.query_params.get('q', '').strip()
        if len(termo) < 2:
            return Response({"resultados": []})
        cod_fab = _to_int_or_none(request.query_params.get('cod_fabricante'))
        return Response({"resultados": buscar_materiais(termo, cod_fabricante=cod_fab)})


class GrupoSearchView(APIView):
    """GET /api/campanhas/buscar-grupo/?cod_fabricante=123&q=termo  (q opcional)"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cod_fab = _to_int_or_none(request.query_params.get('cod_fabricante'))
        if not cod_fab:
            return Response({"error": "Parâmetro obrigatório: cod_fabricante"}, status=400)
        termo = request.query_params.get('q', '').strip()
        return Response({"resultados": buscar_grupos(cod_fab, termo)})