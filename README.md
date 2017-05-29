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
$ export CL_RMQ_PREFETCH_COUNT=30
```

Note: CL_RMQ_PREFETCH_COUNT defines the max number of messages delivered to a consumer at once. More info: https://www.rabbitmq.com/consumer-prefetch.html

4.  Before executing the main file, you need to make sure that your rabbitMQ and elasticSearch instances are running.

5.  Execute the main file to start the server:
```bash
$ chmod +x bin/index_service
$ ./bin/index_service
```

6.  If you want to run tests:
```bash
$ npm test
```

## Build and deploy docker image

```bash
$ curl -u<USERNAME>:<PASSWORD> https://edify.jfrog.io/edify/api/npm/auth > ~/.npmrc
$ rm -rf node_modules/
$ npm install
$ docker build -t cl-index .
$ docker tag cl-index edify-dkr.jfrog.io/cl-index:SEMANTIC_VERSION
$ docker login edify-dkr.jfrog.io
$ docker push edify-dkr.jfrog.io/cl-index
```