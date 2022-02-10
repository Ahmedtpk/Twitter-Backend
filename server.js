const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const {
  getTweets,
  createTweet,
  getTweetsByUsername,
  getUserByUsername,
  getTweetsById,
} = require('./services/database');

const port = 3333;
const secret = 'mysecret1234';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send({ message: 'Hello from Twitter API!' })
});

app.get('/tweets', async (req, res) => {
  const tweets = await getTweets();
  res.send(tweets);
});

// app.get('/tweets/:id', async (req, res) => {
//   const { id } = req.params;
//   const tweets = await getTweetsById(id);
//   res.send(tweets);
// });

app.get('/tweets/:username', async (req, res) => {
  const { username } = req.params;
  const tweets = await getTweetsByUsername(username);
  res.send(tweets);
});





app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await getUserByUsername(username);

    if (!user) {
      return res
      .status(401)
      .send({ error: 'Invalid username' });
    }
  
    if (password !== user.password) {
      return res
      .status(401)
      .send({ error: 'Wrong password' });
    }
  
    const token = jwt.sign({
      id: user.id,
      username: user.username,
      name: user.name,
    }, Buffer.from(secret, 'base64'));
  
    res.send({ token });
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
});

app.get('/session', async (req, res) => {
  const token = req.headers['x-auth-token'];

  try {
    const payload = jwt.verify(token, Buffer.from(secret, 'base64'));
    res.send({ message: `You are authenticated as ${payload.username}` })
  } catch (error) {
    res.status(401).send({
      error: 'Invalid token',
    });
  }
});



app.post('/tweets/:userId', async (req, res) => {
  const token = req.headers['x-auth-token'];
    try {
    const payload = jwt.verify(token, Buffer.from(secret, 'base64'));
    const { message } = req.body;
    const { userId } = req.params;
    const newTweet = await createTweet(message, userId);
    console.log(userId)
    res.send(newTweet);
    
    
  } catch (error) {
    res.status(401).send({
      error: 'Invalid token, can not post tweet',
    });
  }
 
});

// app.post('/tweets/:userId', async (req, res) => {
//   const { message } = req.body;
//   const { userId } = req.params;
//   const newTweet = await createTweet(message, userId);
//   res.send(newTweet);
// });


app.listen(port, () => {
  console.log(`Twitter API listening on port ${port}`)
});