const express = require('express');
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const bodyParser = require('body-parser');
const firebase = require('firebase-admin');
const functions = require('firebase-functions');

const firebaseApp = firebase.initializeApp(
	functions.config().firebase
);

const db = firebase.firestore();
const app = new express();
app.use(bodyParser.json());

const routes = {
	api: require('./routes/api.js')
}

// Fetch MNIST images
app.get('/api/getBatch', routes.api.auth, routes.api.getBatch);

// Send MNIST verification data
app.post('/api/verifyImage', routes.api.auth, routes.api.verifyImage);

exports.app = functions.https.onRequest(app);

