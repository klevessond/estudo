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


# ===========================================================================
# Permissões por perfil (admin / gerente / supervisor / vendedor)
# ===========================================================================
from types import SimpleNamespace
from unittest.mock import patch

from rest_framework.test import APIClient

from dashboard.permissions import (
    EscritaAdminGerenteSupervisor,
    IsAdminGerenteOrSupervisor,
    IsAdminOrGerente,
)


def _usuario(*, admin=False, supervisor=False, vendedor=False):
    """Usuário simulado: não precisa de banco de dados."""
    perfil = SimpleNamespace(
        supervisor=supervisor, vendedor=vendedor, transportador=False,
        transportador_aux=False, entregador=False, cobrador=False,
        cod_funcionario=1, cod_unid_gestora=1,
    )
    return SimpleNamespace(
        id=1, pk=1, is_authenticated=True, is_superuser=admin, profile=perfil,
    )


# nome -> (usuário, é gerente no ERP?)
PERFIS = {
    "admin":      (_usuario(admin=True), False),
    "gerente":    (_usuario(supervisor=True), True),
    "gerente_sem_flag_supervisor": (_usuario(vendedor=True), True),  # só o ERP diz que é gerente
    "supervisor": (_usuario(supervisor=True), False),
    "vendedor":   (_usuario(vendedor=True), False),
}


def _req(user, metodo="GET"):
    return SimpleNamespace(user=user, method=metodo)


def _permite(classe, perfil, metodo="GET"):
    user, e_gerente = PERFIS[perfil]
    with patch("dashboard.permissions.buscar_rotas_usuario",
               return_value={"e_gerente": e_gerente}):
        return classe().has_permission(_req(user, metodo), None)


class MatrizDePermissoes(SimpleTestCase):
    def test_admin_e_gerente(self):  # cadastro de usuários
        esperado = {"admin": True, "gerente": True, "gerente_sem_flag_supervisor": True,
                    "supervisor": False, "vendedor": False}
        for perfil, ok in esperado.items():
            with self.subTest(perfil=perfil):
                self.assertEqual(_permite(IsAdminOrGerente, perfil), ok)

    def test_admin_gerente_e_supervisor(self):  # feriados
        esperado = {"admin": True, "gerente": True, "gerente_sem_flag_supervisor": True,
                    "supervisor": True, "vendedor": False}
        for perfil, ok in esperado.items():
            with self.subTest(perfil=perfil):
                self.assertEqual(_permite(IsAdminGerenteOrSupervisor, perfil), ok)

    def test_escrita_restrita_leitura_livre(self):  # objetivos e campanhas
        for perfil in PERFIS:
            with self.subTest(perfil=perfil, metodo="GET"):
                self.assertTrue(_permite(EscritaAdminGerenteSupervisor, perfil, "GET"))
        for metodo in ("POST", "PUT", "PATCH", "DELETE"):
            for perfil, ok in {"admin": True, "gerente": True, "supervisor": True,
                               "vendedor": False}.items():
                with self.subTest(perfil=perfil, metodo=metodo):
                    self.assertEqual(_permite(EscritaAdminGerenteSupervisor, perfil, metodo), ok)

    def test_anonimo_sempre_negado(self):
        anonimo = SimpleNamespace(is_authenticated=False, is_superuser=False)
        for classe in (IsAdminOrGerente, IsAdminGerenteOrSupervisor, EscritaAdminGerenteSupervisor):
            with self.subTest(classe=classe.__name__):
                self.assertFalse(classe().has_permission(_req(anonimo), None))

    def test_falha_do_erp_nega_o_gerente(self):
        """Se o SQL Server cair, quem só é gerente pelo ERP NÃO ganha acesso."""
        user = PERFIS["gerente_sem_flag_supervisor"][0]
        with patch("dashboard.permissions.buscar_rotas_usuario", side_effect=RuntimeError("erp fora")):
            with self.assertLogs("dashboard.permissions", level="WARNING"):
                self.assertFalse(IsAdminOrGerente().has_permission(_req(user), None))
                self.assertFalse(IsAdminGerenteOrSupervisor().has_permission(_req(user), None))

    def test_supervisor_nao_consulta_o_erp(self):
        user = PERFIS["supervisor"][0]
        with patch("dashboard.permissions.buscar_rotas_usuario") as erp:
            self.assertTrue(IsAdminGerenteOrSupervisor().has_permission(_req(user), None))
            erp.assert_not_called()


class RotasProtegidasPorPerfil(SimpleTestCase):
    """Ponta a ponta: vendedor e supervisor recebem 403 onde não podem gravar.
    (Só casos de NEGAÇÃO: a view nem chega a executar, então não toca em banco.)"""

    def _chamar(self, perfil, metodo, url):
        user, e_gerente = PERFIS[perfil]
        client = APIClient()
        client.force_authenticate(user=user)
        with patch("dashboard.permissions.buscar_rotas_usuario",
                   return_value={"e_gerente": e_gerente}):
            return getattr(client, metodo)(url, {}, format="json").status_code

    def test_vendedor_nao_grava_nada_gerencial(self):
        negados = [
            ("post", "/api/register/"),
            ("put", "/api/usuario/2/"),
            ("get", "/api/usuario/2/"),
            ("get", "/api/funcionarios/"),
            ("get", "/api/funcionarios/10/"),
            ("post", "/api/objetivos-vendedores/"),
            ("post", "/api/objetivos-mix-nivel/"),
            ("post", "/api/objetivos-mensais/"),
            ("post", "/api/campanhas/"),
            ("patch", "/api/campanhas/1/"),
            ("delete", "/api/campanhas-objetivos/1/"),
            ("get", "/api/feriados/"),
            ("post", "/api/feriados/"),
        ]
        for metodo, url in negados:
            with self.subTest(metodo=metodo, url=url):
                self.assertEqual(self._chamar("vendedor", metodo, url), 403)

    def test_supervisor_nao_gerencia_usuarios(self):
        for metodo, url in [("post", "/api/register/"), ("put", "/api/usuario/2/"),
                            ("get", "/api/funcionarios/")]:
            with self.subTest(metodo=metodo, url=url):
                self.assertEqual(self._chamar("supervisor", metodo, url), 403)


class FeriadosAceitaSupervisor(SimpleTestCase):
    """Regra definida pelo negócio: feriados = admin, gerente e supervisor."""

    def test_quem_pode_mexer_em_feriados(self):
        from dashboard.views.feriados_views import FeriadoView
        esperado = {"admin": True, "gerente": True, "gerente_sem_flag_supervisor": True,
                    "supervisor": True, "vendedor": False}
        for perfil, ok in esperado.items():
            user, e_gerente = PERFIS[perfil]
            with self.subTest(perfil=perfil), patch(
                "dashboard.permissions.buscar_rotas_usuario", return_value={"e_gerente": e_gerente}
            ):
                self.assertEqual(FeriadoView().tem_permissao(_req(user)), ok)
