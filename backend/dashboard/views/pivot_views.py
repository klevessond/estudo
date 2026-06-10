# views.py
from dashboard.services.indicadores.pivot_service import buscar_dump_vendas

def api_pivot_vendas(request):
    de = request.GET.get('de')
    ate = request.GET.get('ate')
    dados = buscar_dump_vendas(de, ate)
    return JsonResponse({'resultado': dados}, safe=False)