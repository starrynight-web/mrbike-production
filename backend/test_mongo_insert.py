import os
import django
import sys

# Set up Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.marketplace.models import UsedBikeListing
from django.contrib.auth import get_user_model

User = get_user_model()

def test_insert():
    admin_user = User.objects.first()
    try:
        listing = UsedBikeListing(
            seller=admin_user,
            title="Test Bike",
            price=200000.00, # Try with float
            mileage=10000,
            manufacturing_year=2020,
            condition='good',
            description="Test description",
            location="Test Location"
        )
        try:
            from djongo.sql2mongo.query import InsertQuery
            from sqlparse.sql import Parenthesis
            from sqlparse import tokens
            from djongo.sql2mongo.sql_tokens import SQLToken

            def patched_fill_values(self, statement):
                for tok in statement:
                    if isinstance(tok, Parenthesis):
                        placeholder = SQLToken.token2sql(tok, self)
                        values = []
                        for index in placeholder:
                            if isinstance(index, int):
                                values.append(self.params[index])
                            else:
                                values.append(index)
                        self._values.append(values)
                    elif tok.match(tokens.Keyword, 'VALUES'):
                        continue
                    else:
                        if tok.match(tokens.Keyword, 'RETURNING') or str(tok).strip() in ('', ';'):
                            break
                        print(f"[WARNING] Djongo ignored unexpected token: {tok}")
            
            InsertQuery._fill_values = patched_fill_values
            print("[OK] Applied direct patch in test script!")
        except Exception as patch_e:
            print(f"Failed to patch in test: {patch_e}")

        listing.save()
        print("Successfully saved with float!")
    except Exception as e:
        import traceback
        with open("tb_log.txt", "w", encoding="utf-8") as f:
            f.write(traceback.format_exc())

if __name__ == "__main__":
    test_insert()
