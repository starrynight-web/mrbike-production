import base64
import json

def decode_jwt(token):
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return "Invalid token"
        payload = parts[1]
        # Add padding
        payload += '=' * (4 - len(payload) % 4)
        decoded = base64.b64decode(payload).decode('utf-8')
        return json.loads(decoded)
    except Exception as e:
        return f"Error: {e}"

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwdXpveW9yZGJvamVjcGd1cHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjEyMDYsImV4cCI6MjA4NjAzNzIwNn0.Kq412GHwSaMencbzAYAu8Mj0gYC5EzcWJweDDV7ZGnU"
print(decode_jwt(token))
