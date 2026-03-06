import os
import django
import sys

# Set up Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

def check():
    print(f"Engine: {connection.settings_dict['ENGINE']}")
    print(f"Name: {connection.settings_dict['NAME']}")
    print(f"Host: {connection.settings_dict['HOST']}")
    print(f"Port: {connection.settings_dict['PORT']}")
    print(f"User: {connection.settings_dict['USER']}")

if __name__ == "__main__":
    check()
