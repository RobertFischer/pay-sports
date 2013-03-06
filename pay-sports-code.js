jQuery.noConflict();
jQuery(function($) {

	var rights_fees = {};

	var carriage_fees = {
		NETWORK: "Network",
		MONTHLY_FEE: "Sub fee per month",
		HOMES: "Homes (millions)",
		AMOUNT: "Per Year (millions)"
	};

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

  var network_checked = function(network) {
    return network_checkboxes[network].is(":checked");
  }

  var update_amount = function(league, amount) {
		$(function() {
			var block = league_blocks[league];
			$('.league_amount', block).text(number_to_dollars(amount));	
		});
  };

	var recalculate_costs = function() {
		$.each(rights_fees, function(index, league) {
			$(function() {
				recalculate_league_costs(league);
			});
		});
	};

	var recalculate_league_costs = function(league) {
		var amount = 0;
		$.each(rights_fees[league], function(index, network) {
			if(network_checked(network)) {
				if(is_league_network(league, network)) {
					amount += carriage_fees[network][carriage_fees.AMOUNT] * 12;
				} else {
					amount += rights_fees[league][network] / carriage_fees[network][carriage_fees.HOMES];
				}
			}
		});
		update_amount(league, amount);
	};

	var is_league_network = function(league, network) {
		if(league == "MLB" && network == "MLB Network") return true;
		if(league == "NFL" && network == "NFL Network") return true;
		if(league == "NBA" && network == "NBA TV") return true;
		if(league == "NHL" && network == "NHL TV") return true;
		return false;
	};

  var ajax_status = 0;
  var fetchJSON = function(url, object, dollar_fields, callback) {
    ajax_status -= 1;
    $.getJSON(url, function(data) {
      $.each(data, function(key, val) {
				if($.inArray(key, dollar_fields)) {
					val = dollars_to_number(dollar_fields);
				}
        object[key] = val;
      });
			if(callback) callback(data);
      ajax_status += 1;
			$(function() {
				if(ajax_status == 0 && $("input:checkbox:checked", container).size() > 0) {
					recalculate_costs();
				}
			});
    });
    return object;
  };
  fetchJSON("rights_fees.json", rights_fees, [], function() {
		$.each(rights_fees, function(index, league) {
			$.each(rights_fees[league], function(index, network) {
				rights_fees[league][network] = dollars_to_number(rights_fees[league][network]);
			});
		});

		fetchJSON("carriage_fees.json", carriage_fees, [carriage_fees.AMOUNT, carriage_fees.MONTHLY_FEE], function(cr_data) {
			$.each(cr_data, function(index, network) {
				check_network(network, "carriage_fees.json");
			});
		});
	});

	var check_league = function(league) {
		if(!$.inArray(league, rights_fees)) {
			alert("Unknown league: " + league + "\nOptions: " + $.makeArray(rights_fees).join(", "));
		}
	};

	var check_network = function(network, source) {
		var all_networks = [];
		$.each(rights_fees, function(index, league) {
			$.merge(all_networks, $.makeArray(rights_fees[league]));
		});
		all_networks = $.grep(all_networks, function(v,k) {
			return $.inArray(v,arr) === k;
		});
		if(!$.inArray(network, all_networks)) {
			alert("Unknown network found in " + source + ": " + network + "\nOptions: " + all_networks.join(", "));
		}
	};

  var writeLeagueBlock = function(to, league) {
		check_league(league);

    var league_block = $('<div class="league_block"></div>');
    league_block.data("amount", 0);
    league_block.appendTo(to);

    var amount = $('<div class="league_amount">$$$</div>');
    amount.appendTo(league_block);

    var name = $('<div class="league_name">' + league + '</div>');
    name.appendTo(league_block);

    league_blocks[league] = league_block;
  };

  var write_league_row = function(to, id_suffix, leagues) {
    var row_block = $('<div class="league_row" id="league_row_' + id_suffix + '"></div>');
    for(var i = 0; i < leagues.length; i++) {
      writeLeagueBlock(row_block, leagues[i]);
    }
    row_block.appendTo(to);
  };

  var writeNetworkBlock = function(to, network) {
		check_network(network, "network blocks");

    var network_block = $('<div class="network_block"></div>');
    var checkbox = $('<input type="checkbox"></input>');
    checkbox.appendTo(network_block);
    $('<span class="network_label">' + network + '</span>').appendTo(network_block);
    network_block.appendTo(to);  // Now should be on the page

    network_checkboxes[network] = checkbox;
  };

  var write_network_row = function(to, id_suffix, networks) {
    var network_column = $('<div class="network_row" id="network_row_' + id_suffix + '"></div>');
    for(var i = 0; i < networks.length; i++) {
      writeNetworkBlock(network_column, networks[i]);
    }
    network_column.appendTo(to);
  };

	$(function() {
		var network_container = $('<div id="network_container></div>');
		network_container.append($('<h3>Click on the Networks You Currently Receive from Your Pay TV Service</h3>'));
		network_container.appendTo(container);

		write_network_row(network_container, "first", [
			"ESPN (1/2)", "ESPNU", "TNT / TBS", "Fox Sports", "Fox Soccer",
			"NBC Sports Network", "CBS Sports Network"
		]);
		write_network_row(network_container, "second", [
			"NFL Network", "MLB Network", "NBA TV", "NHL Network", 
			"Big Ten Network", "Pac-12 Network", "Galavision"
		]);
	});

	$(function() {
		var leagues_container = $('<div id="leagues_container"></div>');
		leagues_container.append($('<h3>Here is How Much of Your Money Goes Directly to Major Pro and College Sports</h3>'));
		leagues_container.appendTo(container);

		write_league_row(leagues_container, "first", [ "NFL", "MLB", "NBA" ]);
		write_league_row(leagues_container, "second", [ "NHL", "MLS", "EPL" ]);
		write_league_row(leagues_container, "third", [ "NASCAR" ]);
		write_league_row(leagues_container, "empty", [ ]);
		write_league_row(leagues_container, "fourth", [ "BCS", "NCAA", "NIT" ]);
		write_league_row(leagues_container, "fifth", [ "ACC", "Big East", "Big Ten" ]);
		write_league_row(leagues_container, "sixth", [ "Big 12", "Pac-12", "SEC" ]);

		$("input:checkbox", leagues_container).each(function() {
			$(this).click(function() {
				if(ajax_status == 0) recalculateCosts();
				return true;
			});
		});
	});

});
