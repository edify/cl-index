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
