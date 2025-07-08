_cache_temporario = {}

def get_cached_data(chave, funcao_busca):
    """
    Retorna o valor em cache ou executa a função e salva o resultado.
    """
    if chave not in _cache_temporario:
        _cache_temporario[chave] = funcao_busca()
    return _cache_temporario[chave]
