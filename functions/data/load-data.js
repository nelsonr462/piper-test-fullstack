const mnist = require('mnist');
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const firebase = require('firebase-admin');
const serviceAccount = require('./piper-test-0bf738005a39.json');

firebase.initializeApp({
	credential: firebase.credential.cert(serviceAccount),
});

const db = firebase.firestore();


// Get 100 test images (10 for each digit 0-9)
var mnist_data = [];

// i tracks label
for(var i = 0; i < 10; i++ ) {
	// j tracks sample index.
	for(var j = 0; j < 10; j++) {
		var data = {};
		
		// Add label
		data.label = i;
		// Database index
		// data.index = (10*i) + j; // Will put all images in order
		// Retrieve mnist data
		data.image = mnist[i].get(); // will retrieve random sample in mnist dataset
		//data.image = mnist[i].get(j);  // will retrieve jth sample in mnist dataset
		
		// Add to data array
		mnist_data.push(data);
	}
}

// Load into database
var saveImage = async ((data, index) => {
	let addImage = await(db.collection('mnist').add({
		// index: data.index,
		index: index,
		image: data.image,
		label: data.label,
		verified: false,
		hidden: false,
		investigate: false,
		responses: []
	}));
	
	console.log('Added document with ID: ', addImage.id);
})


let indices = Array.apply(null, {length: 100}).map(Function.call, Number);
//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [rev. #1]
function shuffle(v) {
  for (var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
  return v;
};

indices = shuffle(indices);

for(var k = 0; k < mnist_data.length; k++ ){
	saveImage(mnist_data[k], indices[k]);
	// saveImage(mnist_data[k]);
}
