FROM node:6.9.1

RUN mkdir -p /usr/share/cl-index

COPY . /usr/share/cl-index

WORKDIR /usr/share/cl-index

RUN chmod +x ./docker-entry.sh

ENTRYPOINT [ "./docker-entry.sh" ]
