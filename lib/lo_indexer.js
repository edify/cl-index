/**
 * Created by diugalde on 23/09/16.
 */


const elasticSearch = require('elasticsearch');
const rp = require('request-promise');

const config = require('./config');
const log = require('./log');


const docType = config.elasticSearch.docType;
const indexName = config.elasticSearch.index;

const client = new elasticSearch.Client({
    host: config.elasticSearch.url
});

var loIndexer = {

    /**
     * Creates a new document in the elasticSearch index.
     *
     * @param lo - object (LearningObject structure)
     * @returns Promise<boolean> or error.
     */
    add(lo) {
        return client.index({
            index: indexName,
            type: docType,
            id: lo.id,
            body: lo
        }).then(function(res) {
            // May have to do file work here (get from url or ).
            log.info(res);
            return Promise.resolve(true)
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    /**
     * Removes document from the elasticSearch index.
     *
     * @param loId - string (LearningObject's id).
     * @returns Promise<boolean> or error.
     */
    remove(loId) {
        return client.delete({
            index: indexName,
            type: docType,
            id: loId
        }).then(function(res) {
            log.info(res);
            return Promise.resolve(true)
        }).catch(function(err) {
            if (err.status === 404) {
                log.info(`Lo with id '${loId}' not found.`);
                return Promise.resolve(true)
            }
            return Promise.reject(err)
        })
    },

    /**
     * Updates existing document in elasticSearch.
     *
     * @param updatedLO - object (This object should have the following structure: {doc: LearningObject, file: null | {base64: '', format: ''}}
     * @returns Promise<boolean> or error.
     */
    update(updatedLO) {
        let lo = updatedLO.doc;

        return _getAttachment(updatedLO.file).then(function(attachment) {
            if (attachment !== null) {
                lo.file = attachment
            }
            return client.update({
                index: indexName,
                type: docType,
                id: lo.id,
                body: {doc: lo}
            })
        }).then(function(res){
            log.info(res);
            return Promise.resolve(true)
        }).catch(function(err) {
            return Promise.reject(err)
        })
    }
};


/**
 * Retrieves the file's base64 string. If the fileObj has an url format, it will download the HTML page first.
 *
 * @param fileObj - object (Example structure: null | {base64: '', format: ''})
 * @returns Promise<string> - (Base64 equivalent).
 * @private
 */
function _getAttachment(fileObj) {
    if (fileObj && fileObj !== null) {
        if (fileObj.format === 'url') {
            let url = new Buffer(fileObj.base64, 'base64').toString('ascii');
            return rp(url).then(function(res) {
                return Promise.resolve(new Buffer(res).toString('base64'))
            }).catch(function(err) {
                log.info(err);
                return Promise.resolve(new Buffer(`Error while getting ${url}`).toString('base64'))
            })
        }
        return Promise.resolve(fileObj.base64)
    }
    return Promise.resolve(null)
}


module.exports = Object.create(loIndexer);
