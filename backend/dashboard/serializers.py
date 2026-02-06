from rest_framework import serializers
from .models import ObjetivoMensal,Profile,ObjetivoMixNivel,Feriado
from django.contrib.auth.models import User


class ObjetivoMensalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjetivoMensal
        fields = ['id', 'usuario', 'mes_referencia', 'objetivo_financeiro', 'objetivo_mix','objetivo_peso', 'objetivo_positivacao',]

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['phone', 'cod_funcionario', 'cod_unid_gestora', 'entregador', 'supervisor', 'transportador', 'transportador_aux', 'vendedor', 'cobrador']
        extra_kwargs = {
            'cod_funcionario': {'validators': []}
        }

class CustomUserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'profile']
        extra_kwargs = {'password': {'write_only': True, 'required': False}}
    
    def validate(self, data):
        profile_data = data.get('profile', {})
        cod_funcionario = profile_data.get('cod_funcionario')

        if cod_funcionario:
            # Busca se existe algum perfil com esse código
            existe = Profile.objects.filter(cod_funcionario=cod_funcionario)
            
            # Se for uma edição (self.instance existe), exclui o próprio usuário da busca
            if self.instance:
                existe = existe.exclude(user=self.instance)
            
            if existe.exists():
                raise serializers.ValidationError({
                    "profile": {"cod_funcionario": "Este Código de Funcionário já está em uso por outro usuário."}
                })
        
        return data

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)

        # Atualiza dados do usuário
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()

         # Atualiza dados do Profile com validação de unicidade do cod_funcionario
        if profile_data is not None:
            profile, _ = Profile.objects.get_or_create(user=instance)

            # valida cod_funcionario único (exceto para o próprio usuário)
            if 'cod_funcionario' in profile_data:
                cod = profile_data['cod_funcionario']
                if cod is not None:
                    exists = Profile.objects.filter(cod_funcionario=cod).exclude(user=instance).first()
                    if exists:
                        raise serializers.ValidationError({
                            'profile': {'cod_funcionario': 'Este funcionário já está vinculado a outro usuário.'}
                        })
                profile.cod_funcionario = cod  # pode ser None (liberar vínculo)

            # demais campos do profile
            for field in [
                'phone', 'cod_unid_gestora', 'entregador', 'supervisor',
                'transportador', 'transportador_aux', 'vendedor', 'cobrador'
            ]:
                if field in profile_data:
                    setattr(profile, field, profile_data[field])

            profile.save()

        return instance
    
class MeSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_superuser", "profile", "roles"]

    def get_roles(self, obj):
        p = getattr(obj, "profile", None)
        if not p:
            return []
        roles = []
        if p.entregador: roles.append("entregador")
        if p.supervisor: roles.append("supervisor")
        if p.transportador: roles.append("transportador")
        if p.transportador_aux: roles.append("transportador_aux")
        if p.vendedor: roles.append("vendedor")
        if p.cobrador: roles.append("cobrador")
        if obj.is_superuser: roles.append("admin")
        return roles


class ObjetivoMixNivelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjetivoMixNivel
        fields = ['id', 'mes_referencia', 'nivel', 'codigo_alvo', 'objetivo_mix']


class FeriadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feriado
        fields = ['id', 'data', 'descricao']