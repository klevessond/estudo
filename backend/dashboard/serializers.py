from rest_framework import serializers
from .models import ObjetivoMensal

class ObjetivoMensalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjetivoMensal
        fields = ['id', 'usuario', 'mes_referencia', 'objetivo_financeiro', 'objetivo_mix']
