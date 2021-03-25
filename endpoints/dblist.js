const { addVote, sendNotification, mongo } = require('../db');
const { StatsD } = require('node-dogstatsd');
const ddog = new StatsD();

module.exports = (app, config) =>
  app.post('/dblistwebhook', async (req, res) => {
    const [ auth, timestamp ] = req.headers['x-dbl-signature']
      ? req.headers['x-dbl-signature'].split(/\s+/)
      : [ null ];

    if (
      auth === config.dblcom_webhook_secret &&
      (Date.now() - 1000 * 120) < timestamp
    ) {
      const body = JSON.parse(req.body);
  
      await addVote(body.id, 20000, 'gift', 'normie', 1, true);
      await sendNotification(body.id, 'vote', 'Thank you for voting!', 'You just got your **`1 Gift for a Friend, 1 Normie Box, and 20k coins`** for voting on discordbotlist.com! (Extra 4k coins for supporting this growing site)');
      ddog.increment(`webhooks.dblcom`);
      res.status(200).send({ status: 200 });
    } else {
      res.status(401).send({ status: 401 });
    }
  });
