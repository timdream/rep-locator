'use strict';

(function(exports) {
  function LocationResolver(app) {
    this.app = app;
    this._started = false;
  }

  LocationResolver.prototype.LOCATE_ME_BUTTON_ID = 'locate-me';
  LocationResolver.prototype.LOOKUP_URL = 'http://nominatim.openstreetmap.org/reverse?json_callback=?';

  LocationResolver.prototype.start = function() {
    if (this._started) {
      throw 'Instance should not be start()\'ed twice.';
    }
    this._started = true;

    this.$button = $('#' + this.LOCATE_ME_BUTTON_ID);

    this.$button.prop('disabled', true)
      .on('click', this.locateCurrentLocality.bind(this));
  };

  LocationResolver.prototype.stop = function() {
    if (!this._started) {
      throw 'Instance was never start()\'ed but stop() is called.';
    }
    this._started = false;

    this.$button.off('click').prop('disabled', true).removeClass('loading');
  };

  LocationResolver.prototype.enableButton = function() {
    this.$button.prop('disabled', false);
  };

  LocationResolver.prototype.locateCurrentLocality = function() {
    this.$button.addClass('loading');

    navigator.geolocation.getCurrentPosition(function success(pos) {
      if (!this._started) {
        return;
      }

      this.lookupCoords(pos.coords);
    }.bind(this), function error() {
      this.$button.removeClass('loading');
    }.bind(this), {
      timeout: 20 * 1E3
    });
  };

  LocationResolver.prototype.lookupCoords = function(coords) {
    $.getJSON(this.LOOKUP_URL, {
      format: 'json',
      lat: coords.latitude,
      lon: coords.longitude,
      addressdetails: 1,
      'accept-language': 'zh-TW'
    }).success(function(data) {
      if (!this._started) {
        return;
      }

      this.$button.removeClass('loading');

      if (!data || !data.address || data.address.country_code !== 'tw') {
        return;
      }

      this.app.updateLocationSelected(
        data.address.state + ',' + data.address.state_district);
    }.bind(this)).fail(function() {

    }.bind(this));
  };

  exports.LocationResolver = LocationResolver;
}(window));
