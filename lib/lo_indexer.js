/**
 * Created by diugalde on 23/09/16.
 */


const elasticSearch = require('elasticsearch');
const rp = require('request-promise');

const config = require('./config');
const msgStatus = require('./message_status');
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
     * @returns Promise<msgStatus>
     */
    add(lo) {
        return _getContent(lo.externalUrl).then(function(base64Content) {
            if (base64Content !== null) {
                lo.file = base64Content
            }
            return client.index({
                index: indexName,
                type: docType,
                id: lo.id,
                body: lo
            })
        }).then(function() {
            log.info(`[LO_Indexer][add] Learning Object with id '${lo.id}' successfully added.`);
            return Promise.resolve(msgStatus.PROCESSED)
        }).catch(function(err) {
            log.info(`[LO_Indexer][add] There was an error while adding Learning Object with id '${lo.id}'. `, err);
            return Promise.resolve(msgStatus.FAILED)
        })
    },

    /**
     * Removes document from the elasticSearch index.
     *
     * @param loId - string (LearningObject's id).
     * @returns Promise<msgStatus>
     */
    remove(loId) {
        return client.delete({
            index: indexName,
            type: docType,
            id: loId
        }).then(function() {
            log.info(`[LO_Indexer][remove] Learning Object with id '${loId}' successfully removed.`);
            return Promise.resolve(msgStatus.PROCESSED)
        }).catch(function(err) {
            if (err.status === 404) {
                log.info(`[LO_Indexer][remove] Remove from index failed: LO with id ${loId} was not found in index.`);
                return Promise.resolve(msgStatus.PROCESSED)
            }
            log.info(`[LO_Indexer][remove] There was an error while removing Learning Object with id '${loId}'. `, err);
            return Promise.resolve(msgStatus.FAILED)
        })
    },

    /**
     * Updates existing document in elasticSearch.
     *
     * @param updatedLO - object (This object should have the following structure: {doc: LearningObject, fileUrl: ''}}
     * @returns Promise<msgStatus>
     */
    update(updatedLO) {
        let lo = updatedLO.doc;
        return _getContent(updatedLO.fileUrl).then(function(base64Content) {
            if (base64Content !== null) {
                lo.file = base64Content
            }
            return client.update({
                index: indexName,
                type: docType,
                id: lo.id,
                body: {doc: lo}
            })
        }).then(function(){
            log.info(`[LO_Indexer][update] Learning Object with id '${lo.id}' successfully updated.`);
            return Promise.resolve(msgStatus.PROCESSED)
        }).catch(function(err) {
            log.info(`[LO_Indexer][update] There was an error while updating Learning Object with id '${lo.id}'. `, err);
            return Promise.resolve(msgStatus.FAILED)
        })
    }
};


/**
 * Downloads the url file and returns a base64 string.
 *
 * @param url - string
 * @returns Promise<string> - (Base64 equivalent).
 * @private
 */
function _getContent(url) {
    if (!url || url === null) {
        return Promise.resolve(null)
    }

    return rp(url).then(function(res) {
        let base64 = new Buffer(res).toString('base64');
        return Promise.resolve(base64)
    }).catch(function(err) {
        log.info(`[LO_Indexer][_getContent] Could not get content from ${url}`, err);
        return Promise.resolve(null)
    });
}


module.exports = Object.create(loIndexer);
