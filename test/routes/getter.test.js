const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app').server;
let should = chai.should();

chai.use(chaiHttp);

describe('Getter controller', function () {
    describe('getPerfiles function', function () {
        it('Should error if no array with the profiles ', function (done) {
            chai.request(server).get('/profiles').end((err, res) => {
                res.should.have.status(200);
                chai.expect(res.body).to.eql(['PERSONA FÍSICA', 'PERSONA JURÍDICA']);
                done();
            })
        });
    });
});