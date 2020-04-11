'use strict';

const fs = require('fs').promises;
const mustache = require('mustache');
const through = require('through2');
const PluginError = require('plugin-error');

async function render(templatePath, obj) {
    const template = fs.readFile(templatePath, 'utf-8');
    return mustache.render(await template, obj);
}

module.exports.mustache = (templatePath, generator) =>
    through.obj(async (file, encoding, callback) => {
        try {
            file.contents = Buffer.from(
                await render(templatePath, generator(file))
            );
            callback(null, file);
        } catch (e) {
            console.error(e);
            callback(new PluginError('mustache', e, { fileName: file.path }));
        }
    });

module.exports.render = render;