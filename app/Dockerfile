FROM python:slim

WORKDIR /opt/simplestTodoApp/app
COPY ./requirements.txt ./requirements.txt
RUN pip install -r requirements.txt
COPY ./src ./src

EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0"]
