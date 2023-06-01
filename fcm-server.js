var admin = require("firebase-admin");
const prompt = require('prompt');


var serviceAccount = require("./my-transition-firebase-adminsdk-piec0-30edcad8d9.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 
"https://my-transition-default-rtdb.europe-west1.firebasedatabase.app"
});

// Start the prompt
prompt.start();

// Prompt for target selection
prompt.get({
  properties: {
    target: {
      description: 'Choose target(s):\n1. Send to all devices\n2. Send to specific device\n3. Send to topic',
      pattern: /^[1-3]$/,
      message: 'Please choose a valid target option.',
      required: true
    }
  }
}, (err, result) => {
  if (err) {
    console.error('Error occurred during prompt:', err);
    return;
  }

  const targetOption = parseInt(result.target);

  if (targetOption === 1) {
    // Send to all devices
    promptForMessage();
  } else if (targetOption === 2) {
    // Send to specific device
    promptForDeviceToken();
  } else if (targetOption === 3) {
    // Send to topic
    promptForTopic();
  } else {
    console.error('Invalid target option selected.');
  }
});

// Prompt for message title and body
function promptForMessage() {
  prompt.get(['title', 'body'], (err, result) => {
    if (err) {
      console.error('Error occurred during prompt:', err);
      return;
    }

    const message = {
      notification: {
        title: result.title,
        body: result.body
      }
    };

    srv_sendFCMMessage(message);
  });
}

// Prompt for device token
function promptForDeviceToken() {
  prompt.get({
    properties: {
      token: {
        description: 'Enter the device token:',
        required: true
      }
    }
  }, (err, result) => {
    if (err) {
      console.error('Error occurred during prompt:', err);
      return;
    }

    promptForMessageWithToken(result.token);
  });
}

// Prompt for topic
function promptForTopic() {
  prompt.get({
    properties: {
      topic: {
        description: 'Enter the topic name:',
        required: true
      }
    }
  }, (err, result) => {
    if (err) {
      console.error('Error occurred during prompt:', err);
      return;
    }

    promptForMessageWithTopic(result.topic);
  });
}

// Prompt for message title and body, and send to specific device
function promptForMessageWithToken(deviceToken) {
  prompt.get(['title', 'body'], (err, result) => {
    if (err) {
      console.error('Error occurred during prompt:', err);
      return;
    }

    const message = {
      notification: {
        title: result.title,
        body: result.body
      },
      token: deviceToken
    };

    srv_sendFCMMessage(message);
  });
}

// Prompt for message title and body, and send to topic
function promptForMessageWithTopic(topic) {
  prompt.get(['title', 'body'], (err, result) => {
    if (err) {
      console.error('Error occurred during prompt:', err);
      return;
    }

    const message = {
      notification: {
        title: result.title,
        body: result.body
      },
      topic: topic
    };

    srv_sendFCMMessage(message);
  });
}

// Send FCM message
function srv_sendFCMMessage(message) {
  if (message.topic) {
    // Send to topic
    admin.messaging().send(message)
      .then((response) => {
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.error('Error sending message:', error);
      });
  } else if (message.token) {
    // Send to specific device
    admin.messaging().send(message)
      .then((response) => {
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.error('Error sending message:', error);
      });
  } else if (message.condition) {
    // Send to devices matching a condition
    admin.messaging().send(message)
      .then((response) => {
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.error('Error sending message:', error);
      });
  } else {
    // Send to all devices
    admin.messaging().sendToTopic('allDevices', message)
      .then((response) => {
        console.log('Successfully sent message to all devices:', response);
      })
      .catch((error) => {
        console.error('Error sending message to all devices:', error);
      });
  }
}

function srv_sendMessage(message) {
  return new Promise(function(resolve, reject) {
    // Call the existing sendFCMMessage() function with the message
    srv_sendFCMMessage(message)
      .then(function(response) {
        // Message sent successfully
        resolve(response);
      })
      .catch(function(error) {
        // Failed to send message
        reject(error);
      });
  });
}

// Existing code in your JavaScript file

function sendFCMMessage(message) {
  // Your existing logic to send FCM messages
  console.log("Sending FCM message:", message);
  admin.messaging().sendToTopic('allDevices', message)
}

// New function to be called from index.html
function sendMessageFromHTML() {
  var target = document.getElementById("target").value;
  var title = document.getElementById("title").value;
  var body = document.getElementById("body").value;

  var message = {
    notification: {
      title: title,
      body: body
    }
  };

  if (target === "all") {
    // Send to all devices
    message.topic = "allDevices";
  } else if (target === "device") {
    // Send to specific device
    var deviceToken = prompt("Enter the device token:");
    message.token = deviceToken;
  } else if (target === "topic") {
    // Send to topic
    var topic = prompt("Enter the topic name:");
    message.topic = topic;
  }

  // Call the sendFCMMessage() function from your JavaScript file
  sendFCMMessage(message);
}


