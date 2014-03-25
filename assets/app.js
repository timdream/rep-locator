'use strict';

(function(exports) {
  function RepLocator() {
    this._started = false;
    this._ready = false;

    this.data = null;
    this.$selectors = [];
    this.locationResolver = null;
  }

  RepLocator.prototype.ISO3166TW_CODE = {
    'CHA': '彰化縣',
    'CYI': '嘉義市',
    'CYQ': '嘉義縣',
    'HSQ': '新竹縣',
    'HSZ': '新竹市',
    'HUA': '花蓮縣',
    'ILA': '宜蘭縣',
    'KEE': '基隆市',
    'KHH': '高雄市',
    'KHQ': '高雄市',
    'MIA': '苗栗縣',
    'NAN': '南投縣',
    'PEN': '澎湖縣',
    'PIF': '屏東縣',
    'TAO': '桃園縣',
    'TNN': '臺南市',
    'TNQ': '臺南市',
    'TPE': '臺北市',
    'TPQ': '新北市',
    'TTT': '臺東縣',
    'TXG': '臺中市',
    'TXQ': '臺中市',
    'YUN': '雲林縣',
    'JME': '金門縣',
    'LJF': '連江縣'
  };

  RepLocator.prototype.ADDRESS_SELECTOR_ID_PREFIX = 'address-selector';
  RepLocator.prototype.REPS_CONTAINER_ID = 'reps';

  RepLocator.prototype.start = function() {
    if (this._started) {
      throw 'Instance should not be start()\'ed twice.';
    }
    this._started = true;

    var data = this.data = new RepData();
    data.onready = this.handleDataReady.bind(this);
    data.start();

    this.locationResolver = new LocationResolver(this);
    this.locationResolver.start();

    this.titlePrefix = window.document.title;
  };

  RepLocator.prototype.stop = function hb_stop() {
    if (!this._started) {
      throw 'Instance was never start()\'ed but stop() is called.';
    }
    this._started = false;

    window.removeEventListener('hashchange', this);
    this.$selectors = [];

    this.data.stop();
    this.data = null;

    this.locationResolver.stop();
    this.locationResolver = null;

    window.document.title = this.titlePrefix;
  };

  RepLocator.prototype.handleEvent = function(evt) {
    this.showRepFromHash();
    this.updateSelectedFromHash();
  };

  RepLocator.prototype.handleDataReady = function() {
    var $selectors = this.$selectors;

    var $selector;
    for (var i = 0; i < 3; i++) {
      $selector = $('#' + this.ADDRESS_SELECTOR_ID_PREFIX + i);
      $selector.append('<option />');
      $selectors.push($selector);
    }

    this.data.getTopLevelNames().forEach(function(name) {
      var $o = $('<option />');
      $o.text(name);
      $o.val(name);
      $selectors[0].append($o);
    }, this);

    $selectors[0].prop('disabled', false)
      .on('change', this.handleTopSelect.bind(this));
    $selectors[1].prop('disabled', true)
      .on('change', this.handle2ndLevelSelect.bind(this));
    $selectors[2].prop('disabled', true)
      .on('change', this.handle3ndLevelSelect.bind(this));

    if (window.location.hash) {
      this.showRepFromHash();
      this.updateSelectedFromHash();
    }

    window.addEventListener('hashchange', this);

    this.locationResolver.enableButton();
  };

  RepLocator.prototype.updateLocation = function(addressPrefix) {
    var validAddressPrefix = this.data.getValidAddressPrefix(addressPrefix);
    window.location.hash = '#' + validAddressPrefix;
  };

  RepLocator.prototype.updateSelectedFromHash = function() {
    var addressPrefix = window.location.hash.substr(1);
    var addressComponents = addressPrefix.split(',');

    if (addressComponents.length) {
      window.document.title = this.titlePrefix + '：' + addressComponents.join('');
    } else {
      window.document.title = this.titlePrefix;
    }

    var $selectors = this.$selectors;
    $selectors[0][0].selectedIndex =
      $selectors[0].find('option[value="' + addressComponents[0] + '"]').index();
    this.handleTopSelect(false);
    if (addressComponents[1]) {
      $selectors[1][0].selectedIndex =
        $selectors[1].find('option[value="' + addressComponents[1] + '"]').index();
    }
    this.handle2ndLevelSelect(false);
    if (addressComponents[2]) {
      $selectors[2][0].selectedIndex =
        $selectors[2].find('option[value="' + addressComponents[2] + '"]').index();
    }
    this.handle3ndLevelSelect(false);
  };

  RepLocator.prototype.handleTopSelect = function(updateHash) {
    var $selectors = this.$selectors;
    if (!$selectors[0].val()) {
      $selectors[1].html('<option />');
      $selectors[1].prop('disabled', true);
      $selectors[2].html('<option />');
      $selectors[2].prop('disabled', true);

      if (updateHash) {
        this.updateHashFromSelected();
      }
      return;
    }

    var names =
      this.data.getLocalitiesFromAddressPrefix($selectors[0].val());

    $selectors[1].html('<option />');
    $selectors[1].prop('disabled', !names.length);
    $selectors[2].html('<option />');
    $selectors[2].prop('disabled', true);

    names.forEach(function(name) {
      var $o = $('<option />');
      $o.text(name);
      $o.val(name);
      $selectors[1].append($o);
    }, this);

    if (updateHash) {
      this.updateHashFromSelected();
    }
  };

  RepLocator.prototype.updateHashFromSelected = function() {
    var addressComponents = [];
    this.$selectors.forEach(function($selector) {
      if ($selector.val()) {
        addressComponents.push($selector.val());
      }
    }, this);
    window.location.hash = '#' + addressComponents.join(',');
  };

  RepLocator.prototype.handle2ndLevelSelect = function(updateHash) {
    var $selectors = this.$selectors;
    if (!$selectors[1].val()) {
      $selectors[2].html('<option />');
      $selectors[2].prop('disabled', true);

      if (updateHash) {
        this.updateHashFromSelected();
      }
      return;
    }

    var names =
      this.data.getLocalitiesFromAddressPrefix(
        $selectors[0].val() + ',' + $selectors[1].val());

    $selectors[2].html('<option />');
    $selectors[2].prop('disabled', !names.length);

    names.forEach(function(name) {
      var $o = $('<option />');
      $o.text(name);
      $o.val(name);
      $selectors[2].append($o);
    }, this);

    if (updateHash) {
      this.updateHashFromSelected();
    }
  };

  RepLocator.prototype.handle3ndLevelSelect = function(updateHash) {
    var $selectors = this.$selectors;

    if (updateHash) {
      this.updateHashFromSelected();
    }
  };

  RepLocator.prototype.showRepFromHash = function() {
    var addressPrefix = window.location.hash.substr(1);

    var reps = this.data.getRepsFromAddressPrefix(addressPrefix);

    var $container =
      $(document.getElementById(this.REPS_CONTAINER_ID));

    $container.html('');

    if (!reps) {
      document.body.classList.remove('has-reps');
      return;
    }

    document.body.classList.add('has-reps');

    reps.forEach(function(rep) {
      var $div = $('<div class="rep thumbnail media" />');
      $div.html(
        '<div class="pull-left text-center"><p><img src="' + rep.image + '?size=large" /></p>' +
        '<p><a class="btn btn-primary" href="http://vote.ly.g0v.tw/legislator/biller/' + rep.id + '" target="_blank">提案、投票紀錄</a></p></div>' +
        '<div class="media-body">' +
        '<h2 class="name media-heading">' + rep.name + '</h2>' +
        '<p><span class="constituency">' +
          this.getConstituencyString(rep.constituency) +
          '（' + this.getLocalitiesStringFromConstituency(rep.constituency) + '）／' +
        '</span>' +
        '<span class="party">' + this.getPartyString(rep.party) + '</span></p>' +
        '<hr />' +
        '</div>'
      );
      if (Object.keys(rep.contacts).length) {
        $div.find('.media-body').append('<h3 class="sr-only">聯絡資訊</h3>');
      }

      $.each(rep.contacts, function (key, val) {
        var key = $.trim(key);
        if (key) {
          var html = '<div class="contact"><h4>' + val['name'] + '</h4>';
          if (val['phone'] != undefined) {
              html += '<p>電話：<a href="tel:' + val['phone'] + '">' + val['phone'] + '</a></p>';
          }
          if (val['address'] != undefined) {
              html += '<p>地址：<a href="https://maps.google.com.tw/?q=' + val['address'] + '">' + val['address'] + '</a></p>';
          }
          if (val['fax'] != undefined) {
              html += '<p>傳真：<a href="fax:' + val['fax'] + '">' + val['fax'] + '</a></p>';
          }
          $div.find('.media-body').append(html);
        }
      });

      $container.append($div);
    }, this);
  };

  RepLocator.prototype.getConstituencyString = function(constituency) {
    switch (constituency[0]) {
      case 'proportional':
        return '全國不分區';
        break;
      case 'aborigine':
        return '山地原住民';
        break;
      case 'foreign':
        return '僑居國外國民';
        break;
      default:
        var result;
        if (constituency[0] in this.ISO3166TW_CODE) {
          if (constituency[1] == 0) {
            result = this.ISO3166TW_CODE[constituency[0]];
          } else {
            result = this.ISO3166TW_CODE[constituency[0]] + '第 ' + constituency[1] + ' 選區';
          }
        } else {
            result = constituency[0] + '<br>' + constituency[1];
        }
        return result;
        break;
    }
  };

  RepLocator.prototype.getLocalitiesStringFromConstituency = function(constituency) {
    var constituencyId = constituency.join(',');
    var localities = this.data.constituency[constituencyId];

    var str = localities[0].split(',').join('');
    localities.forEach(function(locality, i) {
      if (!i) {
        return;
      }
      var arr = locality.split(',');
      // Don't repeat the top level name on each item.
      arr.shift();
      str += '、' + arr.join('');
    });

    return str;
  };

  RepLocator.prototype.getPartyString = function (party) {
    switch (party) {
      case 'KMT':
        return '中國國民黨';
        break;
      case 'DPP':
        return '民主進步黨';
        break;
      case 'TSU':
        return '台灣團結聯盟';
        break;
      case 'PFP':
        return '親民黨';
        break;
      case 'NSU':
        return '無黨團結聯盟';
        break;
      default:
        if (party === null) {
          return '無黨籍';
        } else {
          return '不明';
        }
        break;
    }
  };

  exports.RepLocator = RepLocator;
}(window));
