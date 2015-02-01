function nDone(n, done) {
    return function(err) {
      if (err)
        return done(err);
      n--;
      if (n == 0)
        return done();
    };
}

module.exports.nDone = nDone;
