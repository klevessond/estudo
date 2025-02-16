class MultiDBRouter:
    """
    Router para gerenciar as operações entre SQLite e SQL Server
    """
    def db_for_read(self, model, **hints):
        # Models relacionados à autenticação usam SQLite
        if model._meta.app_label in ['auth', 'admin', 'sessions', 'contenttypes']:
            return 'default'
        # Seus models de dados usam SQL Server
        return 'dados_industria'

    def db_for_write(self, model, **hints):
        # Permite escrita apenas no SQLite e apenas para apps do sistema
        if model._meta.app_label in ['auth', 'admin', 'sessions', 'contenttypes']:
            return 'default'
        # Bloqueia escrita para outros models
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        # Permite migrações apenas no SQLite e apenas para apps do sistema
        if db == 'default':
            return app_label in ['auth', 'admin', 'sessions', 'contenttypes']
        # Bloqueia migrações no SQL Server
        return False