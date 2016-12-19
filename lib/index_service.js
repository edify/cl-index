/*
 * Copyright 2016 Edify Software Consulting.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


 /**
 * Created by diugalde on 23/09/16.
 */

const amqp = require('amqplib');

const config = require('./config');
const msgStatus = require('./message_status');
const loIndexer = require('./lo_indexer');
const log = require('./log');


/**
 * Processes queue messages.
 *
 * @param msg - JSON string with the following format: {
 *                                                          action: add | remove | update,
 *                                                          content: object
 *                                                     }
 * @returns Promise<msgStatus>
 */
function process(msg) {
    try {
        let msgObj = JSON.parse(msg.content.toString());
        if (msgObj.action && loIndexer[msgObj.action]) {
            return loIndexer[msgObj.action](msgObj.content);
        } else {
            return Promise.resolve(msgStatus.IGNORED)
        }
    } catch(err) {
        log.info(`[Index_Service][process] There was an error while processing the msg.`, err);
        return Promise.resolve(msgStatus.FAILED)
    }
}

function main() {

    log.info('Starting cl-index...');

    const queueName = config.rabbitMQ.loQueue;

    // Connects and listen RabbitMQ messages.
    amqp.connect(config.rabbitMQ.url).then(function(conn) {
        return conn.createChannel();
    }).then(function(ch) {
        ch.assertQueue(queueName);
        ch.prefetch(config.rabbitMQ.prefetchCount);
        return Promise.resolve(ch)
    }).then(function(ch) {
        return ch.consume(queueName, function(msg) {
            process(msg).then(function(res) {
                if (res === msgStatus.IGNORED || res === msgStatus.PROCESSED) {
                    ch.ack(msg)
                } else {
                    ch.nack(msg, false, false)
                }
            })
        })
    }).catch(function(err) {
        log.info(err)
    });
}


module.exports = {
    main
};
