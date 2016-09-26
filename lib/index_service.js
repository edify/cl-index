/**
 * Created by diugalde on 23/09/16.
 */

const amqp = require('amqplib');

const config = require('./config');
const loIndexer = require('./lo_indexer');
const log = require('./log');


/**
 * Processes queue messages.
 *
 * @param msg - JSON string with the following format: {
 *                                                          action: add | remove | update,
 *                                                          content: object
 *                                                     }
 * @returns Promise<boolean> - It will true if the msg was successfully processed. Error otherwise.
 */
function process(msg) {
    try {
        let msgObj = JSON.parse(msg.content.toString());
        if (msgObj.action && loIndexer[msgObj.action]) {
            log.info(`Executing ${msgObj.action} operation...`);
            return loIndexer[msgObj.action](msgObj.content);
        } else {
            // If it is an unknown msg, just return true.
            return Promise.resolve(true)
        }
    } catch(err) {
        return Promise.reject(err)
    }
}

function main() {

    log.info('Starting cl-index...');

    const queueName = config.rabbitMQ.loQueue;

    // Connects and listen RabbitMQ messages.
    amqp.connect(config.rabbitMQ.url).then(function(conn) {
        return conn.createChannel();
    }).then(function(ch) {
        return ch.assertQueue(queueName).then(function() {
            return ch.consume(queueName, function(msg) {
                if (msg) {
                    process(msg).then(function(res) {
                        if (res === true) {
                            ch.ack(msg)
                        }
                    }).catch(function(err) {
                        log.info(err)
                    })
                }
            });
        });
    }).catch(function(err) {
        log.info(err)
    });
}

module.exports = {
    main
};
