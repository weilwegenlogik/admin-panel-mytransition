const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const { saveMessage, loadHistory } = require('./history');


// Initialize the Firebase Admin SDK with your service account credentials
const serviceAccount = require('./my-transition-firebase-adminsdk-piec0-30edcad8d9.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://my-transition-default-rtdb.europe-west1.firebasedatabase.app'
});

const app = express();
// Set CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
app.use(express.json());

// Define an API endpoint to handle FCM messages
app.post('/send-fcm-message', async (req, res) => {

    console.log('Received FCM message request:', req.body);
  // Extract the necessary data from the request
  const { target, title, body } = req.body;
  const historyMessage = `${title}: ${body}`;

  saveMessage(historyMessage);

  // Construct the FCM message
  const message = {
    notification: {
      title: title,
      body: body
    }
  };

  // Determine the target and set appropriate properties in the message
  if (target === 'all') {
    message.topic = 'allDevices';
  } else if (target === 'device') {
    const deviceToken = req.body.deviceToken;
    message.token = deviceToken;
  } else if (target === 'topic') {
    const topic = req.body.topic;
    message.topic = topic;
  }

    // Send the FCM message using the Firebase Admin SDK
    admin.messaging().send(message)
    .then((response) => {
    console.log('Message sent successfully:', response);
    res.status(200).json({ success: true });
    })
    .catch((error) => {
    console.error('Failed to send message:', error);
    res.status(500).json({ success: false, error: error.message });
    });

});

app.get('/message-history', async (req, res) => {
    try {
      const messages = await loadHistory();
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: error.historyMessage });
    }
});
  

// Start the server
app.listen(5500, () => {
  console.log('Server is running on port 5500');
});
