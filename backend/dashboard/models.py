from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone


User = get_user_model()



# Create your models here.

class ObjetivoMensal(models.Model):
    mes_referencia = models.DateField(help_text="Use o primeiro dia do mês para identificar (ex: 2024-06-01)")
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)

    objetivo_financeiro = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    objetivo_mix        = models.PositiveIntegerField(null=True, blank=True)

    # 🆕 novos campos
    objetivo_peso          = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)   # kg
    objetivo_positivacao   = models.PositiveIntegerField(null=True, blank=True)                             # clientes

    class Meta:
        db_table = "objetivo_mensal"
        app_label = 'dashboard'
        managed = True
        unique_together = ('mes_referencia', 'usuario')
        verbose_name = 'Objetivo Mensal'
        verbose_name_plural = 'Objetivos Mensais'

    def __str__(self):
        return (f"{self.usuario.username} - {self.mes_referencia.strftime('%Y-%m')} "
                f"(R$ {self.objetivo_financeiro}, MIX {self.objetivo_mix}, "
                f"PESO {self.objetivo_peso}, POS {self.objetivo_positivacao})")


class ObjetivoMensalVendedor(models.Model):
    mes_referencia = models.DateField()
    vendedor_id = models.CharField(max_length=255)
    nome_vendedor = models.CharField(max_length=255)

    objetivo_financeiro = models.DecimalField(max_digits=12, decimal_places=2)
    objetivo_mix        = models.DecimalField(max_digits=12, decimal_places=2)

    # 🆕 novos campos
    objetivo_peso        = models.DecimalField(max_digits=12, decimal_places=2, default=0)     # kg
    objetivo_positivacao = models.PositiveIntegerField(default=0)                              # clientes

    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['mes_referencia', 'vendedor_id']
        verbose_name = 'Objetivo Financeiro por Vendedor'
        verbose_name_plural = 'Objetivos Financeiros por Vendedor'

    def __str__(self):
        return f"{self.nome_vendedor} - {self.mes_referencia}"
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField('Telefone', max_length=20, blank=True, null=True)
    cod_funcionario = models.IntegerField('Código do Funcionário', unique=True, null=True)
    cod_unid_gestora = models.IntegerField('Unidade Gestora', null=True)
    entregador = models.BooleanField(default=False)
    supervisor = models.BooleanField(default=False)
    transportador = models.BooleanField(default=False)
    transportador_aux = models.BooleanField(default=False)
    vendedor = models.BooleanField(default=False)
    cobrador = models.BooleanField(default=False)

    def __str__(self):
        return f'Perfil de {self.user.username} (Func: {self.cod_funcionario})'

# Signal para criar profile automaticamente quando um usuário é criado
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

# No final de models.py

class ObjetivoMixNivel(models.Model):
    """
    Tabela polimórfica para armazenar metas de Mix (não-aditivas) por hierarquia.
    Ex: A meta da empresa NÃO é a soma das metas dos vendedores.
    """
    NIVEL_CHOICES = [
        ('EMPRESA', 'Empresa (Geral)'),
        ('SUPERVISOR', 'Supervisor'),
        ('UNID_GESTORA', 'Unidade Gestora'),
    ]

    # Data de referência (sempre dia 01 do mês)
    mes_referencia = models.DateField(db_index=True)
    
    # Define o escopo da meta
    nivel = models.CharField(max_length=20, choices=NIVEL_CHOICES, db_index=True)
    
    # O código ID do alvo:
    # - Se nivel='EMPRESA' -> 0 (ou 1)
    # - Se nivel='SUPERVISOR' -> CodSupervisor (do ERP)
    # - Se nivel='UNID_GESTORA' -> UnidGestora (do ERP)
    codigo_alvo = models.IntegerField(default=0, db_index=True)
    
    # O valor da meta de Mix (Quantidade de SKUs distintos)
    objetivo_mix = models.PositiveIntegerField()

    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        # Garante performance e unicidade (ex: Supervisor 241 só pode ter 1 meta em Jan/2026)
        unique_together = ['mes_referencia', 'nivel', 'codigo_alvo']
        verbose_name = 'Objetivo de Mix por Nível'
        verbose_name_plural = 'Objetivos de Mix por Nível'
        db_table = "objetivo_mix_nivel"

    def __str__(self):
        return f"{self.mes_referencia} | {self.nivel} {self.codigo_alvo} | Mix: {self.objetivo_mix}"

    
