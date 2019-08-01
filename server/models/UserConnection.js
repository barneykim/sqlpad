const Joi = require('joi');
const db = require('../lib/db.js');

const schema = {
  _id: Joi.string().optional(), // will be auto-gen by nedb
  userId: Joi.string().required(),
  connectionId: Joi.string().required(),
  createdDate: Joi.date().default(new Date(), 'time of creation')
};

function UserConnection(data) {
  this._id = data._id;
  this.userId = data.userId;
  this.connectionId = data.connectionId;
  this.createdDate = data.createdData;
}

UserConnection.prototype.save = function save() {
  const self = this;
  return Promise.resolve().then(() => {
    const joiResult = Joi.validate(self, schema);
    if (joiResult.error) {
      return Promise.reject(joiResult.error);
    }

    const newDoc = db.userConnections.insert(joiResult.value);
    return UserConnection.findOneById(newDoc._id);
  });
};

/*  Query methods
============================================================================== */
UserConnection.findAllByUserId = userId =>
  db.userConnections
    .find({ userId: userId })
    .then(docs => docs.map(doc => new UserConnection(doc)));

UserConnection.findOneById = id =>
  db.userConnections
    .findOne({ _id: id })
    .then(doc => doc && new UserConnection(doc));

UserConnection.removeAllByUserId = userId =>
  db.userConnections.remove({ userId: userId }, { multi: true });

UserConnection.removeAllByConnectionId = connectionId =>
  db.userConnections.remove({ connectionId: connectionId }, { multi: true });

module.exports = UserConnection;
