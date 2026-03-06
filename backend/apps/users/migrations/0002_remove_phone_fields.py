"""
Migration: Drop phone and is_phone_verified columns from users_user table.
These fields were removed from the User model when the phone OTP system was removed.
"""

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='phone',
        ),
        migrations.RemoveField(
            model_name='user',
            name='is_phone_verified',
        ),
    ]
