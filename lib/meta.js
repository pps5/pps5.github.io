'use strict';

const through = require('through2');

module.exports.meta = () => through.obj((file, encoding, callback) => {
    const contentsBuffer = file.contents;
    const firstHeadingIndex = contentsBuffer.indexOf('#');

    const metadata = contentsBuffer.toString('utf-8', 0, firstHeadingIndex);
    file.createdDate = metadata.match(/created: (\d{4}\/\d{2}\/\d{2})/)[1];
    file.description = metadata.match(/description: (.*)\n/)[1];
    file.contents = contentsBuffer.slice(firstHeadingIndex);
    callback(null, file);
});