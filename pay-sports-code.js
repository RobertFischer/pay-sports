jQuery.noConflict();
jQuery(function($) {

	var json_domain = $.paysports_domain;
	if(!json_domain) json_domain = window.location.pathname;

	var leagues_with_networks = ["NBA", "NHL", "NFL", "MLB"];

	var network_aliases = {
		NBC: "NBC Sports Network",
		CBS: "CBS Sports Network",
		Turner: "TNT / TBS",
		ESPN: "ESPN (1/2)",
		Fox: "Fox Sports Networks",
		FOX: "Fox Sports Networks",
		"Fox Sports": "Fox Sports Networks"
	};

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
  }

  var dollars_to_number = function(it) {
    var no_dollars = it.replace(/^\$/, "");
		var no_commas = no_dollars.replace(/,/, "");
		var floatVal = parseFloat(no_commas);
		return floatVal;
  };

	var network_checkbox = function(network) {
		var it = network_checkboxes[network];
		if(!it) {
			var alias = network_aliases[network];
			if(alias) it = network_checkboxes[alias];
		}
		return it;
	};

  var network_checked = function(network) {
		var it = network_checkbox(network);
		if(it) {
			return it.is(":checked");
		} 
		return false;
  }

  var update_amount = function(league, amount) {
		$(function() {
			var block = league_blocks[league];
			$('.league_amount', block).text(number_to_dollars(amount));	
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
					carriage_fees[network][field] = dollars_to_number(value);
				}
			});
		});
	});

	var recalculate_league_costs = function(league, data) {
		var amount = 0;
		$.each(data, function(network, rights_fee) {
			if(network_checked(network)) {
				var network_carriage_fees = carriage_fees[network];
				if(!network_carriage_fees) {
					var alias = network_aliases[network];
					if(alias) network_carriage_fees = carriage_fees[alias];
				}
				amount += rights_fee / network_carriage_fees[carriage_fees.HOMES];
			}
		});
		if($.inArray(league, leagues_with_networks) >= 0) {
			$.each([' Network', ' TV'], function(index, suffix) {
				var network = league + suffix;
				if(network_checked(network) && carriage_fees[network]) {
					amount += carriage_fees[network][carriage_fees.MONTHLY_FEE] * 12;
				}
			});	
		}
		update_amount(league, amount);
		return amount;
	};

	var suspend_recalculation = false;
	var recalculate_costs = function() {
		if(ajax_status == 0 && !suspend_recalculation) {
			var amount = 0;
			$.each(rights_fees, function(league, data) {
				amount += recalculate_league_costs(league, data);
			});
			update_amount("Total", amount);
		};
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
			var checkbox = $('<input type="checkbox" id="check-all-networks" summary-option></input>');
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
			var checkbox = $('<input type="checkbox" id="check-common-networks" summary-option></input>');
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
			var checkbox = $('<input type="checkbox" id="uncheck-all-networks" summary-option></input>');
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

		$(":checkbox", network_column).click(function() {
			var me = $(this);
			$(":checkbox:checked[id!='" + me.attr("id") + "']", network_column).attr("checked", false);
		});
		
	};

	var network_container = $('<div id="network_container"></div>');
	network_container.append($('<h3>Click on the Networks You Currently Receive from Your Pay TV Service</h3>'));
	network_container.appendTo(container);

	write_network_row(network_container, "first", [
		"ESPN (1/2)", "ESPNU", "TNT / TBS", "Fox Sports Networks", "Fox Soccer",
		"NBC Sports Network", "CBS Sports Network"
	]);
	write_network_row(network_container, "second", [
		"NFL Network", "MLB Network", "NBA TV", "NHL TV", 
		"Big Ten Network", "Pac-12 Network", "Galavision"
	]);

	$('<p class="network_divider"></p>').appendTo(network_container);
	write_network_summary_row(network_container, "summary");

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
	write_league_row(leagues_container, "total", [ "Total" ]);

	$("input:checkbox:not([summary-option])", network_container).click(function() {
		recalculate_costs();
		if(!suspend_recalculation) $("input[summary-option]:checked", network_container).attr("checked", false);
	});

});
