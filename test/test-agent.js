require('./helpers');
var Agent = require('remoteagent-protocol').Agent;

var a = new Agent({
	add: function (a, b, callback) {
		callback(a + b);
	}
});
var b = new Agent();
process.nextTick(testFakeTransport)

expect("test1");
function testFakeTransport() {
	fulfill("test1");
	console.log("Testing fake transport");
	var pair = require('../lib/fake-transports')("A", "B", true);
	expect("connect AB");
	a.attach(pair.A, function (AB) {
		fulfill("connect AB");
		console.log("A is connected to B!");
	});
	expect("connect BA");
	b.attach(pair.B, function (BA) {
		fulfill("connect BA");
		console.log("B is connected to A!");
		expect("result");
		BA.add(1, 2, function (result) {
			fulfill("result");	
			console.log("Result", result);
			assert.equal(result, 3);
			testSocketTransport();
		});
	});
}

expect("alldone");
expect("test2");
function testSocketTransport() {
	console.log("Test 2 using real tcp server");
	fulfill("test2");
	var net = require('net');
	var socketTransport = require('remoteagent-protocol/lib/socket-transport');
	expect("connect1");
	var server = net.createServer(function (socket) {
		fulfill("connect1");
		socket.on('data', function (chunk) {
			console.log("B->A (%s):", chunk.length, chunk);
		});
		expect("connectAB");
		a.attach(socketTransport(socket), function (AB) {
			fulfill("connectAB");
			console.log("A is connected to B!");
		});
		console.log("connection");
	});
	server.listen(function () {
		var port = server.address().port;
		expect("connect2");
		var socket = net.connect(port, function () {
			fulfill("connect2");
			expect("connectBA");
			b.attach(socketTransport(socket), function (BA) {
				fulfill("connectBA");
				console.log("B is connected to A!");
				expect("result2");
				BA.add(1, 2, function (result) {
					fulfill("result2");
					console.log("Result", result);
					assert.equal(result, 3);
					socket.end();
					server.close();	
					fulfill("alldone");
				});
			});
		});
		socket.on("data", function (chunk) {
			console.log("A->B (%s):", chunk.length, chunk);
		});
	});
}
