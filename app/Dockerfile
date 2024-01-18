FROM python:slim

WORKDIR /opt/simplestTodoApp/app
COPY ./requirements.txt ./requirements.txt
RUN pip install -r requirements.txt
COPY ./src ./src
