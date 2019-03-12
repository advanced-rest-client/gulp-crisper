'use strict';
const path = require('path');
const Vinyl = require('vinyl');
const PluginError = require('plugin-error');
const through = require('through2');
const crisper = require('crisper');
const oassign = require('object-assign');

function splitFile(file, filename, contents) {
  return new Vinyl({
    cwd: file.cwd,
    base: file.base,
    path: path.join(path.dirname(file.path), filename),
    contents: new Buffer(contents)
  });
}

function getFilename(filepath) {
  const basename = path.basename(filepath, path.extname(filepath));
  return {
    html: basename + '.html',
    js: basename + '.js'
  };
}

module.exports = function(opts) {
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new PluginError({
        plugin: 'gulp-crisper',
        message: 'Streaming not supported'
      }));
      return;
    }

    const splitfile = getFilename(file.path);
    const split = crisper(oassign({}, {
      source: file.contents.toString(),
      jsFileName: splitfile.js
    }, opts));

    Object.keys(split)
      .forEach((type) => {
        if (split[type]) {
          this.push(splitFile(file, splitfile[type], split[type]));
        }
      });
    cb();
  });
};
