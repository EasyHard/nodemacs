var PromisedStream = require('./promised_stream');
var JsonStream = require('./json_parse_stream');
var json = new JsonStream();
var promised = new PromisedStream(json);

process.stdin.pipe(json);

function streamConsumer() {
    var p = promised.read();
    p.then(function (value) {
        console.log(value);
        streamConsumer();
    }).fail(function (reason) {
        console.log(reason);
    }).done();
}
streamConsumer();