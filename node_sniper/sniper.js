// Closed source, do not distribute
// Sniper for internal "Quick Brown Fox" API
// Written by Alex "qqalex" of Minecat.NET

require('dotenv').config();

const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');


class Env {
	constructor(username) {
		this.username = username;
		this.proxy = process.env.PROXY_AUTH;
		this.targetUrl = process.env.ENDPOINT;
		this.agent = new HttpsProxyAgent(this.proxy);
	}
}


async function _sendRequest(config) {
	try {
		const request = axios(config);

		// Cancel the request after it has been sent without waiting for the response
		request.then(() => {
			request.cancel();
		});

	}
	catch (error) {
		console.error('Error sending request:', error);
	}
}

async function _sendRequestAwait(config) {
	try {
		const response = await axios(config);
		return response;
	} 
	catch (error) {
		console.error('Error sending request:', error);
	}
}

function _generateConfigs(bearerTokens, username) {
	Environment = new Env(username);
	const configArray = [];
	for (const token of bearerTokens) {
		const config = {
			method: 'POST',
			url: Environment.targetUrl,
			httpAgent: Environment.agent,
			httpsAgent: Environment.agent,
			responseType: 'stream', // to avoid buffering the response
			headers: {
				'Authorization': `Bearer ${token}`,
				'profileName': `${this.usernaem}`
			}
		};
		configArray.push(config);
	}
	return configArray;
}

function _start(startTime) {
	const now = Date.now() / 1000;
	if (now >= startTime) {
		return 0;
	}
	else {
		return 1;
	}
}

function _stop(endTime) {
	const now = Date.now() / 1000;
	if (now <= endTime) {
		return 1;
	}
	else {
		return 0;
	}
}

async function snipe(username, bearerTokens, startTime, endTime) {
	
	const configs = _generateConfigs(bearerTokens, username);

	// start the snipe
	let y = 1;
	while (y) {
		let y = _start(startTime);
	}

	// send the requests
	let x = 1;
	while (x) {
		for (const config of configs) {
			_sendRequest(config);
		}
		let x = _stop(endTime);
	}
}

// username, bearerTokens, startTime, endTime
snipe(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);
