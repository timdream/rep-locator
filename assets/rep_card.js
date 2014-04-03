'use strict';

(function(exports) {
  function RepCard(data) {
    this._started = false;
    this.data = data;
  }

  RepCard.prototype.ISO3166TW_CODE = {
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

  RepCard.prototype.REPS_CONTAINER_ID = 'reps';

  RepCard.prototype.start = function() {
    if (this._started) {
      throw 'Instance should not be start()\'ed twice.';
    }
    this._started = true;
  };

  RepCard.prototype.stop = function hb_stop() {
    if (!this._started) {
      throw 'Instance was never start()\'ed but stop() is called.';
    }
    this._started = false;
  };

  RepCard.prototype.showRepFromAddressPrefix = function(addressPrefix) {
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
      if (rep.contacts && rep.contacts.length) {
        $div.find('.media-body').append('<h3 class="sr-only">聯絡資訊</h3>');
        $.each(rep.contacts, function (key, val) {
          var key = $.trim(key);
          if (key) {
            var html = '<div class="contact"><h4>' + val['name'] + '</h4>';
            if (val['phone'] != undefined) {
                html += '<p>電話：<a href="tel:' + val['phone'] + '">' + val['phone'] + '</a><br>';
            }
            if (val['address'] != undefined) {
                html += '地址：<a target="_blank" href="https://maps.google.com.tw/?q=' + val['address'] + '">' + val['address'] + '</a><br>';
            }
            if (val['fax'] != undefined) {
                html += '傳真：<a href="fax:' + val['fax'] + '">' + val['fax'] + '</a></p>';
            }
            $div.find('.media-body').append(html);
          }
        });
      } else {
        $div.find('.media-body').append('<h3 class="">無聯絡資訊</h3>');
      }

      $container.append($div);
    }, this);
  };

  RepCard.prototype.getConstituencyString = function(constituency) {
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

  RepCard.prototype.getLocalitiesStringFromConstituency = function(constituency) {
    var constituencyId = constituency.join(',');
    var localities = this.data.constituency[constituencyId];

    var previousName = [];
    var countSuffix = 0;
    var titleStr = '';

    var str = '';
    localities.forEach(function(locality, i) {
      var arr = locality.split(',');

      if (arr[0] === previousName[0] &&
          arr[1] === previousName[1]) {
        if (!countSuffix) {
          countSuffix++;
          titleStr += previousName[2];
        }
        titleStr += '、' + arr[2];
        countSuffix++;

        return;
      }

      // Don't repeat the top level name on each item.
      if (arr[0] === previousName[0]) {
        arr.shift();
      }
      if (arr[0] === previousName[1]) {
        arr.shift();
      }

      if (!!i) {
        str += '、';
      }
      str += arr.join('');

      previousName = locality.split(',');
    });

    if (countSuffix) {
      str += '<abbr title="' + titleStr + '">等' + countSuffix + '里</abbr>';
    }

    return str;
  };

  RepCard.prototype.getPartyString = function (party) {
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

  exports.RepCard = RepCard;
}(window));
