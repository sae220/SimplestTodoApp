from datetime import datetime
from uuid import UUID, uuid4

from fastapi import HTTPException, status
from pydantic import validator
from sqlmodel import Field, SQLModel


class TodoBase(SQLModel):
    title: str
    detail: str | None


class TodoCreate(TodoBase):
    detail: str | None = None


class Todo(TodoBase, table=True):
    id: UUID = Field(primary_key=True, default_factory=uuid4)
    is_completed: bool = False
    created_at: datetime = Field(default_factory=datetime.now)


class TodoUpdate(TodoBase):
    detail: str | None = None


class TodoComplete(SQLModel):
    is_completed: bool

    @validator('is_completed')
    def is_completed_must_be_true(cls, value):
        if not value:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail='is_completed must be true')
        return value


class TodoOut(TodoBase):
    id: UUID
    is_completed: bool
    created_at: datetime


class DeletedTodo(TodoOut, table=True):
    id: UUID = Field(primary_key=True)
    deleted_at: datetime = Field(default_factory=datetime.now)
