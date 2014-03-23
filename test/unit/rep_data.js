'use strict';

RepData.prototype.DATA_PATH = '../data/';

var expected0 = {
  'name': '丁守中',
  'party': 'KMT',
  'caucus': 'KMT',
  'constituency': [
      'TPE',
      1
  ],
  'contact': {
      '國會研究室': {
          'phone': '02-2358-6706',
          'address': '10051臺北市中正區濟南路1段3-1號0707室',
          'fax': '02-2358-6710'
      },
      '北投服務處': {
          'phone': '02-2828-7789',
          'address': '11262臺北市北投區承德路七段188巷2號1樓',
          'fax': '02-2828-6877'
      }
  },
  'avatar': 'http://avatars.io/50a65bb26e293122b0000073/36f800ccfad1a8429e795874b135b969',
  'assume': '2012-02-01'
};

var expected1 = {
  'name': '姚文智',
  'party': 'DPP',
  'caucus': 'DPP',
  'constituency': [
      'TPE',
      2
  ],
  'contact': {
      '國會研究室': {
          'phone': '02-2358-6758',
          'address': '10051臺北市中正區濟南路1段3-1號1102室',
          'fax': '02-2358-6040'
      }
  },
  'avatar': 'http://avatars.io/50a65bb26e293122b0000073/fad6fdf00e0f0a355dda5e06bf9f3d04',
  'assume': '2012-02-01'
};

var expected2 = {
  'assume': '2012-02-01',
  'avatar': 'http://avatars.io/50a65bb26e293122b0000073/f5edfa6e68c03509f3e00e52ac926ce5',
  'caucus': 'DPP',
  'constituency': [
    'ILA',
    0
  ],
  'contact': {
    '國會研究室': {
      'address': '10051臺北市中正區濟南路1段3-1號0408室',
      'fax': '02-2358-6170',
      'phone': '02-2358-6220'
    },
    '宜蘭服務處': {
      'address': '宜蘭市民族路593號',
      'fax': '03-936-6189',
      'phone': '03-936-6299'
    },
    '羅東服務處': {
      'address': '羅東鎮興東南路152號',
      'fax': '03-957-2788',
      'phone': '03-957-2099'
    }
  },
  'name': '陳歐珀',
  'party': 'DPP'
};

test('getRepByConstituency', function() {
  var data = new RepData();
  data.onready = function() {
    var reps = data.getRepByConstituency('TPE,1');

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
    var reps = data.getRepsFromAddressPrefix('台北市,北投區');

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
    var reps = data.getRepsFromAddressPrefix('台北市,士林區');

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
    var reps = data.getRepsFromAddressPrefix('宜蘭縣,宜蘭市');

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
      '台北市',
      '新北市',
      '台中市',
      '台南市',
      '高雄市',
      '基隆市',
      '宜蘭縣',
      '桃園縣',
      '新竹縣',
      '新竹市',
      '苗栗縣',
      '彰化縣',
      '南投縣',
      '雲林縣',
      '嘉義縣',
      '嘉義市',
      '屏東縣',
      '臺東縣',
      '花蓮縣',
      '澎湖縣',
      '金門縣',
      '連江縣'
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
    var localties = data.getLocalitiesFromAddressPrefix('台北市');

    deepEqual(localties, [
      '北投區',
      '士林區',
      '大同區',
      '中山區',
      '松山區',
      '內湖區',
      '南港區',
      '萬華區',
      '中正區',
      '大安區',
      '信義區',
      '文山區'
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
    var localties = data.getLocalitiesFromAddressPrefix('高壇市');

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
    var localties = data.getLocalitiesFromAddressPrefix('宜蘭縣');

    deepEqual(localties, [], 'Is an empty array.');
    data.stop();

    start();
  };
  data.start();
  stop();
});
