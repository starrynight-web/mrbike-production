"""
Management command to consolidate admin access to super admin only.
Removes admin privileges from all other users.
"""
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Consolidate all admin access to super admin account only. Remove admin privileges from all other users.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--super-admin-email',
            type=str,
            default='admin_gr_s_n_r_t_e@unleft.space',
            help='Email of the super admin account (default: admin_gr_s_n_r_t_e@unleft.space)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be changed without making changes'
        )

    def handle(self, *args, **options):
        super_admin_email = options['super_admin_email']
        dry_run = options['dry_run']

        # Find the super admin account
        try:
            super_admin = User.objects.get(email=super_admin_email)
            self.stdout.write(
                self.style.SUCCESS(f'✓ Found super admin account: {super_admin.email}')
            )
        except User.DoesNotExist:
            raise CommandError(
                f'ERROR: Super admin account with email {super_admin_email} does not exist. '
                'Please create it first or check the email.'
            )

        # Ensure super admin has all admin privileges
        if not dry_run:
            super_admin.is_staff = True
            super_admin.is_superuser = True
            super_admin.role = 'admin'
            super_admin.is_phone_verified = True
            super_admin.is_email_verified = True
            super_admin.save()
            self.stdout.write(
                self.style.SUCCESS(f'✓ Ensured {super_admin_email} has all admin privileges')
            )

        # Find all other users with admin privileges
        other_admins = User.objects.exclude(email=super_admin_email).filter(
            is_staff=True
        ) | User.objects.exclude(email=super_admin_email).filter(
            is_superuser=True
        ) | User.objects.exclude(email=super_admin_email).filter(
            role='admin'
        )
        
        other_admins = other_admins.distinct()

        if other_admins.exists():
            self.stdout.write(
                self.style.WARNING(f'\nFound {other_admins.count()} other user(s) with admin privileges:')
            )
            for user in other_admins:
                self.stdout.write(
                    f'  - {user.email or user.phone} (username: {user.username})'
                )

            if not dry_run:
                # Remove admin privileges from all other users
                for user in other_admins:
                    user.is_staff = False
                    user.is_superuser = False
                    if user.role == 'admin':
                        user.role = 'user'  # Downgrade to regular user
                    user.save()

                self.stdout.write(
                    self.style.SUCCESS(
                        f'\n✓ Removed admin privileges from {other_admins.count()} user(s)'
                    )
                )
        else:
            self.stdout.write(
                self.style.SUCCESS('\n✓ No other admin users found')
            )

        # Final summary
        if dry_run:
            self.stdout.write(
                self.style.WARNING('\n[DRY RUN MODE] No changes were made. Run without --dry-run to apply changes.')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✓ Admin consolidation complete!'
                    f'\n✓ Only {super_admin_email} can access admin features'
                    f'\n✓ All admin operations are now restricted to super admin'
                )
            )
