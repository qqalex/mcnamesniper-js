const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const fs = require('fs').promises;
require('dotenv').config();

const proxy = process.env.PROXY_AUTH;
const targetUrl = process.env.ENDPOINT;

console.log(proxy, targetUrl)

const agent = new HttpsProxyAgent(proxy);

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

function _generateConfigs(bearerTokens, username, targetUrl, agent) {
	const configArray = [];
	for (const token of bearerTokens) {
		const config = {
			method: 'POST',
			url: targetUrl,
			httpAgent: agent,
			httpsAgent: agent,
			responseType: 'stream', // to avoid buffering the response
			headers: {
			'Authorization': `Bearer ${token}`,
			'profileName': `${username}`
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
	const configs = _generateConfigs(bearerTokens, username, targetUrl, agent);

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
