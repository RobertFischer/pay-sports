(function() {
	var domain = window.location.pathname;  // Set to the domain and/or path where the files below live
																					// e.g. "http://mydomain.com/pay-sports" or "/pay-sports"

	document.write('<link rel="stylesheet" type="text/css" href="' + domain + 'pay-sports.css">');
	document.write('<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>');
	document.write('<script>$.paysports_domain = "' + domain + '";</script>');
	document.write('<script src="' + domain + 'pay-sports-code.js"></script>');
})();
