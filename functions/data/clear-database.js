const async = require('asyncawait/async');
const await = require('asyncawait/await');
const firebase = require('firebase-admin');

const serviceAccount = require('./piper-test-0bf738005a39.json');

firebase.initializeApp({
	credential: firebase.credential.cert(serviceAccount),
});

const db = firebase.firestore();


// Clear database
var clearData = async ((collection) => {
	var data = await(db.collection(collection).limit(10).get());
	
	// Database is cleared
	if(data.size === 0) {
		return console.log('Database cleared');
	}
	
	// Delete documents in a batch
	var batch = db.batch();
	data.docs.forEach((doc) => {
		batch.delete(doc.ref);
	})
	
	var deletedData = await(batch.commit());
	console.log('deleted batch size: ', data.size);
	
	// Recurse on the next process tick, to avoid
  // exploding the stack.
	process.nextTick(() => {
		clearData(collection);
	})
	
});

clearData('mnist');
