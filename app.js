import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import webPush from 'web-push';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.set('views', path.resolve('views'));
app.set('view engine', 'pug');
app.use(morgan('dev'));
app.use(express.static('public'));

const vapid = {
  publicKey: '...',
  privateKey: '...',
};

webPush.setVapidDetails(
  'mailto:<email-address>',
  vapid.publicKey,
  vapid.privateKey
);

app.get('/', (req, res) => {
  res.render('index', { vapidPublicKey: vapid.publicKey });
});

// TODO: Persist subscriptions (e.g. to db)
const subscriptions = [];

app.post('/subscribe', (req, res) => {
  const sub = req.body;
  console.log('New subscription:', sub.endpoint);
  subscriptions.push(sub);
  res.status(200).end();
});

async function pushNotification(payload) {
  await Promise.all(subscriptions.map(async (sub) => {
    try {
      await webPush.sendNotification(sub, payload); // throws if not successful
    } catch (err) {
      console.log(sub.endpoint, '->', err.message);
      // TODO: Delete subscription (e.g. from db)
    }
  }));
}

// Send test notification every 10 seconds
setInterval(() => {
  pushNotification('This is a test notification!');
}, 10 * 1000);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on('SIGTERM', () => {
  process.exit();
});
