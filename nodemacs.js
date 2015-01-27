#!/usr/bin/node

var Q = require('q');

Function.prototype.ubind = function ubind() {
    var args = Array.prototype.slice.call(arguments);
    return this.bind.apply(this, [undefined].concat(args));
}
var JsonParseStream = require('./json_parse_stream');
var parse = new JsonParseStream();
var elisp = {
    callfunc: function callfunc() {
        var args = Array.prototype.slice.call(arguments);
        var funcname = args.shift();
        return putMessage({
            type: "callfunc",
            name: funcname,
            args: args
        });
    }
}
process.stdin.pipe(parse);

function putMessage(object) {
    var str = JSON.stringify(object) + "\n";
    return Q.ninvoke(process.stdout, "write", str, 'utf-8');
}

function sum() {
    var s = 0;
    for (var i = 0; i < arguments.length; i++)
      s += arguments[i];
    return s;
}

function createBufferAndInsert(buffername, text, cb) {
    return elisp.callfunc("generate-new-buffer", "testbuffer")
           .then(elisp.callfunc.bind(undefined, "set-buffer", "testbuffer"))
           .then(elisp.callfunc.bind(undefined, "insert", text))
           .nodeify(cb);
}

function callfuncHandler(object) {
    var funcname = object.funcname;
    var args = object.args;
    var result = eval(funcname).apply(undefined, args);
    return result;
}

function unknwonType(object) {
    return Q.reject("Unknown type");
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
    Q.promised(handler)(object).then(
      function (value) {
          return putMessage({value: value, originCommand: object});
      },
      function (err) {
          return putMessage({error: err.toString(), originCommand: object});
      })
    .fin(function (value) {
        parse.once('data', handleMessage);
        parse.resume();
    }).done();
}

parse.once('data', handleMessage);
parse.on('error', function (err) {
    console.error(err);
})
