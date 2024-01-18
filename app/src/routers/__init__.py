from fastapi import APIRouter

from .todo_router import router as todo_router

router = APIRouter()

router.include_router(todo_router, prefix='/todos')
