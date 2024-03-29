Scenario Files
==============

Scenario files describe a specific sets of circumstances and desired resulting outcomes under the agreement, with authorities and optional commentary supporting those conclusions.

Lawyers may think of scenarios as hypothetical cases played out under the agreement. Programmers may think of scenarios as acceptance tests.

Coverage Comments
-----------------

Comments in the agreement indicate which portions are implicated in which scenarios:

```commonform
# Scenario: Late Delivery
Deadlines \\ If <Developer> delivers ...
```

Such comments enable those making changes to quickly discern what scenarios may be affected.

Automated Checks
----------------

Automated scripts run to ensure that:

1. Each scenario is covered somewhere in the agreement.

2. Each part of the agreement covers some scenario.

3. Each scenario referenced in the agreement corresponds to a scenario file.

4. Each authority referenced in a scenario corresponds to an authority file.

5. Scenario files are uniformly structured and contain all required kinds of information.

Scenario File Format
--------------------

Scenario files are [YAML](http://yaml.org/) files:

```yaml
---
facts:
  - A description of a relevant fact
  - There may be more than one.
  - Facts should be no more specific than necessary.
outcomes:
  - A legal or factual outcome under the agreement
  - There may be more than one.
authorities:
  - A reference or citation
  - There may be more than one.
notes: Optional notes about the scenario
```
