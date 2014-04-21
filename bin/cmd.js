var readdirp = require('readdirp'), path = require('path'), es = require('event-stream');
var fs = require('graceful-fs');
var argv = require('optimist')
    .argv;

// print out all JavaScript files along with their size

var leaky = require('../leaky');

var input = argv._[0];
var stream = readdirp({
        root : path.join(input),
        fileFilter : '*.js'
    });
stream
.on('warn', function (err) {
    console.error('non-fatal error', err);
    // optionally call stream.destroy() here in order to abort and cause 'close' to be emitted
})
.on('error', function (err) {
    console.error('fatal error', err);
})
.pipe(es.mapSync(function (entry) {
        return {
            path : entry.path,
            fullPath : entry.fullPath,
            size : entry.stat.size
        };
    }))
.on('data', function (entry) {
    var fileName = entry.fullPath;

    fs.readFile(path.resolve(fileName), 'utf8', function (err, str) {
        if (err)
            throw err;

        var err = leaky(str, fileName);
        if (err) {
            console.log(err);
        }
    });
});
