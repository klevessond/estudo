from django.contrib import admin
from .models import ObjetivoMensal

@admin.register(ObjetivoMensal)
class ObjetivoMensalAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'mes_referencia', 'objetivo_financeiro', 'objetivo_mix')
    list_filter = ('mes_referencia',)
