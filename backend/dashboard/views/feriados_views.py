"""Cadastro de feriados (usado no cálculo de dias úteis). Movido de main_views.py."""
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from dashboard.models import Feriado
from dashboard.permissions import IsAdminGerenteOrSupervisor
from dashboard.serializers import FeriadoSerializer


class FeriadoView(APIView):
    permission_classes = [IsAuthenticated]

    def tem_permissao(self, request):
        # admin, gerente ou supervisor (regra única em dashboard/permissions.py)
        return IsAdminGerenteOrSupervisor().has_permission(request, self)

    def get(self, request):
        if not self.tem_permissao(request):
            return Response({"error": "Acesso restrito."}, status=status.HTTP_403_FORBIDDEN)
            
        ano = request.query_params.get('ano')
        qs = Feriado.objects.all()
        if ano:
            qs = qs.filter(data__year=ano)
        
        serializer = FeriadoSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not self.tem_permissao(request):
            return Response({"error": "Acesso restrito."}, status=status.HTTP_403_FORBIDDEN)

        serializer = FeriadoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not self.tem_permissao(request):
            return Response({"error": "Acesso restrito."}, status=status.HTTP_403_FORBIDDEN)

        try:
            feriado = Feriado.objects.get(pk=pk)
            feriado.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Feriado.DoesNotExist:
            return Response({"error": "Feriado não encontrado"}, status=status.HTTP_404_NOT_FOUND)
