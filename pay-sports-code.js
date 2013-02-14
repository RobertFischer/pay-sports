jQuery.noConflict();
jQuery(function($) {

  var rights_fees_c = 'Per Year (millions)';
  var carriage_fees_b = 'Sub fee per month';
  var carriage_fees_d = 'Per Year (millions)';

  var carriage_fees = {};
  var rights_fees = {};
  var league_blocks = {};
  var network_checkboxes = {};

  var container = $("div[pay-sports]");

  var number_to_dollars = function(num) {
    if(isNaN(num)) return "$$$";
    num = (Math.round(num*100)/100).toString();
    if(/^\d+$/.test(num)) {
      num = num + ".00";
    } else if(/^\d+\.\d$/.test(num)) {
      num = num + "0";
    }
    return "$" + num;
  }

  var dollars_to_number = function(it) {
    return parseFloat(it.replace(/^\$/, ""));
  };

  var has_network = function(network) {
    return network_checkboxes[network].is(":checked");
  }

  var has_turner = function() {
    return has_network("TNT") || has_network("TBS") || has_network("TruTV");
  }

  var has_espn = function(espnu_counts) {
    return has_network("ESPN") || has_network("ESPN2") || (espnu_counts && has_network("ESPNU"));
  }

  var update_amount = function(league, amount) {
    var block = league_blocks[league];
    block.data('target-amount', Math.max(0, amount));

    block.fadeTo('slow', 0.25);

    var adjust = null;
    adjust = function() {
      var amount = block.data('target-amount');
      var old_amount = block.data('amount');
      if((old_amount+0.01) <= amount) {
        $('.league_amount', block).text(number_to_dollars(old_amount+0.01));
        block.data('amount', old_amount+0.01);
        setTimeout(adjust, 200);
      } else if ((old_amount-0.01) >= amount) {
        $('.league_amount', block).text(number_to_dollars(old_amount-0.01));
        block.data('amount', old_amount-0.01);
        setTimeout(adjust, 200);
      } else {
        block.fadeIn('slow');
      }
    };
    adjust();
  };

  var recalculateNFL = function() {
    // ='Rights Fees'!C4/('Carriage Fees'!D4+'Carriage Fees'!D5)*('Carriage Fees'!B4+'Carriage Fees'!B5)*12+'Carriage Fees'!B20*12
    var amount = 0;

    if(has_network('ESPN') || has_network('ESPN2')) {
      var rights_fees_c4 =
        dollars_to_number(rights_fees['NFL - ESPN']['Per Year (millions)']);
      var carriage_fees_d4 =
        dollars_to_number(carriage_fees['ESPN']['Per Year (millions)']);
      var carriage_fees_d5 =
        dollars_to_number(carriage_fees['ESPN2']['Per Year (millions)']);
      var carriage_fees_b4 =
        dollars_to_number(carriage_fees['ESPN']['Sub fee per month']);
      var carriage_fees_b5 =
        dollars_to_number(carriage_fees['ESPN2']['Sub fee per month']);

      amount +=
        rights_fees_c4/(carriage_fees_d4+carriage_fees_d5)*
        (carriage_fees_b4+carriage_fees_b5)*12;
    }

    if(has_network('NFL Network')) {
      var carriage_fees_b20 =
        dollars_to_number(carriage_fees['ESPN2']['Sub fee per month']);
      amount += carriage_fees_b20*12;
    }

    update_amount('NFL', amount);
  };

  var recalculateMLB = function() {
    var amount = 0;

    //='Rights Fees'!C5/('Carriage Fees'!D4+'Carriage Fees'!D5)*('Carriage Fees'!B4+'Carriage Fees'!B5)*12+
    if(has_espn()) {
      var rights_fees_c5 = dollars_to_number(rights_fees['MLB - ESPN']['Per Year (millions)']);
      var carriage_fees_d4 = dollars_to_number(carriage_fees['ESPN']['Per Year (millions)']);
      var carriage_fees_d5 = dollars_to_number(carriage_fees['ESPN2']['Per Year (millions)']);
      var carriage_fees_b4 = dollars_to_number(carriage_fees['ESPN']['Sub fee per month']);
      var carriage_fees_b5 = dollars_to_number(carriage_fees['ESPN2']['Sub fee per month']);

      amount +=
        rights_fees_c5/(carriage_fees_d4 + carriage_fees_d5) *
        (carriage_fees_b4 + carriage_fees_b5)*12
      ;
    }

    // 'Rights Fees'!C6/'Carriage Fees'!D12*'Carriage Fees'!B12*12+
    if(has_network('Fox Sports Net')) {
      var rights_fees_c6 = dollars_to_number(rights_fees['MLB - Fox Sports Net']['Per Year (millions)']);
      var carriage_fees_d12 = dollars_to_number(carriage_fees['Fox Sports Net']['Per Year (millions)']);
      var carriage_fees_b12 = dollars_to_number(carriage_fees['Fox Sports Net']['Sub fee per month']);

      amount +=
        rights_fees_c6/carriage_fees_d12*carriage_fees_b12*12
      ;
    }

    // TODO This seems wrong -- using my best guess as to what's right
    // 'Rights Fees'!C7/('Carriage Fees'!D12+'Carriage Fees'!D13)*('Carriage Fees'!B12+'Carriage Fees'!B13)*12+
    if(has_turner()) {
      var rights_fees_c7 = dollars_to_number(rights_fees['MLB - Turner']['Per Year (millions)']);
      var carriage_fees_d8 = dollars_to_number(carriage_fees['TNT']['Per Year (millions)']);
      var carriage_fees_d9 = dollars_to_number(carriage_fees['TBS']['Per Year (millions)']);
      var carriage_fees_d10 = dollars_to_number(carriage_fees['TruTV']['Per Year (millions)']);
      var carriage_fees_b8 = dollars_to_number(carriage_fees['TNT']['Sub fee per month']);
      var carriage_fees_b9 = dollars_to_number(carriage_fees['TBS']['Sub fee per month']);
      var carriage_fees_b10 = dollars_to_number(carriage_fees['TruTV']['Sub fee per month']);

      amount +=
        rights_fees_c7/(carriage_fees_d8+carriage_fees_d9+carriage_fees_d10) *
        (carriage_fees_b8 + carriage_fees_b9 + carriage_fees_b10)*12
      ;
    }

    // 'Carriage Fees'!B21*12
    if(has_network('MLB Network')) {
      amount += dollars_to_number(carriage_fees['MLB Network']['Sub fee per month'])*12;
    }

    update_amount('MLB', amount);
  };

  var recalculateNBA = function() {
    var amount = 0;

    // TODO Again, this seems wrong -- using my best guess as to what's right
    //='Rights Fees'!C8/('Carriage Fees'!D4+'Carriage Fees'!D5+'Carriage Fees'!D12+'Carriage Fees'!D13)*
    // ('Carriage Fees'!B4+'Carriage Fees'!B5+'Carriage Fees'!B12+'Carriage Fees'!B13)*12+
    if(has_turner() || has_espn()) {
      var rights_fees_c8 = dollars_to_number(rights_fees['NBA - ESPN / Turner']['Per Year (millions)']);
      var carriage_fees_d4 = dollars_to_number(carriage_fees['ESPN']['Per Year (millions)']);
      var carriage_fees_d5 = dollars_to_number(carriage_fees['ESPN2']['Per Year (millions)']);
      var carriage_fees_d8 = dollars_to_number(carriage_fees['TNT']['Per Year (millions)']);
      var carriage_fees_d9 = dollars_to_number(carriage_fees['TBS']['Per Year (millions)']);
      var carriage_fees_d10 = dollars_to_number(carriage_fees['TruTV']['Per Year (millions)']);
      var carriage_fees_b4 = dollars_to_number(carriage_fees['ESPN']['Sub fee per month']);
      var carriage_fees_b5 = dollars_to_number(carriage_fees['ESPN2']['Sub fee per month']);
      var carriage_fees_b8 = dollars_to_number(carriage_fees['TNT']['Sub fee per month']);
      var carriage_fees_b9 = dollars_to_number(carriage_fees['TBS']['Sub fee per month']);
      var carriage_fees_b10 = dollars_to_number(carriage_fees['TruTV']['Sub fee per month']);

      amount += rights_fees_c8 / (
        carriage_fees_d4 + carriage_fees_d5 + carriage_fees_d8 + carriage_fees_d9 + carriage_fees_d10
      ) * (
        carriage_fees_b4 + carriage_fees_b5 + carriage_fees_b8 + carriage_fees_b9 + carriage_fees_b10
      ) * 12;
    }

    // 'Carriage Fees'!B22*12
    if(has_network('NBA TV')) {
      amount += dollars_to_number(carriage_fees['NBA TV']['Sub fee per month'])*12;
    }

    update_amount('NBA', amount);
  };

  var recalculateMLS = function() {
    var amount = 0;

    // ='Rights Fees'!C10/'Carriage Fees'!D16*'Carriage Fees'!B16*12+
    if(has_network('NBC Sports Network')) {
      var rights_fees_c10 = dollars_to_number(rights_fees['MLS - NBC']['Per Year (millions)']);
      var carriage_fees_d16 = dollars_to_number(carriage_fees['NBC Sports Network']['Per Year (millions)']);
      var carriage_fees_b16 = dollars_to_number(carriage_fees['NBC Sports Network']['Sub fee per month']);
      amount += rights_fees_c10/carriage_fees_d16*carriage_fees_b16*12;
    }

    //  'Rights Fees'!C11/('Carriage Fees'!D4+'Carriage Fees'!D5)*('Carriage Fees'!B4+'Carriage Fees'!B5)*12+
    if(has_espn()) {
      var rights_fees_c11 = dollars_to_number(rights_fees['MLS - ESPN']['Per Year (millions)']);
      var carriage_fees_d4 = dollars_to_number(carriage_fees['ESPN']['Per Year (millions)']);
      var carriage_fees_d5 = dollars_to_number(carriage_fees['ESPN2']['Per Year (millions)']);
      var carriage_fees_b4 = dollars_to_number(carriage_fees['ESPN']['Sub fee per month']);
      var carriage_fees_b5 = dollars_to_number(carriage_fees['ESPN2']['Sub fee per month']);
      amount +=
        rights_fees_c11/(carriage_fees_d4+carriage_fees_d5)*(carriage_fees_b4+carriage_fees_b5)*12;
    }

    // 'Rights Fees'!C12/'Carriage Fees'!D18*'Carriage Fees'!B18
    if(has_network('Galavision')) {
      var rights_fees_c12 = dollars_to_number(rights_fees['MLS - Galavision']['Per Year (millions)']);
      var carriage_fees_d18 = dollars_to_number(carriage_fees['Galavision']['Per Year (millions)']);
      var carriage_fees_b18 = dollars_to_number(carriage_fees['Galavision']['Sub fee per month']);

      amount += rights_fees_c12 / carriage_fees_d18 * carriage_fees_b18;
    }

    update_amount('MLS', amount);
  };

  var recalculateEPL = function() {
    var amount = 0;

    // ='Rights Fees'!C13/'Carriage Fees'!D14*'Carriage Fees'!B14*12
    if(has_network('Fox Soccer Channel')) {
      var rights_fees_c13 = dollars_to_number(rights_fees['Premier League - Fox Soccer']['Per Year (millions)']);
      var carriage_fees_d14 = dollars_to_number(carriage_fees['Fox Soccer']['Per Year (millions)']);
      var carriage_fees_b14 = dollars_to_number(carriage_fees['Fox Soccer']['Sub fee per month']);
      amount += rights_fees_c13 / carriage_fees_d14 * carriage_fees_b14 * 12;
    }

    update_amount('EPL', amount);
  };

  var recalculateNCAATourney = function() {
    var amount = 0;

    // TODO CBS/Turner, but then Fox for carriage fees?  Assuming CBS/Turner is right.
    // =('Rights Fees'!C14/2)/('Carriage Fees'!D12+'Carriage Fees'!D13)*('Carriage Fees'!B12+'Carriage Fees'!B13)*12

    var rights_fees_c14 = dollars_to_number(rights_fees['NCAA Tourney - CBS / Turner'][rights_fees_c])

    if(has_turner()) {
      var carriage_fees_d8 = dollars_to_number(carriage_fees['TNT']['Per Year (millions)']);
      var carriage_fees_d9 = dollars_to_number(carriage_fees['TBS']['Per Year (millions)']);
      var carriage_fees_d10 = dollars_to_number(carriage_fees['TruTV']['Per Year (millions)']);
      var carriage_fees_b8 = dollars_to_number(carriage_fees['TNT']['Sub fee per month']);
      var carriage_fees_b9 = dollars_to_number(carriage_fees['TBS']['Sub fee per month']);
      var carriage_fees_b10 = dollars_to_number(carriage_fees['TruTV']['Sub fee per month']);
      amount +=
        (rights_fees_c14/2)/(
          carriage_fees_d8 + carriage_fees_d9 + carriage_fees_d10
        ) * (
          carriage_fees_b8 + carriage_fees_b9 + carriage_fees_b10
        ) * 12
    }

    if(has_network('CBS Sports Network')) {
      var carriage_fees_d17 = dollars_to_number(carriage_fees['CBS Sports Network'][carriage_fees_d]);
      var carriage_fees_b17 = dollars_to_number(carriage_fees['CBS Sports Network'][carriage_fees_b]);
      amount += (rights_fees_c14/2)/carriage_fees_d17 * carriage_fees_b17 * 12
    }

    update_amount('NCAA Basketball Tournament', amount);
  };

  var recalculateNIT = function () {
    var amount = 0;

    // ='Rights Fees'!C16/('Carriage Fees'!D4+'Carriage Fees'!D5+'Carriage Fees'!D6)*('Carriage Fees'!B4+'Carriage Fees'!B5+'Carriage Fees'!B6)*12
    if(has_espn(true)) {
      var rights_fees_c16 = dollars_to_number(rights_fees['NIT - ESPN'][rights_fees_c]);
      var carriage_fees_d4 = dollars_to_number(carriage_fees['ESPN'][carriage_fees_d]);
      var carriage_fees_d5 = dollars_to_number(carriage_fees['ESPN2'][carriage_fees_d]);
      var carriage_fees_d6 = dollars_to_number(carriage_fees['ESPNU'][carriage_fees_d]);
      var carriage_fees_b4 = dollars_to_number(carriage_fees['ESPN'][carriage_fees_b]);
      var carriage_fees_b5 = dollars_to_number(carriage_fees['ESPN2'][carriage_fees_b]);
      var carriage_fees_b6 = dollars_to_number(carriage_fees['ESPNU'][carriage_fees_b]);
      amount += rights_fees_c16 / (carriage_fees_d4 + carriage_fees_d5 + carriage_fees_d6) *
                (carriage_fees_b4 + carriage_fees_b5 + carriage_fees_b6) * 12;
    }

    update_amount('NIT', amount);
  };

  var recalculateNCAA = function() {
    var amount = 0;

    // ='Rights Fees'!C15/('Carriage Fees'!D4+'Carriage Fees'!D5+'Carriage Fees'!D6)*('Carriage Fees'!B6+'Carriage Fees'!B5+'Carriage Fees'!B4)*12
    if(has_espn(true)) {
      var rights_fees_c15 = dollars_to_number(rights_fees['NCAA (other) - ESPN'][rights_fees_c]);
      var carriage_fees_d4 = dollars_to_number(carriage_fees['ESPN'][carriage_fees_d]);
      var carriage_fees_d5 = dollars_to_number(carriage_fees['ESPN2'][carriage_fees_d]);
      var carriage_fees_d6 = dollars_to_number(carriage_fees['ESPNU'][carriage_fees_d]);
      var carriage_fees_b4 = dollars_to_number(carriage_fees['ESPN'][carriage_fees_b]);
      var carriage_fees_b5 = dollars_to_number(carriage_fees['ESPN2'][carriage_fees_b]);
      var carriage_fees_b6 = dollars_to_number(carriage_fees['ESPNU'][carriage_fees_b]);
      amount += rights_fees_c15 / (carriage_fees_d4 + carriage_fees_d5 + carriage_fees_d6) *
                (carriage_fees_b4 + carriage_fees_b5 + carriage_fees_b6) * 12;
    }

    update_amount('Other NCAA Sports', amount);
  };

  var recalculateACC = function() {
    var amount = 0;

    if(has_espn()) {
      var rights_fees_c27 = dollars_to_number(rights_fees['ACC - ESPN'][rights_fees_c]);
      var carriage_fees_d4 = dollars_to_number(carriage_fees['ESPN'][carriage_fees_d]);
      var carriage_fees_d5 = dollars_to_number(carriage_fees['ESPN2'][carriage_fees_d]);
      var carriage_fees_b4 = dollars_to_number(carriage_fees['ESPN'][carriage_fees_b]);
      var carriage_fees_b5 = dollars_to_number(carriage_fees['ESPN2'][carriage_fees_b]);
      amount += rights_fees_c27 / (carriage_fees_d4 + carriage_fees_d5) *
                (carriage_fees_b4 + carriage_fees_b5) * 12;
    }

    update_amount('ACC', amount);
  };

  var recalculateBigEast = function() {
    var amount = 0;

    //='Rights Fees'!C28/('Carriage Fees'!D4+'Carriage Fees'!D5)*('Carriage Fees'!B4+'Carriage Fees'!B5)*12+
    if(has_espn(false)) {
      var rights_fees_c28 = dollars_to_number(rights_fees['Big East - ESPN'][rights_fees_c]);
      var carriage_fees_d4 = dollars_to_number(carriage_fees['ESPN'][carriage_fees_d]);
      var carriage_fees_d5 = dollars_to_number(carriage_fees['ESPN2'][carriage_fees_d]);
      var carriage_fees_b4 = dollars_to_number(carriage_fees['ESPN'][carriage_fees_b]);
      var carriage_fees_b5 = dollars_to_number(carriage_fees['ESPN2'][carriage_fees_b]);
      amount += rights_fees_c28 / (carriage_fees_d4 + carriage_fees_d5) *
                (carriage_fees_b4 + carriage_fees_b5) * 12;
    }

    // 'Rights Fees'!C29/'Carriage Fees'!D17*'Carriage Fees'!B17*12
    if(has_network('CBS Sports Network')) {
      var rights_fees_c29 = dollars_to_number(rights_fees['Big East - CBS'][rights_fees_c]);
      var carriage_fees_d17 = dollars_to_number(carriage_fees['CBS Sports Network'][carriage_fees_d]);
      var carriage_fees_b17 = dollars_to_number(carriage_fees['CBS Sports Network'][carriage_fees_b]);
      amount += rights_fees_c29/carriage_fees_d17*carriage_fees_b17*12;
    }

    update_amount('Big East', amount);
  };

  var recalculateBigTen = function() {
    var amount = 0;

    //='Rights Fees'!C23/('Carriage Fees'!D4+'Carriage Fees'!D5)*('Carriage Fees'!B4+'Carriage Fees'!B5)*12+
    if(has_espn(false)) {
      var rights_fees_c23 = dollars_to_number(rights_fees['Big Ten - ESPN'][rights_fees_c]);
      var carriage_fees_d4 = dollars_to_number(carriage_fees['ESPN'][carriage_fees_d]);
      var carriage_fees_d5 = dollars_to_number(carriage_fees['ESPN2'][carriage_fees_d]);
      var carriage_fees_b4 = dollars_to_number(carriage_fees['ESPN'][carriage_fees_b]);
      var carriage_fees_b5 = dollars_to_number(carriage_fees['ESPN2'][carriage_fees_b]);
      amount += rights_fees_c23 / (carriage_fees_d4 + carriage_fees_d5) *
                (carriage_fees_b4 + carriage_fees_b5) * 12;
    }

    //'Rights Fees'!C24/'Carriage Fees'!D24*'Carriage Fees'!B24*12+
    if(has_network("Big Ten Network")) {
      var rights_fees_c24 = dollars_to_number(rights_fees['Big Ten - Big Ten Network'][rights_fees_c]);
      var carriage_fees_d24 = dollars_to_number(carriage_fees['Big Ten Network'][carriage_fees_d]);
      var carriage_fees_b24 = dollars_to_number(carriage_fees['Big Ten Network'][carriage_fees_b]);
      amount += rights_fees_c24 / carriage_fees_d24 * carriage_fees_b24 * 12;
    }

    //'Rights Fees'!C25/'Carriage Fees'!D17*'Carriage Fees'!B17*12+
    if(has_network("CBS Sports Network")) {
      var rights_fees_c25 = dollars_to_number(rights_fees['Big Ten - CBS'][rights_fees_c]);
      var carriage_fees_d17 = dollars_to_number(carriage_fees['CBS Sports Network'][carriage_fees_d]);
      var carriage_fees_b17 = dollars_to_number(carriage_fees['CBS Sports Network'][carriage_fees_b]);
      amount += rights_fees_c25 / carriage_fees_d17 * carriage_fees_b17 * 12;
    }

    //'Rights Fees'!C26/'Carriage Fees'!D13*'Carriage Fees'!B13*12
    if(has_network("Fox College Sports")) {
      var rights_fees_c26 = dollars_to_number(rights_fees['Big Ten - Fox College Sports'][rights_fees_c]);
      var carriage_fees_d13 = dollars_to_number(carriage_fees['Fox College Sports'][carriage_fees_d]);
      var carriage_fees_b13 = dollars_to_number(carriage_fees['Fox College Sports'][carriage_fees_b]);
      amount += rights_fees_c26 / carriage_fees_d13 * carriage_fees_b13 * 12;
    }

    update_amount('Big Ten', amount);
  };

  var recalculateBigTwelve = function() {
    var amount = 0;

    //='Rights Fees'!C17/('Carriage Fees'!D4+'Carriage Fees'!D5)*('Carriage Fees'!B5+'Carriage Fees'!B4)*12+
    if(has_espn(false)) {
      var rights_fees_c17 = dollars_to_number(rights_fees['Big 12 - ESPN'][rights_fees_c]);
      var carriage_fees_d4 = dollars_to_number(carriage_fees['ESPN'][carriage_fees_d]);
      var carriage_fees_d5 = dollars_to_number(carriage_fees['ESPN2'][carriage_fees_d]);
      var carriage_fees_b4 = dollars_to_number(carriage_fees['ESPN'][carriage_fees_b]);
      var carriage_fees_b5 = dollars_to_number(carriage_fees['ESPN2'][carriage_fees_b]);
      amount += rights_fees_c17 / (carriage_fees_d4 + carriage_fees_d5) *
                (carriage_fees_b4 + carriage_fees_b5) * 12;
    }

    // 'Rights Fees'!C18/'Carriage Fees'!D12*'Carriage Fees'!B12*12
    if(has_network('Fox College Sports')) {
      var rights_fees_c18 = dollars_to_number(rights_fees['Big 12 - Fox College Sports'][rights_fees_c]);
      var carriage_fees_d13 = dollars_to_number(carriage_fees['Fox College Sports'][carriage_fees_d]);
      var carriage_fees_b13 = dollars_to_number(carriage_fees['Fox College Sports'][carriage_fees_b]);
      amount += rights_fees_c18 / carriage_fees_d13 * carriage_fees_b13 * 12;
    }

    update_amount('Big 12', amount);
  };

  var recalculatePacTwelve = function() {
    var amount = 0;

    // ='Rights Fees'!C19/('Carriage Fees'!D4+'Carriage Fees'!D5)*('Carriage Fees'!B5+'Carriage Fees'!B4)*12+
    if(has_espn(false)) {
      var rights_fees_c19 = dollars_to_number(rights_fees['Pac-12 - ESPN'][rights_fees_c]);
      var carriage_fees_d4 = dollars_to_number(carriage_fees['ESPN'][carriage_fees_d]);
      var carriage_fees_d5 = dollars_to_number(carriage_fees['ESPN2'][carriage_fees_d]);
      var carriage_fees_b4 = dollars_to_number(carriage_fees['ESPN'][carriage_fees_b]);
      var carriage_fees_b5 = dollars_to_number(carriage_fees['ESPN2'][carriage_fees_b]);
      amount += rights_fees_c19 / (carriage_fees_d4 + carriage_fees_d5) *
                (carriage_fees_b4 + carriage_fees_b5) * 12;
    }

    // 'Rights Fees'!C20/'Carriage Fees'!D25*'Carriage Fees'!B25*12
    if(has_network("Pac-12 Network")) {
      var rights_fees_c20 = dollars_to_number(rights_fees['Pac-12 - Pac-12 Network'][rights_fees_c]);
      var carriage_fees_d25 = dollars_to_number(carriage_fees['Pac-12 Network'][carriage_fees_d]);
      var carriage_fees_b25 = dollars_to_number(carriage_fees['Pac-12 Network'][carriage_fees_b]);
      amount += rights_fees_c20 / carriage_fees_d25 * carriage_fees_b25 * 12;
    }

    update_amount("Pac-12", amount);
  };

  var recalculateSEC = function() {
    var amount = 0;

    // ='Rights Fees'!C21/'Carriage Fees'!D17*'Carriage Fees'!B17*12+
    if(has_network('CBS Sports Network')) {
      var rights_fees_c21 = dollars_to_number(rights_fees['SEC - CBS'][rights_fees_c]);
      var carriage_fees_d17 = dollars_to_number(carriage_fees['CBS Sports Network'][carriage_fees_d]);
      var carriage_fees_b17 = dollars_to_number(carriage_fees['CBS Sports Network'][carriage_fees_b]);
      amount += rights_fees_c21 / carriage_fees_d17 * carriage_fees_b17 * 12;
    }

    //'Rights Fees'!C22/('Carriage Fees'!D4+'Carriage Fees'!D5)*('Carriage Fees'!B5+'Carriage Fees'!B4)*12
    if(has_espn(false)) {
      var rights_fees_c22 = dollars_to_number(rights_fees['SEC - ESPN'][rights_fees_c]);
      var carriage_fees_d4 = dollars_to_number(carriage_fees['ESPN'][carriage_fees_d]);
      var carriage_fees_d5 = dollars_to_number(carriage_fees['ESPN2'][carriage_fees_d]);
      var carriage_fees_b4 = dollars_to_number(carriage_fees['ESPN'][carriage_fees_b]);
      var carriage_fees_b5 = dollars_to_number(carriage_fees['ESPN2'][carriage_fees_b]);
      amount += rights_fees_c22 / (carriage_fees_d4 + carriage_fees_d5) *
                (carriage_fees_b4 + carriage_fees_b5) * 12;
    }

    update_amount("SEC", amount);
  };

  var recalculateCosts = function() {
    $.each([
      recalculateNFL,
      recalculateMLB,
      recalculateNBA,
      recalculateMLS,
      recalculateEPL,
      recalculateNCAATourney,
      recalculateNIT,
      recalculateNCAA,
      recalculateACC,
      recalculateBigEast,
      recalculateBigTen,
      recalculateBigTwelve,
      recalculatePacTwelve,
      recalculateSEC
    ], function(index, fun) {
      fun();
    });

    return true;
  };

  var ajax_status = 0;
  var fetchJSON = function(url, object) {
    ajax_status -= 1;
    $.getJSON(url, function(data) {
      $.each(data, function(key, val) {
        object[key] = val;
      });
      ajax_status += 1;
      if(ajax_status == 0 && $("input:checkbox:checked", container).size() > 0) {
        recalculateCosts();
      }
    });
    return object;
  };
  fetchJSON("carriage_fees.json", carriage_fees);
  fetchJSON("rights_fees.json", rights_fees);

  var writeLeagueBlock = function(to, league) {
    var league_block = $('<div class="league_block"></div>');
    league_block.data("amount", 0);
    league_block.appendTo(to);

    var amount = $('<div class="league_amount">$$$</div>');
    amount.appendTo(league_block);

    var name = $('<div class="league_name">' + league + '</div>');
    name.appendTo(league_block);

    league_blocks[league] = league_block;
  };

  var writeLeagueRow = function(to, id_suffix, leagues) {
    var row_block = $('<div class="league_row" id="league_row_' + id_suffix + '"></div>');
    for(var i = 0; i < leagues.length; i++) {
      writeLeagueBlock(row_block, leagues[i]);
    }
    row_block.appendTo(to);
  };

  var writeNetworkBlock = function(to, network) {
    var network_block = $('<div class="network_block"></div>');
    var checkbox = $('<input type="checkbox"></input>');
    checkbox.appendTo(network_block);
    $('<span class="network_label">' + network + '</span>').appendTo(network_block);
    network_block.appendTo(to);  // Now should be on the page

    network_checkboxes[network] = checkbox;
  };

  var writeNetworkColumn = function(to, id_suffix, networks) {
    var network_column = $('<div class="network_column" id="network_column_' + id_suffix + '"></div>');
    for(var i = 0; i < networks.length; i++) {
      writeNetworkBlock(network_column, networks[i]);
    }
    network_column.appendTo(to);
  };


  container.append("<h1>Leagues</h1>");

  writeLeagueRow(container, "top", [
    "NFL", "MLB", "NBA", "NHL", "MLS", "EPL"
  ]);
  writeLeagueRow(container, "bottom", [
    "NCAA Basketball Tournament", "NIT", "Other NCAA Sports", "ACC",
    "Big East", "Big Ten", "Big 12", "Pac-12", "SEC"
  ]);

  container.append("<h3>(Amounts are in $USD per year.)</h3>");

  container.append("<h2>Click on the Networks You Currently Receive from your Pay TV Service</h2>");

  writeNetworkColumn(container, "left", [
    "ESPN", "ESPN2", "ESPNU", "TBS", "TNT", "TruTV"
  ]);
  writeNetworkColumn(container, "middle", [
    "CBS Sports Network", "NBC Sports Network", "Fox Sports Net",
    "Fox College Sports", "Fox Soccer Channel", "Galavision"
  ]);
  writeNetworkColumn(container, "right", [
    "NFL Network", "MLB Network", "NBA TV", "NHL Network",
    "Big Ten Network", "Pac-12 Network"
  ]);

  $("input:checkbox", container).each(function() {
    $(this).click(function() {
      if(ajax_status == 0) recalculateCosts();
      return true;
    });
  });

});
