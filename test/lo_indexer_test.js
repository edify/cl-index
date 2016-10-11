/**
 * Created by diugalde on 26/09/16.
 */

const assert = require('assert');
const chai = require('chai');
const mockRequire = require('mock-require');
const sinon = require('sinon');
const sinonChai = require("sinon-chai");

const config = require('../lib/config');
const msgStatus = require('../lib/message_status');


// Configure chai
chai.should();
chai.use(sinonChai);

// Mock required dependencies.
var esClientMock = {
    index: function() {},
    update: function() {},
    delete: function() {}
};

var esMock = {
    Client: function() {return esClientMock}
};

var rpMock = function() {
    return Promise.resolve('PageContent')
};


mockRequire('../lib/log', {info(str) {}});
mockRequire('request-promise', rpMock);
mockRequire('elasticsearch', esMock);

// Require module that will be tested.
const loIndexer = require('../lib/lo_indexer');

// Shared variables.
var learningObject, learningObject2, fileUrl, loId, indexName, docType;

before(function() {
    loId = '47c98e93-1709-4455-8303-096098513c1d';

    learningObject = {
        id: loId,
        "name": "testLOName1",
        "title": "testLOTitle1",
        "url": "/learningObjects/57e19c35185e1e8c93db6f61",
        "contentUrl": "/learningObjects/57e19c35185e1e8c93db6f61/contents/57e19c35185e1e8c93db6f62/file/textandmaterials.html?refPath=57e19c35185e1e8c93db6f61/"
    };

    learningObject2 = {
        id: loId,
        "name": "testLOName1",
        "title": "testLOTitle1",
        "url": "/learningObjects/57e19c35185e1e8c93db6f61",
        "contentUrl": "/learningObjects/57e19c35185e1e8c93db6f61/contents/57e19c35185e1e8c93db6f62/file/textandmaterials.html?refPath=57e19c35185e1e8c93db6f61/",
        "externalUrl": "www.google.com"
    };

    fileUrl = 'www.google.com';

    indexName = config.elasticSearch.index;

    docType = config.elasticSearch.docType;
});

describe('Add learning object to ElasticSearch', function() {

    let indexMethod;

    beforeEach(function() {
        indexMethod = sinon.stub(esClientMock, 'index');
    });

    afterEach(function() {
         esClientMock.index.restore();
    });

    it('Inserts the learningObject in the ES index when the LearningObject does not have externalUrl', function(done) {
        let indexESObj = {
            index: indexName,
            type: docType,
            id: loId,
            body: JSON.parse(JSON.stringify(learningObject))
        };

        loIndexer.add(learningObject).then(function(res) {
            // Check methods invocation.
            indexMethod.should.have.been.calledOnce;
            indexMethod.should.have.been.calledWith(indexESObj);

            // The result should be PROCESSED.
            res.should.be.equal(msgStatus.PROCESSED);

            done()
        }).catch(function(err) {
            done(err)
        });
    });

    it('Inserts the learningObject in the ES index when the LearningObject has an externalUrl', function(done) {

        learningObject2.file = 'UGFnZUNvbnRlbnQ=';

        let indexESObj = {
            index: indexName,
            type: docType,
            id: loId,
            body: JSON.parse(JSON.stringify(learningObject2))
        };

        loIndexer.add(learningObject2).then(function(res) {
            // Check methods invocation.
            indexMethod.should.have.been.calledOnce;

            let indexArg = indexMethod.getCall(0).args[0];
            (JSON.stringify(indexArg)).should.be.equal(JSON.stringify(indexESObj));

            // The result should be PROCESSED.
            res.should.be.equal(msgStatus.PROCESSED);

            done()
        }).catch(function(err) {
            done(err)
        });
    });

    it('Returns FAILED status when there is an error while doing the request to ES', function(done) {

        indexMethod.returns(Promise.reject());

        loIndexer.add(learningObject).then(function(res) {
            // Check methods invocation.
            indexMethod.should.have.been.calledOnce;

            // The result should be FAILED.
            res.should.be.equal(msgStatus.FAILED);

            done()
        }).catch(function(err) {
            done(err)
        });
    });

});

