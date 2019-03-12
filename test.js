'use strict';

import test from 'ava';
import fs from 'fs';
import path from 'path';
import gutil from 'gulp-util';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import vulcanize from 'gulp-vulcanize';
import crisper from './';

function copyTestFile(src, dest) {
  fs.writeFileSync(dest, fs.readFileSync(src, 'utf8'));
}

test.beforeEach.cb((t) => {
  rimraf.sync('tmp');
  mkdirp.sync('tmp/dist');

  copyTestFile('fixture/index.html', path.join('tmp', 'index.html'));
  copyTestFile('fixture/import.html', path.join('tmp', 'import.html'));

  const stream = vulcanize();

  stream.on('data', function(file) {
    fs.writeFileSync(path.join('tmp', 'vulcanize.html'), file.contents);
  });

  stream.on('end', t.end);

  stream.write(new gutil.File({
    cwd: __dirname,
    base: path.join(__dirname, 'tmp'),
    path: path.join('tmp', 'index.html'),
    contents: fs.readFileSync(path.join('tmp', 'index.html'))
  }));

  stream.end();
});

test.cb('simple-usage', (t) => {
  const stream = crisper();

  stream.on('data', function(file) {
    const contents = file.contents.toString();
    const rex = {
      js: /Polymer\({/,
      html: /<script src=\"vulcanize.js\".*><\/script>/
    };

    if (/\.html$/.test(file.path)) {
      t.true(rex.html.test(contents));
    } else if (/\.js$/.test(file.path)) {
      t.true(rex.js.test(contents));
    } else {
      t.pass();
    }
  });

  stream.on('end', t.end);

  stream.write(new gutil.File({
    cwd: __dirname,
    base: path.join(__dirname, 'tmp'),
    path: path.join('tmp', 'vulcanize.html'),
    contents: fs.readFileSync(path.join('tmp', 'vulcanize.html'))
  }));

  stream.end();
});

test.cb('options test: scriptInHead', (t) => {
  const stream = crisper({
    scriptInHead: Boolean
  });

  stream.on('data', function(file) {
    const contents = file.contents.toString();

    if (/\.html$/.test(file.path)) {
      t.true(/defer=/g.test(contents));
    }
  });

  stream.on('end', t.end);

  stream.write(new gutil.File({
    cwd: __dirname,
    base: path.join(__dirname, 'tmp'),
    path: path.join('tmp', 'vulcanize.html'),
    contents: fs.readFileSync(path.join('tmp', 'vulcanize.html'))
  }));

  stream.end();
});

test.cb('options test: onlySplit', (t) => {
  const stream = crisper({
    onlySplit: Boolean
  });

  stream.on('data', function(file) {
    const contents = file.contents.toString();

    if (/\.html$/.test(file.path)) {
      t.true(!/<script/.test(contents));
    }
  });

  stream.on('end', t.end);

  stream.write(new gutil.File({
    cwd: __dirname,
    base: path.join(__dirname, 'tmp'),
    path: path.join('tmp', 'vulcanize.html'),
    contents: fs.readFileSync(path.join('tmp', 'vulcanize.html'))
  }));

  stream.end();
});

test.cb('options test: jsFileName', (t) => {
  const stream = crisper({
    jsFileName: 'script/new-script.js'
  });

  stream.on('data', function(file) {
    const contents = file.contents.toString();

    if (/\.html$/.test(file.path)) {
      t.true(/script\/new-script.js/.test(contents));
    }
  });

  stream.on('end', t.end);

  stream.write(new gutil.File({
    cwd: __dirname,
    base: path.join(__dirname, 'tmp'),
    path: path.join('tmp', 'vulcanize.html'),
    contents: fs.readFileSync(path.join('tmp', 'vulcanize.html'))
  }));

  stream.end();
});
