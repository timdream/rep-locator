'use strict';

(function(exports) {
  function LocationResolver(app) {
    this.app = app;
    this._started = false;
  }

  LocationResolver.prototype.LOCATE_ME_BUTTON_ID = 'locate-me';
  LocationResolver.prototype.LOOKUP_URL = 'https://nominatim.openstreetmap.org/reverse?json_callback=?';

  LocationResolver.prototype.DEBUG_OUTPUT = false;
  LocationResolver.prototype.DEBUG_OUTPUT_ID = 'api-result';

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

  LocationResolver.prototype._debug = function(tag, msg, needsDeepCopy) {
    if (!this.DEBUG_OUTPUT) {
      return;
    }

    if (needsDeepCopy && typeof msg === 'object') {
      msg = $.extend(true, {}, msg);
    }

    var debugText = (typeof msg === 'object') ?
      JSON.stringify(msg, null, 2) : msg;

    $('#' + this.DEBUG_OUTPUT_ID)
      .append($('<pre>').text(tag + ': ' + debugText));
  };

  LocationResolver.prototype.enableButton = function() {
    this.$button.prop('disabled', false);
  };

  LocationResolver.prototype.locateCurrentLocality = function() {
    this.$button.addClass('loading').prop('disabled', true);

    if (this.DEBUG_OUTPUT) {
      $('#' + this.DEBUG_OUTPUT_ID).empty();
    }

    navigator.geolocation.getCurrentPosition(function success(pos) {
      if (!this._started) {
        return;
      }

      this._debug('currentPosition', pos, true);

      this.lookupCoords(pos.coords);
    }.bind(this), function error(err) {
      this._debug('currentPosition', err, true);

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

      this._debug('nominatim.openstreetmap.org', data, false);

      if (!data || !data.address || data.address.country_code !== 'tw') {
        return;
      }

      // See http://wiki.openstreetmap.org/wiki/WikiProject_Taiwan/Taiwan_tagging#Addresses_and_place_names_.5BProposed.5D
      // for updates

                   // 縣
      var level1 = data.address.county ||
                   // 直轄市、省轄市？
                   data.address.city ||
                   // 直轄市、省
                   data.address.state || '';

                   // 鄉鎮市
      var level2 = data.address.town ||
                   // 區
                   data.address.suburb ||
                   // 區？
                   data.address.state_district ||
                   // 縣轄市？
                   ((data.address.city !== level1) ? data.address.city : '');

                   // 村里
      var level3 = data.address.village ||
                   // 里？
                   data.address.city_district || '';

      var addressPrefix = level1;
      if (level2) {
        addressPrefix += ',' + level2;
        if (level3) {
          addressPrefix += ',' + level3;
        }
      }

      this._debug('address', addressPrefix);

      this.app.updateLocation(addressPrefix);
    }.bind(this)).fail(function(xhr, textStatus, errorThrown) {
      this._debug('nominatim.openstreetmap.org error',
        textStatus + ', ' + errorThrown);

      this.$button.removeClass('loading').prop('disabled', false);
    }.bind(this));
  };

  exports.LocationResolver = LocationResolver;
}(window));
