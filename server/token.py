import requests as r
import subprocess
import json

with open('./secrets_API.json') as f:
    secrets = json.load(f)
secrets = secrets['web']

def get_authorization_code():
    subprocess.run(['python3', '-m', 'http.server', '8080'])
    url = f"https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http://localhost:8080&prompt=consent&response_type=code&client_id={auth['client_id']}&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.send&access_type=offline"
    print("Go to this url : ", url)

def get_refresh_token(code=input("Rentrer le code que vous récup")):
    url = 'https://oauth2.googleapis.com/token'
    auth = {'client_id':secrets['client_id'], 'client_secret':secrets['client_secret'], 'grant_type':'authorization_code',
    'redirect_uri': 'http://localhost:8080',
    'code':code}
    req = r.post(url, json=auth)
    if req.ok:
        print("voici le nouveau refresh_token")
        print(req.json()['refresh_token'])
    else:
        print('ça a pas marché')
        print(req.json())