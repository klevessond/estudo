from datetime import date, timedelta
try:
    from dashboard.models import Feriado
except ImportError:
    Feriado = None

def get_dias_uteis_info(data_base=None):
    """
    Retorna totais, decorridos e restantes de dias úteis.
    data_base: Usada apenas para identificar o MÊS/ANO de referência.
    """
    # Define o mês/ano com base no filtro
    ref_date = data_base if data_base else date.today()
    
    # Define o "Hoje" verdadeiro (data do servidor)
    hoje_real = date.today()

    ano, mes = ref_date.year, ref_date.month
    
    primeiro_dia = date(ano, mes, 1)
    
    # Pega ultimo dia do mês
    if mes == 12:
        proximo_mes = date(ano + 1, 1, 1)
    else:
        proximo_mes = date(ano, mes + 1, 1)
    ultimo_dia = proximo_mes - timedelta(days=1)

    # Busca feriados
    feriados = set()
    if Feriado:
        try:
            qs = Feriado.objects.filter(data__range=[primeiro_dia, ultimo_dia]).values_list('data', flat=True)
            feriados = set(qs)
        except Exception:
            pass 

    totais = 0
    decorridos = 0
    
    cursor = primeiro_dia
    while cursor <= ultimo_dia:
        # Se é dia útil (seg-sex) e não é feriado
        if cursor.weekday() < 5 and cursor not in feriados:
            totais += 1
            
            # Para contar como decorrido, o dia deve ser anterior ou igual a HOJE (Real)
            # E obviamente estar dentro do mês analisado (garantido pelo while)
            if cursor <= hoje_real:
                decorridos += 1
                
        cursor += timedelta(days=1)
        
    # Proteção: Se estivermos olhando um mês futuro, decorridos será 0.
    # Ajustamos para 1 para evitar divisão por zero na matemática.
    decorridos_ajustado = max(decorridos, 1)
    
    # Restantes = Total do mês - Dias que já passaram (respeitando o limite do total)
    restantes = max(0, totais - decorridos)

    return {
        "totais": totais,
        "decorridos": decorridos_ajustado,
        "restantes": restantes
    }

def calcular_matematica_projecao(realizado, meta, dias_info):
    realizado = float(realizado or 0)
    meta = float(meta or 0)
    
    decorridos = dias_info['decorridos']
    totais = dias_info['totais']
    restantes = dias_info['restantes']

    # Velocidade baseada no que já passou de verdade
    velocidade = realizado / decorridos if decorridos > 0 else 0
    
    # Projeção = (Média Diária * Dias Totais)
    projecao = velocidade * totais
    
    percentual = (projecao / meta * 100) if meta > 0 else 0
    
    falta = max(0, meta - realizado)
    
    if restantes > 0:
        meta_diaria = falta / restantes
    else:
        meta_diaria = falta 

    return {
        "velocidade_diaria": round(velocidade, 2),
        "projecao_final": round(projecao, 2),
        "atingimento_projetado": round(percentual, 2),
        "falta_para_meta": round(falta, 2),
        "meta_diaria_necessaria": round(meta_diaria, 2)
    }