class Feriado(models.Model):
    data = models.DateField(unique=True, help_text="Data do feriado")
    descricao = models.CharField(max_length=100, help_text="Nome do feriado (ex: Natal)")

    class Meta:
        db_table = "feriados"
        ordering = ['data']
        verbose_name = "Feriado"
        verbose_name_plural = "Feriados"

    def __str__(self):
        return f"{self.data.strftime('%d/%m/%Y')} - {self.descricao}"


class TelegramLinkCode(models.Model):
    """
    Código temporário de 6 dígitos gerado pelo vendedor no dashboard
    para vincular sua conta ao bot do Telegram.
    """
    cod_funcionario = models.IntegerField()
    codigo = models.CharField(max_length=6, unique=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    expira_em = models.DateTimeField()
    usado = models.BooleanField(default=False)

    class Meta:
        db_table = "telegram_link_code"

    def __str__(self):
        return f"{self.codigo} -> vendedor {self.cod_funcionario}"

    def expirado(self) -> bool:
        return timezone.now() > self.expira_em


class VendedorTelegram(models.Model):
    """
    Vínculo definitivo entre um vendedor (CodFuncionario do ERP) e o
    chat_id dele no Telegram, usado para enviar as notificações.
    """
    cod_funcionario = models.IntegerField(unique=True)
    chat_id = models.BigIntegerField()
    telegram_username = models.CharField(max_length=100, null=True, blank=True)
    ativo = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "vendedor_telegram"

    def __str__(self):
        return f"Vendedor {self.cod_funcionario} -> chat {self.chat_id}"


class RupturaNotificada(models.Model):
    """
    Tabela de controle: marca quais itens de ruptura (identificados pela
    chave natural CodPocket + CodDoc + Sequencia) já foram detectados e/ou
    notificados, evitando reenvio duplicado.

    O envio é rastreado separadamente para o VENDEDOR do cliente e para o
    SUPERVISOR desse vendedor, já que um pode estar vinculado ao Telegram
    e o outro não (ou vice-versa) — cada um tem seu próprio ciclo de retry.
    Os GERENTES (que recebem TODAS as rupturas, de qualquer vendedor) são
    rastreados à parte, na tabela RupturaNotificacaoGerente, pois pode
    haver mais de um gerente ao mesmo tempo.
    """
    cod_pocket = models.IntegerField()
    cod_doc = models.IntegerField()
    sequencia = models.IntegerField()

    cod_vendedor = models.IntegerField(null=True, blank=True)
    cod_supervisor = models.IntegerField(null=True, blank=True)

    enviado_vendedor = models.BooleanField(default=False)
    enviado_supervisor = models.BooleanField(default=False)

    tentativas_vendedor = models.IntegerField(default=0)
    tentativas_supervisor = models.IntegerField(default=0)

    criado_em = models.DateTimeField(auto_now_add=True)
    ultima_tentativa = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "ruptura_notificada"
        unique_together = ("cod_pocket", "cod_doc", "sequencia")

    def __str__(self):
        v = "enviado" if self.enviado_vendedor else f"pendente ({self.tentativas_vendedor}x)"
        s = "enviado" if self.enviado_supervisor else f"pendente ({self.tentativas_supervisor}x)"
        return f"Ruptura {self.cod_pocket}/{self.cod_doc}/{self.sequencia} — vend:{v} sup:{s}"


class RupturaNotificacaoGerente(models.Model):
    """
    Rastreia, para cada item de ruptura, o envio individual a CADA gerente
    ativo no sistema (pode haver mais de um gerente, diferente de vendedor/
    supervisor que são únicos por item). Cada gerente tem seu próprio
    ciclo de retry independente.
    """
    ruptura = models.ForeignKey(
        RupturaNotificada, on_delete=models.CASCADE, related_name="notificacoes_gerente"
    )
    cod_gerente = models.IntegerField()
    enviado = models.BooleanField(default=False)
    tentativas = models.IntegerField(default=0)
    ultima_tentativa = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "ruptura_notificacao_gerente"
        unique_together = ("ruptura", "cod_gerente")

    def __str__(self):
        status = "enviado" if self.enviado else f"pendente ({self.tentativas}x)"
        return f"Ruptura {self.ruptura_id} -> Gerente {self.cod_gerente} — {status}"


class TelegramPollState(models.Model):
    """
    Linha única (singleton) que guarda o último update_id processado do
    getUpdates do bot, para não reprocessar as mesmas mensagens a cada execução.
    """
    last_update_id = models.BigIntegerField(default=0)

    class Meta:
        db_table = "telegram_poll_state"



class CampanhaVenda(models.Model):
    """
    Campanha de vendas de UM fabricante, restrita a:
      - tipo MATERIAL: um ou mais materiais do fabricante
      - tipo GRUPO:    um ou mais grupos de material do fabricante
    O escopo (materiais/grupos) fica em CampanhaVendaItem.
    Os objetivos ficam em CampanhaVendaObjetivo (um registro por vendedor).
    Pode haver várias campanhas ativas ao mesmo tempo.
    """
    TIPO_CHOICES = [
        ('MATERIAL', 'Fabricante x Material(is)'),
        ('GRUPO',    'Fabricante x Grupo(s) de material'),
    ]

    nome            = models.CharField(max_length=150)
    tipo            = models.CharField(max_length=20, choices=TIPO_CHOICES)
    # null=True só para não exigir default na migration; a API exige o campo.
    cod_fabricante  = models.IntegerField(null=True, blank=True)
    nome_fabricante = models.CharField(max_length=150, blank=True, default='')
    data_inicio     = models.DateField()
    data_fim        = models.DateField()
    ativa           = models.BooleanField(default=True)
    descricao       = models.TextField(blank=True, null=True)
    criado_por      = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='campanhas_criadas'
    )
    criado_em       = models.DateTimeField(auto_now_add=True)
    atualizado_em   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "campanha_venda"
        verbose_name = "Campanha de Venda"
        verbose_name_plural = "Campanhas de Venda"
        ordering = ['-data_inicio']

    def __str__(self):
        return f"{self.nome} ({self.get_tipo_display()}) — {self.data_inicio} a {self.data_fim}"


