'use strict';

const fs = require('fs').promises;
const path = require('path');

const { src, dest, parallel, series } = require('gulp');
const rename = require('gulp-rename');
const del = require('del');
const through = require('through2');

const { markdown, blogPostMarkdown } = require('./lib/markdown');
const { meta } = require('./lib/meta');
const { mustache, render } = require('./lib/mustache');

function clean(callback) {
    del([
        './index.html',
        './blog/**/*',
    ]).then(() => callback());
}

function generateBlog(callback) {
    let posts = [];
    src('md/blog/**/*.md')
        .pipe(meta())
        .pipe(blogPostMarkdown())
        .pipe(mustache(
            './templates/base.html',
            f => ({
                title: `${f.title} - pps5`,
                description: f.description,
                content: f.contents.toString()
            })
        ))
        .pipe(rename({ extname: '.html' }))
        .pipe(dest('./blog/'))
        .on('data', async (f) => posts.push({
            title: f.title,
            path: f.path,
            createdDate: f.createdDate
        }))
        .on('end', async () => {
            await generateBlogIndex(posts);
            callback();
        });
}

const generateBlogIndex = async (posts) => {
    const obj = posts.map(p => ({
        title: p.title,
        date: p.createdDate,
        url: `./blog/${path.basename(p.path)}`
    }));
    const contents = await render(
        './templates/index.html',
        {
            posts: obj,
            about: markdown(await fs.readFile('./md/about.md', 'utf-8')),
        }
    );
    const html = await render(
        './templates/base.html',
        { title: 'pps5', content: contents }
    );
    await fs.writeFile('./index.html', Buffer.from(html), 'utf-8');
};

exports.clean = clean;
exports.blog = generateBlog;
exports.default = series(
    clean,
    generateBlog
);
