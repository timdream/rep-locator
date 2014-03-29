'use strict';

(function(exports) {
  function RepSelector(app) {
    this._started = false;
    this.$selectors = [];

    this.app = app;
  }

  RepSelector.prototype.ADDRESS_SELECTOR_ID_PREFIX = 'address-selector';

  RepSelector.prototype.start = function() {
    if (this._started) {
      throw 'Instance should not be start()\'ed twice.';
    }
    this._started = true;

    var $selectors = this.$selectors;

    var $selector;
    for (var i = 0; i < 3; i++) {
      $selector = $('#' + this.ADDRESS_SELECTOR_ID_PREFIX + i);
      $selector.append('<option />');
      $selectors.push($selector);
    }

    this.titlePrefix = window.document.title;
  };

  RepSelector.prototype.stop = function hb_stop() {
    if (!this._started) {
      throw 'Instance was never start()\'ed but stop() is called.';
    }
    this._started = false;

    this.$selectors.forEach(function($s) {
      $s.off('change').prop('disabled', true);
    });
    this.$selectors = [];

    window.document.title = this.titlePrefix;
  };

  RepSelector.prototype.enableSelectors = function() {
    var $selectors = this.$selectors;

    this.app.data.getTopLevelNames().forEach(function(name) {
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
  };

  RepSelector.prototype.updateSelectorLocation = function(addressPrefix) {
    var addressComponents = addressPrefix.split(',');

    if (addressPrefix.length) {
      window.document.title =
        this.titlePrefix + '：' + addressComponents.join('');
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

  RepSelector.prototype.updateLocationFromSelected = function() {
    var addressComponents = [];
    this.$selectors.forEach(function($selector) {
      if ($selector.val()) {
        addressComponents.push($selector.val());
      }
    }, this);
    this.app.updateLocation(addressComponents.join(','));
  };

  RepSelector.prototype.handleTopSelect = function(updateHash) {
    var $selectors = this.$selectors;
    if (!$selectors[0].val()) {
      $selectors[1].html('<option />');
      $selectors[1].prop('disabled', true);
      $selectors[2].html('<option />');
      $selectors[2].prop('disabled', true);

      if (updateHash) {
        this.updateLocationFromSelected();
      }
      return;
    }

    var names =
      this.app.data.getLocalitiesFromAddressPrefix($selectors[0].val());

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
      this.updateLocationFromSelected();
    }
  };

  RepSelector.prototype.handle2ndLevelSelect = function(updateHash) {
    var $selectors = this.$selectors;
    if (!$selectors[1].val()) {
      $selectors[2].html('<option />');
      $selectors[2].prop('disabled', true);

      if (updateHash) {
        this.updateLocationFromSelected();
      }
      return;
    }

    var names = this.app.data.getLocalitiesFromAddressPrefix(
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
      this.updateLocationFromSelected();
    }
  };

  RepSelector.prototype.handle3ndLevelSelect = function(updateHash) {
    var $selectors = this.$selectors;

    if (updateHash) {
      this.updateLocationFromSelected();
    }
  };

  exports.RepSelector = RepSelector;
}(window));
