'use strict';

(function(exports) {
  function RepLocator() {
    this._started = false;
    this._ready = false;

    this.data = null;
    this.$selectors = [];
    this.locationResolver = null;
    this.repCard = null;
    this.repSelector = null;
  }

  RepLocator.prototype.TITLE_ID = 'rep-locator-title';

  RepLocator.prototype.USE_HASH_AS_STATE = true;

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

    this.repSelector = new RepSelector(this);
    this.repSelector.start();

    if (window.top !== window) {
      $('#' + this.TITLE_ID).addClass('sr-only');
    }
  };

  RepLocator.prototype.stop = function hb_stop() {
    if (!this._started) {
      throw 'Instance was never start()\'ed but stop() is called.';
    }
    this._started = false;

    $('#' + this.TITLE_ID).removeClass('sr-only');

    window.removeEventListener('hashchange', this);
    this.$selectors = [];

    this.data.stop();
    this.data = null;

    this.locationResolver.stop();
    this.locationResolver = null;

    this.repCard.stop();
    this.repCard = null;

    this.repSelector.stop();
    this.repSelector = null;
  };

  RepLocator.prototype.handleEvent = function(evt) {
    this.updateLocationFromHash();
  };

  RepLocator.prototype.handleDataReady = function() {
    this.repSelector.enableSelectors();
    this.locationResolver.enableButton();

    if (this.USE_HASH_AS_STATE && window.location.hash.substr(1)) {
      this.updateLocationFromHash();
    }
    if (this.USE_HASH_AS_STATE) {
      window.addEventListener('hashchange', this);
    }
  };

  RepLocator.prototype.updateLocation = function(addressPrefix) {
    var validAddressPrefix =
      this.data.getValidAddressPrefix(addressPrefix) || '';

    if (this.USE_HASH_AS_STATE) {
      window.location.hash = '#' + window.encodeURI(validAddressPrefix);
    } else {
      this.repCard.showRepFromAddressPrefix(validAddressPrefix);
      this.repSelector.updateSelectorLocation(validAddressPrefix);
    }
  };

  RepLocator.prototype.updateLocationFromHash = function() {
    var addressPrefix = window.decodeURI(window.location.hash.substr(1));
    var validAddressPrefix =
      this.data.getValidAddressPrefix(addressPrefix) || '';
    this.repCard.showRepFromAddressPrefix(validAddressPrefix);
    this.repSelector.updateSelectorLocation(validAddressPrefix);
  };

  exports.RepLocator = RepLocator;
}(window));
