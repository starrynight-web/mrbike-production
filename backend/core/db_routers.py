class DatabaseRouter:
    """
    A router to control all database operations on models in the
    users, marketplace, and interactions applications.
    """
    route_app_labels = {'marketplace', 'interactions'}
    mongodb_apps = {'marketplace', 'interactions'}

    def db_for_read(self, model, **hints):
        """
        Attempts to read users, marketplace, and interactions from mongodb.
        """
        if model._meta.app_label in self.mongodb_apps:
            return 'mongodb'
        return 'default'

    def db_for_write(self, model, **hints):
        """
        Attempts to write users, marketplace, and interactions to mongodb.
        """
        if model._meta.app_label in self.mongodb_apps:
            return 'mongodb'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if both models are in the same database.
        """
        if (
            obj1._meta.app_label in self.mongodb_apps or
            obj2._meta.app_label in self.mongodb_apps
        ):
           return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Make sure the auth and marketplace apps only appear in the
        'mongodb' database.
        """
        if app_label in self.mongodb_apps:
            return db == 'mongodb'
        return db == 'default'
