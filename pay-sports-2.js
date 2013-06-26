(function() {
	// Set to the domain and/or path where the files below live
	// e.g. "http://mydomain.com/pay-sports" or "/pay-sports"
	var domain = window.location.pathname;  
	// var domain = "http://www.whatyoupayforsports.com/code/";
	// var domain = "/code/";
	// var domain = "file:///Users/robert/wkdir/pay-sports/";

	document.write('<link rel="stylesheet" type="text/css" href="' + domain + 'pay-sports-2.css">');
	document.write('<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js"></script>');
	document.write('<script>$.paysports_domain = "' + domain + '";</script>');
	document.write('<script src="' + domain + 'pay-sports-code-2.js"></script>');
})();
