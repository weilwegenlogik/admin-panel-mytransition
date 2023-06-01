const fs = require('fs');
const historyFilePath = './message-history.txt';

function saveMessage(historyMessage) {
  fs.appendFile(historyFilePath, `${historyMessage}\n`, (err) => {
    if (err) {
      console.error('Failed to save message:', err);
    }
  });
}

function loadHistory() {
  return new Promise((resolve, reject) => {
    fs.readFile(historyFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Failed to load message history:', err);
        reject(err);
      } else {
        const messages = data.trim().split('\n');
        resolve(messages);
      }
    });
  });
}

module.exports = { saveMessage, loadHistory };
