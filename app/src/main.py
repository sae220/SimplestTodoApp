from fastapi import FastAPI

from .database import init_database
from .routers import router


init_database()

app = FastAPI()
app.include_router(router)
