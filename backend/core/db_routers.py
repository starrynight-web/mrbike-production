class DatabaseRouter:
    """
    A router to control all database operations on models.
    Supabase (default): new bikes, news, users (auth), structured admin data
    MongoDB (mongodb): used bikes, user profiles, reviews, interactions
    """
    mongodb_apps = {'interactions'}
    mongodb_models = {
        'users': {'userprofile'},
    }

    def db_for_read(self, model, **hints):
        if model._meta.app_label in self.mongodb_apps:
            return 'mongodb'
        if model._meta.app_label in self.mongodb_models:
            if model._meta.model_name in self.mongodb_models[model._meta.app_label]:
                return 'mongodb'
        return 'default'

    def db_for_write(self, model, **hints):
        if model._meta.app_label in self.mongodb_apps:
            return 'mongodb'
        if model._meta.app_label in self.mongodb_models:
            if model._meta.model_name in self.mongodb_models[model._meta.app_label]:
                return 'mongodb'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if both models are in the same database.
        """
        # Relation between User (default) and UserProfile (mongodb) is tricky with multiple DBs.
        # Djongo/Django usually handles OneToOne across DBs poorly in some versions,
        # but we allow it here to let Django's logic attempt it.
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label in self.mongodb_apps:
            return db == 'mongodb'
        
        if app_label in self.mongodb_models:
            if model_name in self.mongodb_models[app_label]:
                return db == 'mongodb'
            return db == 'default'  # Other models in this app go to default
            
        # All other apps (including marketplace) go to default Postgres
        return db == 'default'
