FROM docker:dind

WORKDIR /opt/simplestTodoApp/aws-cdk
RUN apk add --update npm
COPY ./aws-cdk/package*.json ./
RUN npm install && npm install -g aws-cdk
COPY ./aws-cdk ./
COPY ./app ../app
