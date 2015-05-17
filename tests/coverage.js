var fs = require('fs');
var glob = require('glob');
var path = require('path');
var split2 = require('split2');
var through2 = require('through2');

var AGREEMENT = process.argv[2];

var COVERAGE_COMMENT = /^# scenario:\s+(.+)\s+$/
var FORM_START = /^\s*(.+)?\\\\|!!/;

glob('scenarios/**.yaml', function(error, scenarioFiles) {
  var scenarioNames = scenarioFiles.map(function(fileName) {
    return path.basename(fileName, '.yaml');
  });
  var coveredScenarioNames = [];
  var sawCoverageComment = false;
  var untestedForms = [];
  var lineNumber = 1;
  fs.createReadStream(AGREEMENT)
    .pipe(split2())
    .on('data', function(line) {
      var coverageMatch;
      var formMatch;
      if (coverageMatch = COVERAGE_COMMENT.exec(line)) {
        var scenarioName = coverageMatch[1];
        if (coveredScenarioNames.indexOf(scenarioName) < 0) {
          coveredScenarioNames.push(scenarioName);
        }
        sawCoverageComment = true;
      } else if (formMatch = FORM_START.exec(line)) {
        var formHeading = formMatch[1];
        if (!sawCoverageComment) {
          if (formHeading) {
            untestedForms.push(formHeading);
          } else {
            untestedForms.push(lineNumber);
          }
        }
        sawCoverageComment = false;
      }
      lineNumber++;
    })
    .on('end', function() {
      var success = true;
      scenarioNames.forEach(function(scenarioName) {
        if (coveredScenarioNames.indexOf(scenarioName) < 0) {
          console.error(
            'No provision covers the scenario "' + scenarioName + '".'
          );
          success = false;
        }
      });
      coveredScenarioNames.forEach(function(coveredScenarioName) {
        if (scenarioNames.indexOf(coveredScenarioName) < 0) {
          console.error(
            'There is no scenario named "' + coveredScenarioName + '"'
          );
          success = false;
        }
      });
      untestedForms.forEach(function(untestedForm) {
        if (typeof untestedForm === 'string') {
          console.error(
            'No scenario covers the form "' + untestedForm.trim() + '".'
          );
        } else {
          console.error(
            'No scenario covers the form beginning on line ' +
            untestedForm + '.'
          );
        }
        success = false;
      })
      process.exit(success ? 0 : 1);
    });
});
