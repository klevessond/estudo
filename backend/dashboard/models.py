from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

User = get_user_model()



# Create your models here.

class ObjetivoMensal(models.Model):
    mes_referencia = models.DateField(help_text="Use o primeiro dia do mês para identificar (ex: 2024-06-01)")
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    objetivo_financeiro = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    objetivo_mix = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        db_table = "objetivo_mensal"
        app_label = 'dashboard'
        managed = True  # importante
        unique_together = ('mes_referencia', 'usuario')
        verbose_name = 'Objetivo Mensal'
        verbose_name_plural = 'Objetivos Mensais'

    def __str__(self):
        return f"{self.usuario.username} - {self.mes_referencia.strftime('%Y-%m')} (R$ {self.objetivo_financeiro}, MIX {self.objetivo_mix})"

class ObjetivoMensalVendedor(models.Model):

    mes_referencia = models.DateField()
    vendedor_id = models.CharField(max_length=255)
    nome_vendedor = models.CharField(max_length=255)
    objetivo_financeiro = models.DecimalField(max_digits=12, decimal_places=2)
    objetivo_mix = models.DecimalField(max_digits=12, decimal_places=2)
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
