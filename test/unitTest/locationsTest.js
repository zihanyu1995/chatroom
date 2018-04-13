const expect = require('expect.js');
const Locations = require('../../models/Locations');
const Container = require('../../models/container');

const locations = new Locations();
let req;

suite('Model Locations Test:', () => {
  setup(() => {
    req = { app: { locals: { container: new Container() } }, session: {} };
  });

  test('insert a location post with proper starting time and ending time', (done) => {
    req.body = { userID: 1, title: 'Provide food', content: 'Pizza', startTime: '11/17/2017', endTime: '11/27/2027', currentTime: '1510770599179', role: 0, longitude: 100, latitude: 100 };
    locations.insertLocation(req, (status) => {
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('get all locations', (done) => {
    locations.getLocations(req, (status, result) => {
      expect(result.length).to.be.equal(1);
      expect(result[0].title).to.be.eql('Shelter with beds & comforters');
      expect(status).to.be.equal(200);
      done();
    });
  });

});
