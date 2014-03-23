'use strict';

(function(exports) {
  var RepData = function() {
    this._started = false;
    this._ready = false;

    this.mly = null;
    this.constituency = null;
    this.repByLocalities = null;
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
    this.repByLocalities = null;
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
    this.repByLocalities = {};
    var i, j, rep, currentDict;
    for (var key in this.constituency) {
      for (i = 0; i < this.constituency[key].length; i++) {
        if (!(this.constituency[key][i] in this.repByAddressPrefixes)) {
           this.repByAddressPrefixes[this.constituency[key][i]] = [];
        }

        var addressComponents = this.constituency[key][i].split(',');
        var currentDict = this.repByLocalities;
        for (j = 0; j < addressComponents.length; j++) {
          if (!(addressComponents[j] in currentDict)) {
            currentDict[addressComponents[j]] = {};
          }
          currentDict = currentDict[addressComponents[j]];
        }
        if (!('_reps' in currentDict)) {
          currentDict._reps = [];
        }

        rep = this.getRepByConstituency(key);
        if (!rep) {
          throw 'constituency.json contains incorrect key: ' + key;
        }

        currentDict._reps.push(rep);
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

    var addressComponents = addressPrefix.split(',');
    var currentDict = this.repByLocalities;
    var reps = null;
    for (var i = 0; i < addressComponents.length; i++) {
      if (!(addressComponents[i] in currentDict)) {
        if (!reps) {
          return false;
        }
        return reps;
      }
      currentDict = currentDict[addressComponents[i]];
      if ('_reps' in currentDict) {
        reps = currentDict._reps;
      }
    }

    return reps || false;
  };

  RepData.prototype.getTopLevelNames = function() {
    if (!this.ready) {
      throw 'Not ready.';
    }

    return Object.keys(this.repByLocalities);
  };

  RepData.prototype.getLocalitiesFromAddressPrefix = function(addressPrefix) {
    if (!this.ready) {
      throw 'Not ready.';
    }

    var addressComponents = addressPrefix.split(',');
    var currentDict = this.repByLocalities;
    for (var i = 0; i < addressComponents.length; i++) {
      if (!(addressComponents[i] in currentDict)) {
        return undefined;
      }
      currentDict = currentDict[addressComponents[i]];
    }

    if ('_reps' in currentDict) {
      return [];
    }

    return Object.keys(currentDict);
  };

  exports.RepData = RepData;
}(window));
