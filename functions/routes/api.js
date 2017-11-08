const firebase = require('firebase-admin');
const db = firebase.firestore();
const async = require('asyncawait/async');
const await = require('asyncawait/await');


module.exports.auth = (req, res, next) => {
	// Check for request token
	if(req.get('token')) {
		// Verify token
		firebase.auth().verifyIdToken(req.get('token'))
		.then(function(decodedToken) {
			// Verified user, add to res.locals for duration of request
			console.log("Verified token")
			res.locals.currentUser = decodedToken;
			return next();
		}).catch(function(error) {
			// Error processing token
			console.error("Invalid token");
			return next();
		})
		
	} else {
		// No User Signed In
		console.error("No user specified");
		return next();
	}
}


module.exports.getBatch = async ((req, res) => {
	if(!res.locals.currentUser) {
		return res.status(401).send({success: false, message: 'Error: invalid or missing user.' });
	}
	
	let userIndex;
	let uid = res.locals.currentUser.uid;
	let userDoc = await (db.collection('users').doc(uid).get());
	if(userDoc.exists) {
		console.log(userDoc.data());
		userIndex = userDoc.data().index;
	} else {
		db.collection('users').doc(uid).set({
			index: -1
		});
		
		userIndex = -1;
	}
	
	
	
	let mnistData = await (db.collection('mnist')
		.where('verified', '==', false)
		.where('hidden', '==', false)
		.where('index', '>', userIndex)
		.limit(10).get());
	
	let data = [];	
	mnistData.forEach((doc) => {
		let digit = doc.data();
		digit.id = doc.id;
		data.push(digit);
	});
	
	res.status(200).json({success: true, batch: data});
})

module.exports.verifyImage = async ((req, res) => {
	if(!res.locals.currentUser) {
		return res.status(401).send({success: false, message: 'Error: invalid or missing user.' });
	}
	
	let userIndex;
	let uid = res.locals.currentUser.uid;
	let userRef = db.collection('users').doc(uid);
	let userDoc = await (userRef.get());
	if(userDoc.exists) {
		userIndex = userDoc.data().index + 1;
		let userUpdate = await(userRef.set({
			index: userIndex
		}, {merge: true}));
	} else {
		return res.status(401).send({success: false, message: 'Error: invalid or missing user.' });
	}
	
	
	let mnist_id = req.body.mnist_id;
	let guess = Number(req.body.guess);
	let mnistRef = db.collection('mnist').doc(mnist_id)
	let mnistDoc = await(mnistRef.get());
	let mnistData = mnistDoc.data();
	

	
	if(guess == mnistData.label && mnistData.hidden == false) {
		
		mnistData.responses.push(guess);
		if(mnistData.responses.length == 2) {
			mnistData.verified = true;
			mnistData.hidden = true;
		}
		
	} else if(guess != mnistData.label && mnistData.hidden == false) {
		
		mnistData.investigate = true;
		mnistData.responses.push(guess);
		if(mnistData.responses.length == 5) {
			mnistData.hidden = true;
		}
	}
	
	let mnistUpdate = mnistRef.set({
		hidden: mnistData.hidden,
		investigate: mnistData.investigate,
		verified: mnistData.verified,
		responses: mnistData.responses
		
	}, { merge: true });
	
	res.status(200).send({success: true, status: 'request received'});
})