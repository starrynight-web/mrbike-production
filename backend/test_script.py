from django.test import Client

client = Client()
print('Testing /api/v1/bikes/ with INVALID auth...')
res_auth = client.get('/api/v1/bikes/', HTTP_AUTHORIZATION='Bearer invalid_token')
print('Status:', res_auth.status_code)
if res_auth.status_code != 200:
    print('Response:', res_auth.content)

