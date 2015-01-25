#!/usr/bin/node

var JsonParseStream = require('./json_parse_stream');
var parse = new JsonParseStream();
var vm = require('vm');
process.stdin.pipe(parse);

function putMessage(object, cb) {
    var str = JSON.stringify(object) + "\n";
    process.stdout.write(str, 'utf-8', cb);
}

function sum() {
    var s = 0;
    for (var i = 0; i < arguments.length - 1; i++)
      s += arguments[i];
    arguments[arguments.length - 1](null, s);
}

function callfuncHandler(object, cb) {
    var funcname = object.funcname;
    var args = object.args;
    try {
        eval(funcname).apply(undefined, args.concat(cb));
    } catch (e) {
        cb(e);
    }
}

function unknwonType(object, cb) {
    cb("Unknown type");
}

var handlers = {
    callfunc: callfuncHandler,
    default: unknwonType
};

function handleMessage(object) {
    parse.pause();
    var handler = handlers[object.type];
    if (typeof handler === "undefined") {
        handler = handlers.default;
    }
    handler(object, function (err, value) {
        console.log(arguments);
        if (err) {
            putMessage({error: err.toString(), originCommand: object});
        } else {
            putMessage({value: value, originCommand: object});
        }
        parse.resume();
    });
}

parse.on('data', handleMessage);
parse.on('error', function (err) {
    console.error(err);
})