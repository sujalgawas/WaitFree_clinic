import requests
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:5000"

DOCTOR_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjcwZmM5YzU0YjhiMjQyMWZmMTgyOTgxNTQyZmQ0NjRlOWJlYzM1NDUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vd2FpdGZyZWVjbGluaWMiLCJhdWQiOiJ3YWl0ZnJlZWNsaW5pYyIsImF1dGhfdGltZSI6MTc3NjUxNTc3NCwidXNlcl9pZCI6IlBVbFdpZjNCSXdhdERHV0NHQTg0NzFFa25nejEiLCJzdWIiOiJQVWxXaWYzQkl3YXRER1dDR0E4NDcxRWtuZ3oxIiwiaWF0IjoxNzc2NTE1Nzc1LCJleHAiOjE3NzY1MTkzNzUsImVtYWlsIjoic3VqYWxnYXdhczE4QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicGhvbmVfbnVtYmVyIjoiKzkxNzIwODI4NDI3MiIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsic3VqYWxnYXdhczE4QGdtYWlsLmNvbSJdLCJwaG9uZSI6WyIrOTE3MjA4Mjg0MjcyIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.ZpQ2CYQpRTLd4LNii-OCpGBRjnVpH-FZ5UsQYc7g4Sg-04faufWbwWWis5JkprkVJJ6LZFKE4l-CsZFuuHaGDZYoYmpCvsOX0Zd8k8DGsNrtYVXpISvCJXGa36REqqQ-mh78mYcqXvMJUEsXCPTkyaOcPkzVXVa7obgTsXELnOxMen1nJh0HUoVX9S2lUa_wmceoA6tTSTKtvuxBqQlLWfgPrfTKqENIeon2mrHvnFYNlLaH4_MhfmhSHck6NerHF_wXrdYpw1ce1vlz0i27uy3oHuzhyPF49xDBFtbKNxto46MhcUXmry0sBN_wilWAsjClgsxplZpPZEaZ_1GrAQ"

PATIENT_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjcwZmM5YzU0YjhiMjQyMWZmMTgyOTgxNTQyZmQ0NjRlOWJlYzM1NDUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vd2FpdGZyZWVjbGluaWMiLCJhdWQiOiJ3YWl0ZnJlZWNsaW5pYyIsImF1dGhfdGltZSI6MTc3NjUxNjAxOSwidXNlcl9pZCI6IkFxOGFoVXdCQnBVd1dEam9RWmE2NWVzb1FZbzIiLCJzdWIiOiJBcThhaFV3QkJwVXdXRGpvUVphNjVlc29RWW8yIiwiaWF0IjoxNzc2NTE2MDIwLCJleHAiOjE3NzY1MTk2MjAsImVtYWlsIjoic3VqYWxnYXdhczE3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicGhvbmVfbnVtYmVyIjoiKzkxOTc1NzA4MTI3NSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsic3VqYWxnYXdhczE3QGdtYWlsLmNvbSJdLCJwaG9uZSI6WyIrOTE5NzU3MDgxMjc1Il19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.FXpOgum6aD36JdFHZKRfXgwWGNejrmzCgH801Jn8h9B1zZbGeOaPL8ZwR8aFV_T1fR3BE97HHP-UB2Vz93FRRyY3Fn5xW-NVxjJSsiQq0RPuwWBgA51zS1fCAcXCVjkwh81ETBkcnuojUsutIhapkUmUwLutsOcKem-InH51CNG__ZhczaZHyDYdf1vjxE4r0Gpaf8IkyGYGPmkGNuRrvfRdfndGtoi-6VgTH997B39M99B1UmM_eTrYnPniHrlsVeB6aGS1-mH4oGqkgIu_HSb5ayHsupETbBU9vmMs6kkQkYVqFKN4QZXx7n7hFjv6TB-W3D5WB65dCaio0xxP9g"

DOCTOR_NAME = "sujalgawas18"
PATIENT_NAME = "sujalgawas17"
# Doctor UID extracted from DOCTOR_TOKEN JWT sub field:
DOCTOR_UID = "PUlWif3BIwatDGWCGA8471Ekngz1"  # exact Firestore doc id (case-sensitive)
TODAY = datetime.now().strftime("%Y-%m-%d")

def print_res(name, res):
    print(f"\n{'='*40}")
    print(f"Testing {name}:")
    print(f"Status Code: {res.status_code}")
    try:
        print(json.dumps(res.json(), indent=2))
    except:
        print(res.text)
    print(f"{'='*40}\n")

# 1. Test full optimized queue (Doctor facing)
def test_optimized_queue():
    url = f"{BASE_URL}/scheduler/optimized-queue"
    payload = {
        "token": DOCTOR_TOKEN,
        "date": TODAY,
        "clinic_open_time": "09:00"
    }
    res = requests.post(url, json=payload)
    print_res("POST /scheduler/optimized-queue", res)

# 2. Test add to queue (Patient facing)
def test_add_to_queue():
    url = f"{BASE_URL}/scheduler/add-to-queue"
    payload = {
        "token": PATIENT_TOKEN,
        "doctor_uid": DOCTOR_UID,      # pass uid directly — most reliable
        "slot": "11:00 AM",
        "date": TODAY,
        "symptoms": "fever and mild headache",
        "is_emergency": False,
        "is_new_patient": True
    }
    res = requests.post(url, json=payload)
    print_res("POST /scheduler/add-to-queue", res)

# 3. Test patient schedule (Patient facing)
def test_patient_schedule():
    url = f"{BASE_URL}/scheduler/patient-schedule"
    payload = {
        "token": PATIENT_TOKEN,
        "doctor_uid": DOCTOR_UID,   # correct case-sensitive Firestore UID
        "date": TODAY
    }
    res = requests.post(url, json=payload)
    print_res("POST /scheduler/patient-schedule", res)

if __name__ == "__main__":
    print("Starting API Tests...")
    test_optimized_queue()
    test_add_to_queue()
    test_patient_schedule()
