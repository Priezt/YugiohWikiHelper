$(init);

function init(){
	console.log("init");
	chrome.extension.onRequest.addListener(request_handler);
	chrome.tabs.onUpdated.addListener(checkForValidUrl);
}

function request_handler(req, sender, send_response){
	console.log("get request: " + req.func);
	if(req.func == 'search_image'){
		console.log("search image: " + req.card_name);
		var keyword = req.card_name + "+" + STR_YUGIOH;
		console.log("keyword: " + keyword);
		var url = "http://www.google.com.hk/search?tbm=isch&hl=en-US&source=hp&biw=1155&bih=627&q=" + keyword + "&gbv=2&oq=" + keyword + "&aq=f&aqi=&aql=&gs_sm=s";
		console.log("url: " + url);
		$.get(url, function(data){
			data = fetch_html(data);
			//console.log(data);
			send_response({'result': data});
		});
	}else if(req.func == 'test'){
		send_response({'result':'test result'});
	}
}

function checkForValidUrl(tabId, changeInfo, tab){
	if(tab.url.indexOf("http://yugioh-wiki.net/") >= 0){
		console.log("found yugioh wiki tab");
		chrome.pageAction.show(tabId);
	}
}


