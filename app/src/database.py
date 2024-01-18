from os import environ as env
from typing import Annotated, Generator

from fastapi import Depends
from sqlmodel import create_engine, Session, SQLModel


DATABASE_URL = f'postgresql://{env["POSTGRES_USER"]}:{env["POSTGRES_PASSWORD"]}@{env["POSTGRES_HOST"]}:5432/{env["POSTGRES_DB"]}'

engine = create_engine(DATABASE_URL)

def init_database() -> None:
    SQLModel.metadata.create_all(engine)

def get_database_session() -> Generator[:,:,Session]:
    with Session(engine) as session:
        yield session

DatabaseSessionGetter = Annotated[Session, Depends(get_database_session)]
