# backend/dashboard/views/campanhas_views.py   (ARQUIVO NOVO)
# Views das campanhas de venda. Não precisa mexer no main_views.py:
# o urls.py importa direto deste módulo.
# Se ainda existirem no main_views.py as classes antigas de campanha
# (CampanhaVendaViewSet, CampanhaVendaObjetivoViewSet, CampanhaVendaProgressoView,
#  MaterialSearchView, FabricanteSearchView), pode apagá-las de lá.

import logging
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from dashboard.models import CampanhaVenda, CampanhaVendaObjetivo
from dashboard.serializers import CampanhaVendaSerializer, CampanhaVendaObjetivoSerializer
from dashboard.services.indicadores.campanhas_service import (
    buscar_realizado_campanha,
    buscar_fabricantes,
    buscar_materiais,
    buscar_grupos,
)

logger = logging.getLogger(__name__)


class CampanhaVendaViewSet(viewsets.ModelViewSet):
    """
    CRUD de campanhas (o escopo "itens" é enviado/atualizado junto).
      POST  /api/campanhas/       cria (nome, tipo, cod_fabricante, datas, itens[])
      PATCH /api/campanhas/<id>/  atualiza (se enviar "itens", substitui o escopo)
    """
    permission_classes = [IsAuthenticated]
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
    permission_classes = [IsAuthenticated]
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


_MEDIDAS = ('peso', 'financeiro', 'quantidade')
_CHAVE_REALIZADO = {'peso': 'Peso', 'financeiro': 'Financeiro', 'quantidade': 'Quantidade'}


def _pct(realizado, objetivo):
    return round(realizado / objetivo * 100, 1) if objetivo else None


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
            objetivos = list(campanha.objetivos.all())
            referencias = [i.cod_referencia for i in campanha.itens.all()]

            realizado_map = {}
            if objetivos and referencias:
                rows = buscar_realizado_campanha(
                    tipo=campanha.tipo,
                    cod_fabricante=campanha.cod_fabricante,
                    referencias=referencias,
                    data_inicio=campanha.data_inicio,
                    data_fim=campanha.data_fim,
                    cod_vendedores=[o.cod_vendedor for o in objetivos],
                )
                for r in rows:
                    if r.get('CodVendedor') is None:
                        continue
                    realizado_map[int(r['CodVendedor'])] = {
                        m: float(r.get(_CHAVE_REALIZADO[m]) or 0) for m in _MEDIDAS
                    }

            totais = {m: {'objetivo': 0.0, 'realizado': 0.0} for m in _MEDIDAS}
            detalhado = []

            for o in sorted(objetivos, key=lambda x: (x.nome_vendedor or '').lower()):
                real = realizado_map.get(o.cod_vendedor, {})
                linha = {
                    'id': o.id,
                    'cod_vendedor': o.cod_vendedor,
                    'nome_vendedor': o.nome_vendedor,
                }
                for m in _MEDIDAS:
                    obj = float(getattr(o, f'objetivo_{m}') or 0)
                    rea = float(real.get(m, 0.0))
                    linha[m] = {'objetivo': round(obj, 2), 'realizado': round(rea, 2), 'percentual': _pct(rea, obj)}
                    totais[m]['objetivo'] += obj
                    totais[m]['realizado'] += rea
                detalhado.append(linha)

            totais_equipe = {
                m: {
                    'objetivo': round(t['objetivo'], 2),
                    'realizado': round(t['realizado'], 2),
                    'percentual': _pct(t['realizado'], t['objetivo']),
                }
                for m, t in totais.items()
            }

            return Response({
                'campanha': CampanhaVendaSerializer(campanha).data,
                'medidas_ativas': [m for m in _MEDIDAS if totais[m]['objetivo'] > 0],
                'detalhado_por_vendedor': detalhado,
                'totais_equipe': totais_equipe,
            })
        except Exception:
            logger.exception("[CampanhaVendaProgressoView] erro")
            return Response({"error": "Erro interno"}, status=500)


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