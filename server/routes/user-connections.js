const router = require('express').Router();
const connections = require('../models/connections.js');
const UserConnection = require('../models/UserConnection.js');
const user = require('../models/User.js');
const mustBeAdmin = require('../middleware/must-be-admin.js');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const sendError = require('../lib/sendError');

function removePassword(connection) {
  connection.password = '';
  return connection;
}

router.get('/api/user-connections', mustBeAuthenticated, async function(
  req,
  res
) {
  try {
    const userConnections = await UserConnection.findAllByUserId(req.user._id);
    const ids = userConnections.map(item => item.connectionId);
    const docs = await connections.findAllByIds(ids);

    return res.json({
      userConnections: docs.map(removePassword)
    });
  } catch (error) {
    sendError(res, error, 'Problem querying user connection database');
  }
});

router.get('/api/user-connections/:_id', mustBeAuthenticated, async function(
  req,
  res
) {
  try {
    const userConnections = await UserConnection.findAllByUserId(
      req.params._id
    );
    const ids = userConnections.map(item => item.connectionId);
    const docs = await connections.findAllByIds(ids);

    return res.json({
      userConnections: docs.map(removePassword)
    });
  } catch (error) {
    sendError(res, error, 'Problem querying user connection database');
  }
});

router.post('/api/user-connections/:_id', mustBeAdmin, async function(
  req,
  res
) {
  try {
    let cnt = await UserConnection.removeAllByUserId(req.params._id);

    if (req.body.connectionIds) {
      req.body.connectionIds.map(item => {
        let uc = new UserConnection({
          userId: req.params._id,
          connectionId: item
        });
        uc = uc.save();
      });
    }
    return res.json({ result: 'success' });
  } catch (error) {
    sendError(res, error, 'Problem saving connection');
  }
});

module.exports = router;
