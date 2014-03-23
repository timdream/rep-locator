'use strict';

(function(exports) {
  var RepData = function() {
    this._started = false;
    this._ready = false;

    this.mly = null;
    this.constituency = null;
    this.repByAddressPrefixes = null;
    this.localities = null;
  };

  RepData.prototype.onready = null;

  RepData.prototype.DATA_PATH = './data/';

  RepData.prototype.start = function() {
    if (this._started) {
      throw 'Instance should not be start()\'ed twice.';
    }
    this._started = true;

    this.getRepData();
  };

  RepData.prototype.stop = function hb_stop() {
    if (!this._started) {
      throw 'Instance was never start()\'ed but stop() is called.';
    }
    this._started = false;

    this._ready = false;

    this.mly = null;
    this.constituency = null;
    this.repByAddressPrefixes = null;
    this.localities = null;
  };

  RepData.prototype.getRepData = function() {
    $.getJSON(this.DATA_PATH + 'mly-8.json').success(function(data) {
      if (!this._started) {
        return;
      }

      this.mly = data;

      this.checkReady();
    }.bind(this)).fail(function() {
      if (!this._started) {
        return;
      }

      throw 'Unable to get mly-8.json';
    }.bind(this));

    $.getJSON(this.DATA_PATH + 'constituency.json').success(function(data) {
      if (!this._started) {
        return;
      }

      this.constituency = data;

      this.checkReady();
    }.bind(this)).fail(function() {
      if (!this._started) {
        return;
      }

      throw 'Unable to get mly-8.json';
    }.bind(this));
  };

  RepData.prototype.checkReady = function() {
    if (!this.mly || !this.constituency) {
      return false;
    }

    this.constructRepData();
    this.ready = true;

    if (this.onready) {
      this.onready();
    }
  };

  RepData.prototype.constructRepData = function() {
    this.repByAddressPrefixes = {};
    this.localities = {};
    var i, rep, topLevelName, locality;
    for (var key in this.constituency) {
      for (i = 0; i < this.constituency[key].length; i++) {
        if (!(this.constituency[key][i] in this.repByAddressPrefixes)) {
           this.repByAddressPrefixes[this.constituency[key][i]] = [];
        }

        var names = this.constituency[key][i].split(',');
        var topLevelName = names[0];
        if (!(topLevelName in this.localities)) {
          this.localities[topLevelName] = [];
        }
        var locality = names[1];
        if (this.localities[topLevelName].indexOf(locality) === -1) {
          this.localities[topLevelName].push(locality);
        }

        rep = this.getRepByConstituency(key);
        if (!rep) {
          throw 'constituency.json contains incorrect key: ' + key;
        }

        this.repByAddressPrefixes[this.constituency[key][i]].push(rep);
      }
    }
  };

  RepData.prototype.getRepByConstituency = function(constituency) {
    if (!this.mly) {
      throw 'No mly data yet.';
    }

    for (var i = 0; i < this.mly.length; i++) {
      if (this.mly[i].constituency.join(',') === constituency) {
        return this.mly[i];
      }
    }

    return false;
  };

  RepData.prototype.getRepsFromAddressPrefix = function(addressPrefix) {
    if (!this.ready) {
      throw 'Not ready.';
    }

    if (this.repByAddressPrefixes[addressPrefix]) {
      return this.repByAddressPrefixes[addressPrefix];
    }

    if (this.repByAddressPrefixes[addressPrefix.substr(0, 4)]) {
      return this.repByAddressPrefixes[addressPrefix.substr(0, 4)];
    }

    return false;
  };

  RepData.prototype.getTopLevelNames = function() {
    if (!this.ready) {
      throw 'Not ready.';
    }

    return Object.keys(this.localities);
  };

  RepData.prototype.getLocalitiesFromTopLevelName = function(topLevelName) {
    return this.localities[topLevelName];
  };

  exports.RepData = RepData;
}(window));
