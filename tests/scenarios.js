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
    // References
    Array.isArray(argument.references) &&
    argument.references.length > 0 &&
    argument.references.every(nonEmptyString) &&
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

glob('references/**.md', function(error, referenceFiles) {
  var referenceNames = referenceFiles
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
              scenario.references
                .forEach(function(scenarioName) {
                  if (referenceNames.indexOf(scenarioName) < 0) {
                    foundProblem = true;
                    console.error(
                      '"' + path.basename(scenarioFile, '.yaml') + '"' +
                      ' refers to missing source ' +
                      '"' + scenarioName + '".'
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
