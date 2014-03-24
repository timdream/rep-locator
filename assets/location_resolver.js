'use strict';

(function(exports) {
  function LocationResolver(app) {
    this.app = app;
    this._started = false;
  }

  LocationResolver.prototype.LOCATE_ME_BUTTON_ID = 'locate-me';
  LocationResolver.prototype.LOOKUP_URL = 'https://nominatim.openstreetmap.org/reverse?json_callback=?';

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
    this.$button.addClass('loading').prop('disabled', true);

    navigator.geolocation.getCurrentPosition(function success(pos) {
      if (!this._started) {
        return;
      }

      this.lookupCoords(pos.coords);
    }.bind(this), function error() {
      this.$button.removeClass('loading').prop('disabled', false);
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

      this.$button.removeClass('loading').prop('disabled', false);

      if (!data || !data.address || data.address.country_code !== 'tw') {
        return;
      }

      var addressPrefix = data.address.state || data.address.county;
      if (data.address.state_district || data.address.city) {
        addressPrefix +=
          ',' + (data.address.state_district || data.address.city);
      }
      if (data.address.city_district) {
        addressPrefix +=
          ',' + data.address.city_district;
      }

      this.app.updateLocation(addressPrefix);
    }.bind(this)).fail(function() {
      this.$button.removeClass('loading').prop('disabled', false);
    }.bind(this));
  };

  exports.LocationResolver = LocationResolver;
}(window));
