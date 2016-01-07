jQuery.noConflict();
jQuery(function($) {

	var json_domain = $.paysports_domain;
	if(!json_domain) json_domain = window.location.pathname;

	var leagues_with_networks = ["NBA", "NHL", "NFL", "MLB", "SEC"];

	var league_aliases = {
		"Mtn West": "Mountain West",
		"Mountain West": "Mtn West"
	};

	var network_aliases = {
		NBC: "NBC Sports Network",
		CBS: "CBS Sports Network",
		Turner: "TNT / TBS",
		ESPN: "ESPN (1/2)",
		Fox: "Fox Sports (1/2)",
		FOX: "Fox Sports (1/2)",
		"Fox Sports": "Fox Sports (1/2)",
		"Fox Sports Networks": "Fox Sports (1/2)",
		"Mtn West": "Mountain West"
	};
	$.each(leagues_with_networks, function(idx,league) {
		network_aliases[league + " TV"] = league + " Network";
		network_aliases[league + " Network"] = league + " TV";
	});

	var rights_fees = {};

	var carriage_fees = {
		NETWORK: "Network",
		MONTHLY_FEE: "Sub fee per month",
		HOMES: "Homes (millions)",
		AMOUNT: "Per Year (millions)"
	};

  var league_blocks = {};
  var network_checkboxes = {};

  var container = $("div[pay-sports-2]");
	container = $("<center></center>").appendTo(container);

  var number_to_dollars = function(num) {
    if(isNaN(num)) {
			alert("Found NaN");
			return "$$$";
		}
    num = (Math.round(num*100)/100).toString();
    if(/^\d+$/.test(num)) {
      num = num + ".00";
    } else if(/^\d+\.\d$/.test(num)) {
      num = num + "0";
    }
    return "$" + num;
  };

  var dollars_to_number = function(it) {
    var no_dollars = it.replace(/^\$/, "");
		var no_commas = no_dollars.replace(/,/, "");
		var floatVal = parseFloat(no_commas);
		return floatVal;
  };

	var find_carriage_fees = function(network) {
		var it = carriage_fees[network];
		if(!it) {
			var alias = network_aliases[network];
			if(alias) it = carriage_fees[alias];
		}
		if(!it) {
			alert("Could not find carriage fees: " + network);
		}
		return it;
	};

	var network_checkbox = function(network) {
		var it = network_checkboxes[network];
		if(!it) {
			var alias = network_aliases[network];
			if(alias) it = network_checkboxes[alias];
		}
		if(!it) alert("Could not find checkbox for: " + network);
		return it;
	};

  var network_checked = function(network) {
		var it = network_checkbox(network);
		if(it) {
			return it.is(":checked");
		}
		return false;
  };

  var update_amount = function(league, amount) {
		$(function() {
			var block = league_blocks[league];
			if(!block) {
				var alias = league_aliases[league];
				if(alias) block = league_blocks[alias];
			}
			if(block) {
				$('.league_amount', block).text(number_to_dollars(amount));
			} else if(amount > 0) {
				alert("Could not find league block for :" + league);
			}
		});
  };


  var ajax_status = 0;
  var fetchJSON = function(url, object, callback) {
    ajax_status -= 1;
    $.getJSON(json_domain + url, function(data) {
      $.each(data, function(key, val) {
        object[key] = val;
      });
			if(callback) callback(data);
      ajax_status += 1;
			recalculate_costs();
    });
    return object;
  };
  fetchJSON("rights_fees.json", rights_fees, function() {
		$.each(rights_fees, function(league, networks) {
			$.each(networks, function(network, amount) {
				rights_fees[league][network] = dollars_to_number(amount);
			});
		});
	});

	fetchJSON("carriage_fees.json", carriage_fees, function(cr_data) {
		$.each(cr_data, function(network, data) {
			$.each(data, function(field, value) {
				if(field == carriage_fees.MONTHLY_FEE || field == carriage_fees.AMOUNT) {
					find_carriage_fees(network)[field] = dollars_to_number(value);
				}
			});
		});
	});

	var recalculate_league_costs = function(league, data) {
		var amount = 0;
		$.each(data, function(network, rights_fee) {
			if(network_checked(network)) {
				amount += rights_fee / find_carriage_fees(network)[carriage_fees.HOMES];
			}
		});
		if($.inArray(league, leagues_with_networks) >= 0) {
			$.each([' Network', ' TV'], function(index, suffix) {
				var network = league + suffix;
				if(network_checked(network) && find_carriage_fees(network)) {
					amount += find_carriage_fees(network)[carriage_fees.MONTHLY_FEE] * 12;
				}
			});
		}
		update_amount(league, amount);
		return amount;
	};

	var suspend_recalculation = false;
	var recalculate_costs = function() {
		if(ajax_status === 0 && !suspend_recalculation) {
			var amount = 0;
			$.each(rights_fees, function(league, data) {
				amount += recalculate_league_costs(league, data);
			});
			update_amount("Total", amount);
		}
	};

	var delay_recalculation = function(fun) {
		suspend_recalculation = true;
		fun();
		suspend_recalculation = false;
		recalculate_costs();
	};

  var writeLeagueBlock = function(to, id_suffix, league) {

    var league_block = $('<div class="league_block" id="league_block_' + id_suffix + '"></div>');
    league_block.data("amount", 0);
    league_block.appendTo(to);

    var amount = $('<div class="league_amount">$0.00</div>');
    amount.appendTo(league_block);

    var name = $('<div class="league_name">' + league + '</div>');
    name.appendTo(league_block);

    league_blocks[league] = league_block;
  };

  var write_league_row = function(to, id_suffix, leagues) {
    var row_block = $('<div class="league_row" id="league_row_' + id_suffix + '"></div>');
    for(var i = 0; i < leagues.length; i++) {
      writeLeagueBlock(row_block, id_suffix + "_" + i, leagues[i]);
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

  var write_network_row = function(to, id_suffix, networks) {
    var network_column = $('<div class="network_row" id="network_row_' + id_suffix + '"></div>');
    for(var i = 0; i < networks.length; i++) {
      writeNetworkBlock(network_column, networks[i]);
    }
    network_column.appendTo(to);
  };

	var write_network_summary_row = function(to, id_suffix) {
    var network_column = $('<div class="network_row" id="network_row_' + id_suffix + '"></div>');
		network_column.appendTo(to);

		// Check All Networks
		(function() {
			var network_block = $('<div class="network_block"></div>');
			network_block.appendTo(network_column);  // Now should be on the page
			var checkbox = $('<input type="radio" name="summary-options"  id="check-all-networks" summary-option></input>');
			checkbox.appendTo(network_block);
			$('<span class="network_label">All Networks</span>').appendTo(network_block);
			checkbox.click(function() {
				if(checkbox.is(":checked")) {
					delay_recalculation(function() {
						$(":checkbox:not(:checked):not([summary-option])", to).click();
					});
				}
			});
		})();

		// Check Most Common Networks (ESPN, Turner, Fox, NBC)
		(function() {
			var network_block = $('<div class="network_block"></div>');
			network_block.appendTo(network_column);  // Now should be on the page
			var checkbox = $('<input type="radio" name="summary-options" id="check-common-networks" summary-option></input>');
			checkbox.appendTo(network_block);
			$('<span class="network_label">Most Common Networks</span>').appendTo(network_block);
			checkbox.click(function() {
				if(checkbox.is(":checked")) {
					delay_recalculation(function() {
						$(":checkbox:checked:not([summary-option])", to).click();
						$.each(["ESPN", "Turner", "Fox", "NBC"], function(index, network) {
							network_checkbox(network).click();
						});
					});
				}
			});
		})();

		// Uncheck All
		(function() {
			var network_block = $('<div class="network_block"></div>');
			network_block.appendTo(network_column);  // Now should be on the page
			var checkbox = $('<input type="radio" name="summary-options" id="uncheck-all-networks" summary-option></input>');
			checkbox.appendTo(network_block);
			$('<span class="network_label">Uncheck Networks</span>').appendTo(network_block);
			checkbox.click(function() {
				if(checkbox.is(":checked")) {
					delay_recalculation(function() {
						$(":checkbox:checked:not([summary-option])", to).click();
					});
				}
			});
		})();

/*
		$(":checkbox", network_column).click(function() {
			var me = $(this);
			$(":checkbox:checked[id!='" + me.attr("id") + "']", network_column).attr("checked", false);
		});
*/

	};

	var network_container = $('<div id="network_container"></div>');
	network_container.append($('<h3>Click on the networks you currently receive from your pay TV service.</h3>'));
	network_container.appendTo(container);

	write_network_summary_row(network_container, "summary");
	$('<p class="network_divider"></p>').appendTo(network_container);

	write_network_row(network_container, "first", [
		"ESPN (1/2)", "ESPNU", "TNT / TBS", "Fox Sports (1/2)",
		"NBC Sports Network", "CBS Sports Network", "Galavision"
	]);
	write_network_row(network_container, "second", [
		"NFL Network", "MLB Network", "NBA TV", "NHL Network",
		"Big Ten Network", "Pac-12 Network", "SEC Network"
	]);


	var leagues_container = $('<div id="leagues_container"></div>');
	leagues_container.append($('<h3>Here is how much of your money those networks give to major pro and college sports each year.</h3>'));
	leagues_container.appendTo(container);

	write_league_row(leagues_container, "first", [ "NFL", "MLB", "NBA", "NHL" ]);
	write_league_row(leagues_container, "second", [ "MLS", "EPL", "FIFA", "UEFA" ]);
	write_league_row(leagues_container, "third", [ "NASCAR", "UFC" ]);
	write_league_row(leagues_container, "empty", [ ]);
	write_league_row(leagues_container, "fourth", [ "NCAA", "BCS", "ACC", "Big Ten" ]);
	write_league_row(leagues_container, "fifth", [ "Big 12", "Big East", "Pac-12", "SEC" ]);
	write_league_row(leagues_container, "sixth", [ "AAC", "C*USA", "Mtn West" ]);
	write_league_row(leagues_container, "total", [ "Total" ]);

	$('<h3 id="how_numbers_calculated">' +
		'<a href="http://www.whatyoupayforsports.com/numbers/">Click here to see how we calculate these numbers.</a>' +
		'</h3>').appendTo(container);

	$("input:checkbox:not([summary-option])", network_container).click(function() {
		recalculate_costs();
		if(!suspend_recalculation) $("input[summary-option]:checked", network_container).attr("checked", false);
	});

});
