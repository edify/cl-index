/**
 * Created by diugalde on 23/09/16.
 */

const config = {
    elasticSearch: {
        url: process.env.CL_ES_URL || 'localhost:9200',
        index: 'clc_learning_object_index',
        docType: 'clc_learning_object'
    },

    rabbitMQ: {
        url: process.env.CL_RMQ_URL || 'amqp://localhost',
        loQueue:  'cl_lo_queue',
        prefetchCount: 30
    }
};


module.exports = config;
