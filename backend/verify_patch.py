import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from djongo.introspection import DatabaseIntrospection
from djongo.operations import DatabaseOperations

print(f"Data types reverse: {DatabaseIntrospection.data_types_reverse.get('ObjectIdField')}")
print(f"Is patched: {getattr(DatabaseOperations, '_patched', False)}")

# Test the method
try:
    ops = DatabaseOperations(None)
    result = ops.integer_field_definition(None)
    print(f"integer_field_definition result: {result}")
except Exception as e:
    print(f"integer_field_definition failed: {e}")
