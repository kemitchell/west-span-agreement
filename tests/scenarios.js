var async = require('async');
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var yaml = require('js-yaml');

var nonEmptyString = function(argument) {
  return (
    argument &&
    typeof argument === 'string' &&
    argument.length > 0
  );
};

var validScenario = function(argument) {
  return (
    argument &&
    // Facts
    Array.isArray(argument.facts) &&
    argument.facts.length > 0 &&
    argument.facts.every(nonEmptyString) &&
    // Authorities
    Array.isArray(argument.authorities) &&
    argument.authorities.length > 0 &&
    argument.authorities.every(nonEmptyString) &&
    // Desired outcomes
    Array.isArray(argument.outcomes) &&
    argument.outcomes.length > 0 &&
    argument.outcomes.every(nonEmptyString) &&
    // Optional notes
    (
      !argument.hasOwnProperty('notes') ||
      nonEmptyString(argument.notes)
    )
  );
};

glob('authorities/**.md', function(error, authorityFiles) {
  var authorityNames = authorityFiles
    .map(function(fileName) {
      return path.basename(fileName, '.md');
    });
  glob('scenarios/**.yaml', function(error, scenarioFiles) {
    var foundProblem = false;
    async.each(
      scenarioFiles,
      function(scenarioFile) {
        var buffer = '';
        fs.createReadStream(scenarioFile)
          .on('data', function(data) {
            buffer += data;
          })
          .on('end', function() {
            var scenario = yaml.load(buffer);
            if (!validScenario(scenario)) {
              foundProblem = true;
              console.error(
                '"' + path.basename(scenarioFile, '.yaml') + '"' +
                ' is not a complete scenario.'
              );
            } else {
              scenario.authorities
                .forEach(function(authorityName) {
                  if (authorityNames.indexOf(authorityName) < 0) {
                    foundProblem = true;
                    console.error(
                      '"' + path.basename(scenarioFile, '.yaml') + '"' +
                      ' refers to missing source ' +
                      '"' + authorityName + '".'
                    );
                  }
                });
            }
          })
      },
      function(error) {
        process.exit(foundProblem ? 1 : 0);
      }
    );
  });
});
