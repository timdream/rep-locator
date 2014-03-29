'use strict';

(function(exports) {
  function RepLocator() {
    this._started = false;
    this._ready = false;

    this.data = null;
    this.$selectors = [];
    this.locationResolver = null;
    this.repCard = null;
  }

  RepLocator.prototype.ADDRESS_SELECTOR_ID_PREFIX = 'address-selector';

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

    this.repCard = new RepCard(data);
    this.repCard.start();

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

    this.repCard.stop();
    this.repCard = null;

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

    if (window.location.hash.substr(1)) {
      this.showRepFromHash();
      this.updateSelectedFromHash();
    }

    window.addEventListener('hashchange', this);

    this.locationResolver.enableButton();
  };

  RepLocator.prototype.updateLocation = function(addressPrefix) {
    var validAddressPrefix = this.data.getValidAddressPrefix(addressPrefix);
    window.location.hash = '#' + window.encodeURI(validAddressPrefix);
  };

  RepLocator.prototype.updateSelectedFromHash = function() {
    var addressPrefix = window.decodeURI(window.location.hash.substr(1));
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
    this.updateLocation(addressComponents.join(','));
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
    var addressPrefix = window.decodeURI(window.location.hash.substr(1));

    this.repCard.showRepFromAddressPrefix(addressPrefix);
  };

  exports.RepLocator = RepLocator;
}(window));
