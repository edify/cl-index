/**
 * Created by diugalde on 23/09/16.
 */

const bunyan = require('bunyan');
const bunyanFormat = require('bunyan-format');

const APP_NAME = 'cl-index';

// Init bunyan log with a nice output format.
var bunyanFormatStdOut = bunyanFormat({ outputMode: 'short' });

var log = bunyan.createLogger({
    name: APP_NAME,
    streams: [
        { level: "info", stream: bunyanFormatStdOut }
    ]
});

module.exports = log;
