from django.db import models
from django.contrib.auth.models import User

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