from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, Response, status
from sqlmodel import select

from ..database import DatabaseSessionGetter
from ..models.todo_model import TodoCreate, Todo, TodoUpdate, TodoComplete, TodoOut


router = APIRouter()


@router.get('/', response_model=list[TodoOut])
def read_todos_list(session: DatabaseSessionGetter) -> Any:
    '''Todoの一覧を取得する
    '''
    statement = select(Todo)
    todos = session.exec(statement).all()
    if not todos:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Todo not found')
    return todos


@router.get('/{todo_id}', response_model=TodoOut)
def read_todo_from_id(session: DatabaseSessionGetter, todo_id: UUID) -> Any:
    '''IDからTodoを取得する
    '''
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Todo not found')
    return todo


@router.post('/')
def create_todo(session: DatabaseSessionGetter, todo_in: TodoCreate) -> Any:
    '''Todoを作成する
    '''
    todo = Todo.from_orm(todo_in)
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return Response(status_code=status.HTTP_201_CREATED, headers={"Location": f"http://localhost:8000/todos/{todo.id}"})


@router.put('/{todo_id}')
def update_todo(session: DatabaseSessionGetter, todo_id: UUID, todo_in: TodoUpdate) -> None:
    '''Todoを更新する (IDと作成日、完了したかどうかについては更新しない)
    '''
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Todo not found')
    todo.title = todo_in.title
    todo.detail = todo_in.detail
    session.commit()
    session.refresh(todo)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch('/{todo_id}')
def complete_todo(session: DatabaseSessionGetter, todo_id: UUID, todo_in: TodoComplete) -> None:
    '''Todoの完了状態を更新する (戻すことは許さない)
    '''
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Todo not found')
    if todo.is_completed:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Todo is already completed')
    todo.is_completed = todo_in.is_completed
    session.commit()
    session.refresh(todo)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete('/{todo_id}')
def delete_todo(session: DatabaseSessionGetter, todo_id: UUID) -> None:
    '''Todoを削除する
    '''
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Todo not found')
    session.delete(todo)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
