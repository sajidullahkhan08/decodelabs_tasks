/**
 * =============================================================================
 * DECODELABS BACKEND — PROJECT REGISTRY
 * =============================================================================
 * Central registry for all four curriculum projects.
 * Each project is self-contained under projects/projectN-*/
 */

const project1 = require('./project1-rest-api');
const project2 = require('./project2-database');
const project3 = require('./project3-authentication');
const project4 = require('./project4-weather-api');

module.exports = {
  project1,
  project2,
  project3,
  project4,
  all: [project1, project2, project3, project4],
};
