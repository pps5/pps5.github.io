'use strict';

const marked = require('marked');
const thorough = require('through2');
const PluginError = require('plugin-error');

const markdown = (contents, renderer) => {
    const options = {
        gfm: true,
        tables: true,
        langPrefix: ''
    };
    if (renderer) {
        options.renderer = renderer;
    }
    return marked(contents, options);
}

const aboutMdRenderer = () => {
    const r = new marked.Renderer();
    r.link = function(href, title, text) {
        let link = marked.Renderer.prototype
            .link
            .apply(this, arguments);
        return link.replace('<a', '<a target="_blank"');
    };
    return r;
};

const blogPostMdRenderer = (file, dateString) => {
    const r = new marked.Renderer();
    r.heading = (text, level, raw) => {
        if (level == 1) {
            file.title = text;
            return `
              <h${level}>${text}</h${level}>
              <div>${dateString}</div>`;
        } else {
            let anchor = raw.toLowerCase().replace(/[^\w]+/g, '-');
            return `
              <h${level}>
                <a name="${anchor}" class="dummy-anchor"></a>
                <a class="anchor" href="#${anchor}">
                  <i class="fa fa-link"></i>
                </a>
                ${text}
              </h${level}>`;
        }
    };
    return r;
};

module.exports.markdown = markdown;
module.exports.aboutMdRenderer = aboutMdRenderer;

module.exports.blogPostMarkdown = () => thorough.obj((file, encoding, callback) => {
    try {
        file.contents = Buffer.from(markdown(
            file.contents.toString(),
            blogPostMdRenderer(file, file.createdDate)
        ));
        callback(null, file);
    } catch (e) {
        callback(new PluginError('markdown', e, { fileName: file.path }));
    }
});
