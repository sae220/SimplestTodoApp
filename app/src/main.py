from fastapi import FastAPI

from .database import init_database


init_database()

app = FastAPI()
