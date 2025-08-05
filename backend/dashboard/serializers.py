from rest_framework import serializers
from .models import ObjetivoMensal,Profile
from django.contrib.auth.models import User


class ObjetivoMensalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjetivoMensal
        fields = ['id', 'usuario', 'mes_referencia', 'objetivo_financeiro', 'objetivo_mix']

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['phone', 'cod_funcionario', 'cod_unid_gestora', 'entregador', 'supervisor', 'transportador', 'transportador_aux', 'vendedor', 'cobrador']

class CustomUserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'profile']
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)

        # Atualiza dados do usuário
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()

        # Atualiza dados do perfil
        profile = instance.profile
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()

        return instance