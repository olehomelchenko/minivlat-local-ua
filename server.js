const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'src')));

let responses = [];

// Endpoint to store responses
app.post('/api/responses', (req, res) => {
    const response = req.body;
    responses.push(response);
    fs.writeFileSync('data/responses.json', JSON.stringify(responses, null, 2));
    console.log('Received response:', response);

    // Redirect payload to webhook
    if (WEBHOOK_URL) {
        console.log("sending to ", WEBHOOK_URL);
        axios.post(WEBHOOK_URL, JSON.stringify(response), {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(() => {
            console.log('Payload sent to webhook successfully');
        })
        .catch((error) => {
            console.error('Error sending payload to webhook:', error);
        });
    }

    res.status(201).json({ success: true, message: 'Response stored successfully' });
});

// Endpoint to retrieve questions
app.get('/api/questions', (req, res) => {
    const questionsPath = path.join(__dirname, 'src', 'data', 'questions.json');
    fs.readFile(questionsPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading questions');
        }
        res.json(JSON.parse(data));
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});