describe('Remove learning object from ElasticSearch', function() {

    let deleteMethod;

    beforeEach(function() {
        deleteMethod = sinon.stub(esClientMock, 'delete');
    });

    afterEach(function() {
        esClientMock.delete.restore();
    });

    it('Removes the learning object successfully', function(done) {

        deleteMethod.returns(Promise.resolve());

        let removeESObj = {
            index: indexName,
            type: docType,
            id: loId
        };

        loIndexer.remove(loId).then(function(res) {
            // Check methods invocation.
            deleteMethod.should.have.been.calledOnce;
            deleteMethod.should.have.been.calledWith(removeESObj);

            // The result should be PROCESSED.
            res.should.be.equal(msgStatus.PROCESSED);

            done()
        }).catch(function(err) {
            done(err)
        });
    });

    it('Returns FAILED status when there is an error while doing the request to ES', function(done) {

        deleteMethod.returns(Promise.reject({status: 500}));

        loIndexer.remove(loId).then(function(res) {
            // Check methods invocation.
            deleteMethod.should.have.been.calledOnce;

            // The result should be FAILED.
            res.should.be.equal(msgStatus.FAILED);

            done()
        }).catch(function(err) {
            done(err)
        });
    });

    it('Returns PROCESSED status when the learningObject was already removed from ES', function(done) {

        deleteMethod.returns(Promise.reject({status: 404}));

        loIndexer.remove(loId).then(function(res) {
            // Check methods invocation.
            deleteMethod.should.have.been.calledOnce;

            // The result should be PROCESSED.
            res.should.be.equal(msgStatus.PROCESSED);

            done()
        }).catch(function(err) {
            done(err)
        });
    });

});

describe('Update learning object in ElasticSearch', function() {

    let updateMethod;

    beforeEach(function() {
        updateMethod = sinon.stub(esClientMock, 'update');
    });

    afterEach(function() {
        esClientMock.update.restore();
    });

    it('Updates the learningObject successfully when the fileUrl is null', function(done) {
        let updateESObj = {
            index: indexName,
            type: docType,
            id: learningObject.id,
            body: {doc: learningObject}
        };

        let updatedLO = {
            doc: JSON.parse(JSON.stringify(learningObject)),
            fileUrl: null
        };

        loIndexer.update(updatedLO).then(function(res) {
            // Check methods invocation.
            updateMethod.should.have.been.calledOnce;
            updateMethod.should.have.been.calledWith(updateESObj);

            // The result should be PROCESSED.
            res.should.be.equal(msgStatus.PROCESSED);

            done()
        }).catch(function(err) {
            done(err)
        });
    });

    it('Updates the learningObject successfully when the fileUrl is not null', function(done) {

        let updatedLO = {
            doc: learningObject2,
            fileUrl: fileUrl
        };

        learningObject2.file = 'UGFnZUNvbnRlbnQ=';

        let updateESObj = {
            index: indexName,
            type: docType,
            id: learningObject2.id,
            body: {doc: JSON.parse(JSON.stringify(learningObject2))}
        };

        loIndexer.update(updatedLO).then(function(res) {
            // Check methods invocation.
            updateMethod.should.have.been.calledOnce;
            updateMethod.should.have.been.calledWith(updateESObj);

            // The result should be PROCESSED.
            res.should.be.equal(msgStatus.PROCESSED);

            done()
        }).catch(function(err) {
            done(err)
        });
    });

    it('Returns FAILED status when there is an error while doing the request to ES', function(done) {

        updateMethod.returns(Promise.reject());

        let updatedLO = {
            doc: learningObject,
            fileUrl: fileUrl
        };

        loIndexer.update(updatedLO).then(function(res) {
            // Check methods invocation.
            updateMethod.should.have.been.calledOnce;

            // The result should be FAILED.
            res.should.be.equal(msgStatus.FAILED);

            done()
        }).catch(function(err) {
            done(err)
        });
    });

});
