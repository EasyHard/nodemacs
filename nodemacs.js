#!/usr/bin/node

var Q = require('q');
var PromisedStream = require('./promised_stream');
var JsonParseStream = require('./json_parse_stream');
var parse = new JsonParseStream();
var promisedReader = new PromisedStream(parse);
process.stdin.pipe(parse);

var elisp = {
    callfunc: function callfunc(funcname, arg0, arg1) {
        var args = Array.prototype.slice.call(arguments);
        var funcname = args.shift();
        return putMessage({
            type: "callfunc",
            name: funcname,
            args: args
        }).then(promisedReader.read);
    },
    eval: function eval(stream) {
      var self = this;
      var p = stream.read();
      return p.then(handleMessage)
              .then(self.eval.bind(self, stream))
              .fail(function (reason) {
                if (reason === null)
                  return Q('well done!');
                else
                  return Q.reject(reason);
              });
    }
}


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

function createBufferAndInsert(buffername, text) {
    return elisp.callfunc("generate-new-buffer", "testbuffer")
           .then(elisp.callfunc.bind(elisp, "set-buffer", "testbuffer"))
           .then(elisp.callfunc.bind(elisp, "insert", text));
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
    var handler = handlers[object.type];
    if (typeof handler === "undefined") {
        handler = handlers.default;
    }
    return Q.promised(handler)(object).then(
      function (value) {
          return putMessage({value: value, originCommand: object});
      },
      function (err) {
          return putMessage({error: err.toString(), originCommand: object});
      });
}

elisp.eval(promisedReader);