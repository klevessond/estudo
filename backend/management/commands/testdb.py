from django.core.management.base import BaseCommand
from dashboard.db_conn import test_select_one

class Command(BaseCommand):
    help = "Testa conexão MSSQL via ODBC (FreeTDS) e executa SELECT 1"

    def handle(self, *args, **kwargs):
        try:
            row = test_select_one()
            self.stdout.write(self.style.SUCCESS(f"OK: SELECT 1 -> {row}"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"FAIL: {e}"))
            raise SystemExit(1)
