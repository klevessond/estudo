"""Testes de permissão: nenhuma rota da API pode nascer aberta por acidente.

Não usam banco de dados (SimpleTestCase) e não tocam o SQL Server: rodam em
segundos com  `python manage.py test dashboard`.
"""
from django.test import SimpleTestCase
from django.urls import get_resolver
from rest_framework.permissions import AllowAny

# Rotas que PRECISAM ser públicas (login e renovação do token).
PUBLICAS = {"TokenObtainPairView", "TokenRefreshView"}


def _rotas():
    """Gera (padrão, callback) de todas as rotas do projeto, exceto o admin do Django."""
    def percorrer(patterns, prefixo=""):
        for p in patterns:
            caminho = prefixo + str(p.pattern)
            if hasattr(p, "url_patterns"):
                yield from percorrer(p.url_patterns, caminho)
            else:
                yield caminho, p.callback
    for caminho, cb in percorrer(get_resolver().url_patterns):
        if caminho.startswith("admin/"):  # tem login próprio do Django
            continue
        yield caminho, cb


class TodasAsRotasExigemLogin(SimpleTestCase):
    def test_nenhuma_rota_fica_aberta(self):
        abertas = []
        for caminho, cb in _rotas():
            cls = getattr(cb, "view_class", None) or getattr(cb, "cls", None)
            if cls is None:
                # view Django comum (fora do DRF): a permissão global não a alcança
                abertas.append(f"{caminho} -> {cb.__name__} (view fora do DRF)")
                continue
            if cls.__name__ in PUBLICAS:
                continue
            perms = list(getattr(cls, "permission_classes", []))
            if not perms or any(issubclass(c, AllowAny) for c in perms):
                abertas.append(f"{caminho} -> {cls.__name__}")
        self.assertEqual(
            abertas, [],
            "Rotas sem exigência de login (use IsAuthenticated ou, se for "
            "proposital, inclua em PUBLICAS neste teste):\n  " + "\n  ".join(abertas),
        )

    def test_chamada_anonima_recebe_401(self):
        """Prova de ponta a ponta em rotas representativas (sem tocar em banco)."""
        for url in [
            "/api/Indicadores/?de=2026-11-01&ate=2026-11-30",
            "/api/usuario/1/",
            "/api/funcionarios/1/",
            "/api/vendas-por-vendedor/?de=2026-11-01&ate=2026-11-30",
            "/api/objetivos-mensais/",
        ]:
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 401)

    def test_rotas_legadas_foram_removidas(self):
        for url in ["/api/dados-sql/", "/api/api/clientes/"]:
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 404)

    def test_login_continua_publico(self):
        # sem credenciais não autentica, mas a rota precisa existir e responder
        # algo que não seja 401/404 (o simplejwt devolve 400 para corpo vazio).
        r = self.client.post("/api/token/", {}, content_type="application/json")
        self.assertEqual(r.status_code, 400)
