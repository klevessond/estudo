from rest_framework import serializers
from .models import ObjetivoMensal, Profile, ObjetivoMixNivel, Feriado, CampanhaVenda, CampanhaVendaObjetivo,CampanhaVendaItem
from django.contrib.auth.models import User
from django.db import transaction
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator


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



class CampanhaVendaItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampanhaVendaItem
        fields = ['id', 'cod_referencia', 'nome_referencia']
        read_only_fields = ['id']


class CampanhaVendaObjetivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampanhaVendaObjetivo
        fields = [
            'id', 'campanha', 'cod_vendedor', 'nome_vendedor',
            'objetivo_peso', 'objetivo_financeiro', 'objetivo_quantidade',
        ]
        # O ViewSet faz "upsert" por (campanha, cod_vendedor); sem isso o
        # validador de unicidade barraria a atualização de quem já existe.
        validators = []

    def _nao_negativo(self, valor):
        if valor is not None and valor < 0:
            raise serializers.ValidationError('O objetivo não pode ser negativo.')
        return valor

    def validate_objetivo_peso(self, v):       return self._nao_negativo(v)
    def validate_objetivo_financeiro(self, v): return self._nao_negativo(v)
    def validate_objetivo_quantidade(self, v): return self._nao_negativo(v)


class CampanhaVendaSerializer(serializers.ModelSerializer):
    itens        = CampanhaVendaItemSerializer(many=True, required=False)
    objetivos    = CampanhaVendaObjetivoSerializer(many=True, read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = CampanhaVenda
        fields = [
            'id', 'nome', 'tipo', 'tipo_display',
            'cod_fabricante', 'nome_fabricante',
            'data_inicio', 'data_fim', 'ativa', 'descricao', 'criado_em',
            'itens', 'objetivos',
        ]
        extra_kwargs = {'cod_fabricante': {'required': True, 'allow_null': False}}

    def validate(self, attrs):
        inst = self.instance
        di = attrs.get('data_inicio', getattr(inst, 'data_inicio', None))
        df = attrs.get('data_fim', getattr(inst, 'data_fim', None))
        if di and df and df < di:
            raise serializers.ValidationError({'data_fim': 'A data fim não pode ser anterior à data início.'})

        # Na criação, ou quando o escopo for enviado, precisa ter ao menos 1 item
        if inst is None or 'itens' in attrs:
            if not attrs.get('itens'):
                raise serializers.ValidationError({'itens': 'Informe ao menos um material/grupo para a campanha.'})
        return attrs

    @staticmethod
    def _salvar_itens(campanha, itens):
        vistos, novos = set(), []
        for it in itens:
            cod = int(it['cod_referencia'])
            if cod in vistos:
                continue
            vistos.add(cod)
            novos.append(CampanhaVendaItem(
                campanha=campanha,
                cod_referencia=cod,
                nome_referencia=(it.get('nome_referencia') or '')[:150],
            ))
        CampanhaVendaItem.objects.bulk_create(novos)

    def create(self, validated_data):
        itens = validated_data.pop('itens', [])
        with transaction.atomic():
            campanha = CampanhaVenda.objects.create(**validated_data)
            self._salvar_itens(campanha, itens)
        return campanha

    def update(self, instance, validated_data):
        itens = validated_data.pop('itens', None)
        with transaction.atomic():
            instance = super().update(instance, validated_data)
            if itens is not None:
                instance.itens.all().delete()
                self._salvar_itens(instance, itens)
        return instance

class UserRegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    phone = serializers.CharField(required=True, max_length=20)
    # Campos do funcionário
    cod_funcionario = serializers.IntegerField(required=True)
    cod_unid_gestora = serializers.IntegerField(required=True)
    entregador = serializers.BooleanField(required=True)
    supervisor = serializers.BooleanField(required=True)
    transportador = serializers.BooleanField(required=True)
    transportador_aux = serializers.BooleanField(required=True)
    vendedor = serializers.BooleanField(required=True)
    cobrador = serializers.BooleanField(required=True)
    
    class Meta:
        model = User
        fields = (
            'username', 'password', 'password2', 'email',
            'first_name', 'last_name', 'phone',
            'cod_funcionario', 'cod_unid_gestora',
            'entregador', 'supervisor', 'transportador',
            'transportador_aux', 'vendedor', 'cobrador'
        )
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'phone': {'required': True},
            'cod_funcionario': {'required': True},
            'cod_unid_gestora': {'required': True},
            'entregador': {'required': True},
            'supervisor': {'required': True},
            'transportador': {'required': True},
            'transportador_aux': {'required': True},
            'vendedor': {'required': True},
            'cobrador': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})
        return attrs

    def create(self, validated_data):
        """print("dados de cadastro",validated_data)"""
        phone = validated_data.pop('phone')
        cod_funcionario = validated_data.pop('cod_funcionario')
        cod_unid_gestora = validated_data.pop('cod_unid_gestora')
        entregador = validated_data.pop('entregador')
        supervisor = validated_data.pop('supervisor')
        transportador = validated_data.pop('transportador')
        transportador_aux = validated_data.pop('transportador_aux')
        vendedor = validated_data.pop('vendedor')
        cobrador = validated_data.pop('cobrador')
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])
        user.save()
        profile, created = Profile.objects.get_or_create(user=user)
        profile.phone = phone
        profile.cod_funcionario = cod_funcionario
        profile.cod_unid_gestora = cod_unid_gestora
        profile.entregador = entregador
        profile.supervisor = supervisor
        profile.transportador = transportador
        profile.transportador_aux = transportador_aux
        profile.vendedor = vendedor
        profile.cobrador = cobrador
        profile.save()
        return user
