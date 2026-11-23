"""Central de alertas do app mobile.

Usa o banco de testes do Django (SQLite), mas não toca o SQL Server:
    python manage.py test dashboard
"""
from django.contrib.auth.models import User
from django.test import SimpleTestCase, TestCase
from rest_framework.test import APIClient

from dashboard.management.commands.notificar_ruptura import CODIGO_RE
from dashboard.models import AlertaApp, RupturaNotificada
from dashboard.services.alertas_service import criar_alertas_ruptura

ITEM = {
    "Cliente": "Mercadinho Boa Vista",
    "Material": "Farinha de trigo 1kg",
    "Valor": 152.4,
    "DataDoc": "2026-11-20",
    "Funcionario": "JOAO",
    "CodVendedor": 10,
    "CodPocket": 1,
    "CodDoc": 2,
}


def _ruptura(seq, vendedor=10, supervisor=20):
    return RupturaNotificada.objects.create(
        cod_pocket=1, cod_doc=2, sequencia=seq,
        cod_vendedor=vendedor, cod_supervisor=supervisor,
    )


def _cliente(cod_funcionario):
    user = User.objects.create_user(username=f"u{cod_funcionario}", password="x")
    user.profile.cod_funcionario = cod_funcionario
    user.profile.save()
    c = APIClient()
    c.force_authenticate(user)
    return c


class CriarAlertasRuptura(TestCase):
    def test_grava_para_vendedor_e_supervisor(self):
        criar_alertas_ruptura(_ruptura(1), ITEM)
        papeis = dict(AlertaApp.objects.values_list("cod_funcionario", "papel"))
        self.assertEqual(papeis, {10: "vendedor", 20: "supervisor"})
        a = AlertaApp.objects.get(cod_funcionario=10)
        self.assertEqual(a.dados["cliente"], "Mercadinho Boa Vista")
        self.assertIn("R$ 152,40", a.mensagem)

    def test_rodar_de_novo_nao_duplica(self):
        r = _ruptura(1)
        criar_alertas_ruptura(r, ITEM)
        criar_alertas_ruptura(r, ITEM)
        self.assertEqual(AlertaApp.objects.count(), 2)

    def test_vendedor_que_e_o_proprio_supervisor_recebe_um_so(self):
        criar_alertas_ruptura(_ruptura(1, vendedor=10, supervisor=10), ITEM)
        self.assertEqual(list(AlertaApp.objects.values_list("papel", flat=True)), ["vendedor"])

    def test_gerentes_recebem_quando_informados(self):
        criar_alertas_ruptura(_ruptura(1), ITEM, gerentes_ids=[30, 20])
        papeis = dict(AlertaApp.objects.values_list("cod_funcionario", "papel"))
        # 20 já é o supervisor: não vira "gerente" nem duplica
        self.assertEqual(papeis, {10: "vendedor", 20: "supervisor", 30: "gerente"})


class RotasDeAlertas(TestCase):
    def setUp(self):
        criar_alertas_ruptura(_ruptura(1), ITEM)
        criar_alertas_ruptura(_ruptura(2), ITEM)
        self.vendedor = _cliente(10)

    def test_lista_so_os_alertas_do_usuario(self):
        r = self.vendedor.get("/api/alertas/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.data["results"]), 2)
        self.assertTrue(all(a["papel"] == "vendedor" for a in r.data["results"]))
        self.assertEqual(r.data["nao_lidos"], 2)

    def test_apos_id_traz_so_os_novos(self):
        ids = sorted(AlertaApp.objects.filter(cod_funcionario=10).values_list("id", flat=True))
        r = self.vendedor.get("/api/alertas/", {"apos_id": ids[0]})
        self.assertEqual([a["id"] for a in r.data["results"]], [ids[1]])

    def test_marcar_lidos_por_id_e_todos(self):
        meus = list(AlertaApp.objects.filter(cod_funcionario=10).values_list("id", flat=True))
        do_supervisor = AlertaApp.objects.filter(cod_funcionario=20).first()

        r = self.vendedor.post("/api/alertas/marcar-lidos/", {"ids": [meus[0], do_supervisor.id]}, format="json")
        self.assertEqual(r.data["atualizados"], 1)  # o do supervisor não é dele
        self.assertEqual(r.data["nao_lidos"], 1)

        r = self.vendedor.post("/api/alertas/marcar-lidos/", {"todos": True}, format="json")
        self.assertEqual(r.data["nao_lidos"], 0)
        do_supervisor.refresh_from_db()
        self.assertIsNone(do_supervisor.lido_em)

    def test_marcar_lidos_sem_parametro_da_400(self):
        r = self.vendedor.post("/api/alertas/marcar-lidos/", {}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_anonimo_recebe_401(self):
        self.assertEqual(APIClient().get("/api/alertas/").status_code, 401)


class VinculoTelegramPeloApp(SimpleTestCase):
    def test_aceita_vincular_e_start(self):
        self.assertEqual(CODIGO_RE.search("/vincular 123456").group(1), "123456")
        # o app abre t.me/<bot>?start=123456; o Telegram envia "/start 123456"
        self.assertEqual(CODIGO_RE.search("/start 654321").group(1), "654321")
        self.assertIsNone(CODIGO_RE.search("/start"))
