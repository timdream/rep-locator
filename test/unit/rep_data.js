'use strict';

var expected0 = {
    "name": "rep-name-AAA-1",
    "constituency": [
        "AAA",
        1
    ]
};

var expected1 = {
    "name": "rep-name-AAA-2",
    "constituency": [
        "AAA",
        2
    ]
};

var expected2 = {
    "name": "rep-name-BBB-2",
    "constituency": [
        "BBB",
        0
    ]
};

test('getRepByConstituency', function() {
  var data = new RepData();
  data.onready = function() {
    var reps = data.getRepByConstituency('AAA,1');

    deepEqual(reps, expected0, 'Find the right reps.');
    data.stop();

    start();
  };
  data.start();
  stop();
});

test('getRepsFromAddressPrefix', function() {
  var data = new RepData();
  data.onready = function() {
    var reps = data.getRepsFromAddressPrefix('AAAAAA,aaaaaa');

    deepEqual(reps, [expected0], 'Find the right reps.');
    data.stop();

    start();
  };
  data.start();
  stop();
});

test('getRepsFromAddressPrefix (ambiguous locality)', function() {
  var data = new RepData();
  data.onready = function() {
    var reps = data.getRepsFromAddressPrefix('AAAAAA,bbbbbb');

    deepEqual(reps, [expected0, expected1], 'Find the right reps.');
    data.stop();

    start();
  };
  data.start();
  stop();
});

test('getRepsFromAddressPrefix (too precise)', function() {
  var data = new RepData();
  data.onready = function() {
    var reps = data.getRepsFromAddressPrefix('BBBBBB,aaaaaa');

    deepEqual(reps, [expected2], 'Find the right reps.');
    data.stop();

    start();
  };
  data.start();
  stop();
});

test('getTopLevelNames', function() {
  var data = new RepData();
  data.onready = function() {
    var topLevelNames = data.getTopLevelNames();

    deepEqual(topLevelNames, [
      'AAAAAA',
      'BBBBBB'
    ], 'Has all places.');
    data.stop();

    start();
  };
  data.start();
  stop();
});

test('getLocalitiesFromAddressPrefix', function() {
  var data = new RepData();
  data.onready = function() {
    var localties = data.getLocalitiesFromAddressPrefix('AAAAAA');

    deepEqual(localties, [
      'aaaaaa',
      'bbbbbb',
      'cccccc'
    ], 'Has all places.');
    data.stop();

    start();
  };
  data.start();
  stop();
});

test('getLocalitiesFromAddressPrefix (invalid name)', function() {
  var data = new RepData();
  data.onready = function() {
    var localties = data.getLocalitiesFromAddressPrefix('XXXXXX');

    deepEqual(localties, undefined, 'Is undefined.');
    data.stop();

    start();
  };
  data.start();
  stop();
});

test('getLocalitiesFromAddressPrefix (constituency is the entire top level)', function() {
  var data = new RepData();
  data.onready = function() {
    var localties = data.getLocalitiesFromAddressPrefix('BBBBBB');

    deepEqual(localties, [], 'Is an empty array.');
    data.stop();

    start();
  };
  data.start();
  stop();
});
