/**
 * Created by diugalde on 23/09/16.
 */

const config = {
    elasticSearch: {
        url: 'localhost:9200' || process.env.CL_ES_URL,
        index: 'clc_learning_object_index',
        docType: 'clc_learning_object'
    },

    rabbitMQ: {
        url: 'amqp://localhost' || process.env.CL_RMQ_URL,
        loQueue:  'cl_lo_queue'
    }
};

module.exports = config;