class CampanhaVendaItem(models.Model):
    """
    Escopo da campanha: cada registro é um material (tipo MATERIAL)
    ou um grupo de material (tipo GRUPO) que entra na campanha.
    """
    campanha        = models.ForeignKey(
        CampanhaVenda, on_delete=models.CASCADE, related_name='itens'
    )
    cod_referencia  = models.IntegerField(help_text="CodMaterial ou CodGrupo, conforme campanha.tipo")
    nome_referencia = models.CharField(max_length=150, blank=True, default='')

    class Meta:
        db_table = "campanha_venda_item"
        unique_together = ('campanha', 'cod_referencia')
        verbose_name = "Item da Campanha"
        verbose_name_plural = "Itens da Campanha"

    def __str__(self):
        return f"{self.campanha_id} | {self.cod_referencia} {self.nome_referencia}"


class CampanhaVendaObjetivo(models.Model):
    """
    Objetivo de UM vendedor na campanha (somando todos os itens do escopo).
    Cada medida pode ser 0 => "sem objetivo" naquela medida.

    O objetivo da EQUIPE não é gravado: é sempre a soma dos vendedores.
    """
    campanha            = models.ForeignKey(
        CampanhaVenda, on_delete=models.CASCADE, related_name='objetivos'
    )
    cod_vendedor        = models.IntegerField()
    nome_vendedor       = models.CharField(max_length=150, blank=True, null=True)
    objetivo_peso       = models.DecimalField(max_digits=15, decimal_places=2, default=0)  # kg
    objetivo_financeiro = models.DecimalField(max_digits=15, decimal_places=2, default=0)  # R$
    objetivo_quantidade = models.DecimalField(max_digits=15, decimal_places=2, default=0)  # unidades

    class Meta:
        db_table = "campanha_venda_objetivo"
        unique_together = ('campanha', 'cod_vendedor')
        verbose_name = "Objetivo de Campanha por Vendedor"
        verbose_name_plural = "Objetivos de Campanha por Vendedor"

    def __str__(self):
        return (f"{self.campanha_id} | Vend {self.cod_vendedor}: "
                f"{self.objetivo_peso}kg / R${self.objetivo_financeiro} / {self.objetivo_quantidade}un")