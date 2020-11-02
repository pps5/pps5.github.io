'use strict';

const through = require('through2');

module.exports.meta = () => through.obj((file, encoding, callback) => {
    const contentsBuffer = file.contents;
    const metaStart = contentsBuffer.indexOf('---', 3);

    const metadata = contentsBuffer.toString('utf-8', 3, metaStart);
    file.title = metadata.match(/title: \"(.*)\"\n/)[1];
    file.createdDate = metadata.match(/created: (\d{4}\/\d{2}\/\d{2})/)[1];
    file.description = metadata.match(/description: (.*)\n/)[1];
    file.contents = contentsBuffer.slice(metaStart + 3);
    callback(null, file);
});
