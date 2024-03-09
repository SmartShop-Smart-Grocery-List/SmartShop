import os
from dotenv import load_dotenv

load_dotenv()

def getClientID(): return os.getenv("CLIENT_ID")

def getClientSecret(): return os.getenv("CLIENT_SECRET")