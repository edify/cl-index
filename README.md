# cl-index

Common Library Index Service

---

## Build and Run

1.  First, you need to install nodejs v6.4.0. You can follow the instructions here [NodeJS](https://nodejs.org).

2.  Install all the dependencies:
```bash
$ npm install
```

3.  You must set some environment variables before running the application:
```bash
$ export CL_ES_URL=localhost:9200
$ export CL_RMQ_URL=amqp://localhost
```

4.  Before executing the main file, you need to make sure that your rabbitMQ and elasticSearch instances are running (check docker-compose file in the cl-lo project).

5.  Execute the main file to start the server:
```bash
$ chmod +x bin/index_service
$ ./bin/index_service
```
