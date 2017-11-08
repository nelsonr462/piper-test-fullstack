import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as firebase from 'firebase';
import * as request from 'superagent';

window.firebase = firebase;

// Initialize firebase
var config = {
  apiKey: "AIzaSyAWbIfzWEjuLAuKTXPmyy8EoQTfGrcBYP8",
  authDomain: "piper-test-d3845.firebaseapp.com",
  databaseURL: "https://piper-test-d3845.firebaseio.com",
  projectId: "piper-test-d3845",
  storageBucket: "piper-test-d3845.appspot.com",
  messagingSenderId: "287200331604"
};
firebase.initializeApp(config);

// REACT CLASSES
class Page extends React.Component {
	constructor(props) {
		super(props);
		this.state = { saveState: 'disabled', guess: '', currentIndex: 0, digits: props.batch };
		// this.digits = props.batch;
		
		this.handleChange = this.handleChange.bind(this);
		this.handleEnter = this.handleEnter.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}
	
	handleEnter(event) {
		if(event.key == "Enter" && this.state.saveState == '') {
			this.handleSubmit();
		}
	}
	
	handleChange(event) {
		let isValidGuess = (
			event.target.value.length < 6 &&
			event.target.value <= 60000 &&
			event.target.value >= 0
		);
		
		if( isValidGuess ) this.setState({guess: event.target.value});
		
		if( event.target.value != '' ) {
			this.setState({saveState: ''});
		} else {
			this.setState({saveState: 'disabled'});
		}
	}
	
	async handleSubmit() {
		this.setState({saveState: 'loading'});
		let response = await submitGuess(this.state.guess, this.state.digits[this.state.currentIndex].id)
		
		console.log(response);
		console.log('target: ', this.state.digits[this.state.currentIndex].id);
		drawDigit(this.state.digits[this.state.currentIndex + 1].image);
		
		if(this.state.digits.length - this.state.currentIndex < 4) {
			let data = await getBatch();
			if(!data.success) {
				return alert('Additional MNIST data could not be retrieved');
			}
			
			this.setState({ digits: [...new Set([...this.state.digits, ...data.batch])] });
			console.log
			
		}
		
		this.setState({saveState: '', guess: '', currentIndex: this.state.currentIndex + 1});
	}
	
	
	componentDidMount() {
		drawDigit(this.state.digits[this.state.currentIndex].image);
	}
	
	render() {
		
		let buttonClasses = "btn btn-primary input-group-btn btn-lg "

		return(
			<div className="container grid-xl main">
				<div className="columns">
					{/* HEADER */}
					<div className="col-12">
						<p>Please submit the number that you see displayed below.</p>
					</div>
					{/* DIGIT ROW */}
					<div className="col-12">
						{/* CANVAS */}
						<canvas id="canvas" width="280" height="280"></canvas>
					</div>
					
					{/* FORM ROW */}
					<div className="col-12">
						<div className="container grid-xs verification-form">
							<div className="input-group">
								
								{/* INPUT */}
								<input
									onChange={this.handleChange}
									onKeyPress={this.handleEnter}
									className="form-input input-lg"
									value={this.state.guess}
									placeholder="Enter your guess here"
									max="60000"
									type="number" 
								/>
								
								
								{/* SUBMIT BUTTON*/}
								<button 
									className={buttonClasses + this.state.saveState}
									onClick={this.handleSubmit}
								>
									Submit
								</button>
								
							</div>
						</div>
							
					</div>
				</div>
			</div>
		);
	}
}

// /REACT CLASSES


// SIGN IN USER
window.addEventListener('load', async ()=> {
	firebase.auth().signInAnonymously().catch((error) => {
		console.log("Error creating user session: ", error);
		alert("Could not log user in.")
	});
});

// ON USER, FETCH DATA AND RENDER
firebase.auth().onAuthStateChanged( async (user) => {
	console.log(user.uid);
	let data = await getBatch();
	if(data.success == false) {
		return alert('MNIST data could not be fetched.');
	}
	
	document.querySelector('.loader').classList.add('hidden');
	
	ReactDOM.render(
		<Page
			batch={data.batch}
		/>,
		document.getElementById('root')
	);
});


	
// DRAW MNIST ON CANVAS
function drawDigit(digit, offsetX, offsetY) {
	let canvas = document.getElementById('canvas');
	let context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	for( var i = 0; i < 28; i++) {
		for( var j = 0; j < 28; j++) {
			context.fillStyle = `rgba(0, 0, 0, ${1 - digit[(28 * i) + j]})`;
			context.fillRect(j*10, i*10, 10, 10);
		}
	}
}

// FETCH BATCH FROM API
async function getBatch() {
	let authToken = await firebase.auth().currentUser.getIdToken(false);
	let data = await request
		.get('/api/getBatch')
		.set('token', authToken)
		// .query({ token: authToken })
	
	let response;
	try {
		response = JSON.parse(data.text);
		console.log('mnist data: ', response);
	} catch(error) {
		response = error;
		response.success = false;
	}
	
	return response;
}

// SUBMIT GUESS
async function submitGuess(guess, mnist_id) {
	let authToken = await firebase.auth().currentUser.getIdToken(false);
	let data = await request
		.post('/api/verifyImage')
		.set('token', authToken)
		.send({ guess: guess, mnist_id: mnist_id })
		
	
	let response;
	try {
		response = JSON.parse(data.text);
		console.log('post response: ', response);
	} catch(error) {
		response = error;
		response.success = false;
	}
	
	return response;
}