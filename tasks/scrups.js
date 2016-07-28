/*
* grunt-screeps
* https://github.com/screeps/grunt-screeps
*
* Copyright (c) 2015 Artem Chivchalov
* Licensed under the MIT license.
*/

'use strict';

var path = require('path'),
  https = require('https'),
  util = require('util');

module.exports = function (grunt) {
  grunt.registerMultiTask('scrups', 'A Grunt plugin for gettign code from your Screeps account', function () {
    var options = this.options({});
    var modules = {};
    var done = this.async();

    if (!this.files) {
      grunt.log.error('No file specified! (' + this.files + ')');
      done();
      return;
    }

    if (this.files.length !== 1) {
      grunt.log.error('Expected one destination file to be specified!');
      done();
      return;
    }

    this.files.forEach(function (f) {
      if (!grunt.file.exists(f.dest)) {
        grunt.log.error('No files found. Stopping.');
        done();
        return;
      }

      var req = https.get({
        hostname: 'screeps.com',
        port: 443,
        path: options.ptr ? '/ptr/api/user/code' : '/api/user/code',
        auth: options.email + ':' + options.password,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }, function (res) {
        res.setEncoding('utf8');

        var data = '';

        if (res.statusCode < 200 || res.statusCode >= 300) {
          grunt.fail.fatal('Screeps server returned error code ' + res.statusCode);
        }

        res.on('data', function (chunk) {
          data += chunk;
        });

        res.on('end', function () {
          try {
            var parsed = JSON.parse(data);
            if (parsed.ok) {
              var msg = 'Retrieved code from Screeps account "' + options.email + '"';
              if (options.branch) {
                msg += ' branch "' + options.branch + '"';
              }
              if (options.ptr) {
                msg += ' [PTR]';
              }
              msg += '.';
              grunt.log.writeln(msg);

              if (!parsed.modules) {
                grunt.log.error('Response data didnt have the modules: ' + util.inspect(parsed));
              }
              else {
                for (let file in parsed.modules) {
                  grunt.file.write(f.dest + '/' + file + '.js', parsed.modules[file]);
                }
              }
            }
            else {
              grunt.log.error('Error while commiting to Screeps: ' + util.inspect(parsed));
            }
          } catch (e) {
            grunt.log.error('Error while processing json: ' + e.message);
          }
          done();
        });
      });
    });
  });
};
