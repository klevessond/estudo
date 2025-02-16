from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError

class Command(BaseCommand):
    help = 'Testa a conexão com o banco de dados'

    def handle(self, *args, **kwargs):
        try:
            db_conn = connections['default']
            db_conn.cursor()
            self.stdout.write(self.style.SUCCESS('Conexão com o banco de dados estabelecida com sucesso!'))
        except OperationalError as e:
            self.stdout.write(self.style.ERROR(f'Erro ao conectar ao banco de dados: {str(e)}'))