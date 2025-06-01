class MultiDBRouter:
    """
    Roteador para gerenciar operações entre SQLite (default) e SQL Server (dados_industria).
    """

    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'dashboard':
            return 'default'
        if model._meta.app_label in ['auth', 'admin', 'sessions', 'contenttypes']:
            return 'default'
        return 'dados_industria'

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'dashboard':
            return 'default'
        if model._meta.app_label in ['auth', 'admin', 'sessions', 'contenttypes']:
            return 'default'
        return None  # Bloqueia escrita em dados_industria

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if db == 'default':
            return app_label in ['auth', 'admin', 'sessions', 'contenttypes', 'dashboard']
        return False
