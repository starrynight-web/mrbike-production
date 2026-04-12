import urllib.request
import traceback

try:
    req = urllib.request.Request('http://localhost:8000/api/v1/marketplace/listings/')
    req.add_header('Accept', 'application/json')
    res = urllib.request.urlopen(req)
    print("OK:", res.read().decode('utf-8')[:500])
except urllib.error.HTTPError as e:
    print("HTTP ERROR:", e.code)
    print(e.read().decode('utf-8'))
except Exception as e:
    print("ERROR:", e)
    print(traceback.format_exc())
