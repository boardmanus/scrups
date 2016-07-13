/*
 * grunt-screeps
 * https://github.com/screeps/grunt-screeps
 *
 * Copyright (c) 2015 Artem Chivchalov
 * Licensed under the MIT license.
 */

'use strict';

const privateOptions = require(`${__dirname}/.private`);

module.exports = function (grunt) {
    // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        'src/*.js',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Configuration to be run (and then tested).
    screeps: {
      options: privateOptions,
      dist: {
        src: ['src/*.js'],
      },
    },

    scrups: {
      options: privateOptions,
      pull: {
        dest: 'src',
      },
    },
  });

    // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-screeps');
};
