function SearchObject(){
	this.search_cb = function(searcher){
		console.log("here");
	};
}

$(init);

function init(){
	console.log("init");
	chrome.extension.onRequest.addListener(request_handler);
	chrome.tabs.onUpdated.addListener(checkForValidUrl);
	load_google_api();
	register_context_menu();
}

function register_context_menu(){
	var id = chrome.contextMenus.create({
		'title': STR_FAVORITE_CARD,
	    	'contexts': ['link'],
	    	'onclick': favorite_card_click
	});
}

function get_card_name_by_url(url){
	//var escaped_text = url.replace(/^.*\?/, "");
	//return unescape(escaped_text);
	$.get(url, get_card_cb_function(url));
}

function get_card_cb_function(_url){
	var result = function(data){
		var html = $(data);
		var title = html.find(".title a");
		var url = _url;
		if(title.size() > 0){
			var title_name = title.first().text();
			var card_name = rip_card_name(title_name);
			if(card_name.length > 0){
				add_to_favorite(card_name, url);
			}
		}
	}
	return result;
}

function rip_card_name(txt){
	var result = "";
	if(txt){
		var start_pos = txt.indexOf(unescape("%u300a"));
		var end_pos = txt.indexOf(unescape("%u300b"));
		if(start_pos >= 0 && end_pos >= 0){
			result = txt.substr(start_pos + 1, end_pos - start_pos - 1);
		}
	}
	return result;
}

function add_to_favorite(card_name, url){
	console.log("add to favorite: " + card_name);
	var favorite_list = new Array();
	if(localStorage['favorite_list']){
		favorite_list = JSON.parse(localStorage['favorite_list']);
	}
	favorite_list.push(card_name);
	localStorage['favorite_list'] = JSON.stringify(favorite_list);
}

function clear_card_link_url(url){
	return url.replace(/plugin=related\&/, "").replace(/page=/, "");
}

function favorite_card_click(info, tab){
	//console.log(info);
	get_card_name_by_url(clear_card_link_url(info.linkUrl.toString()));
}

function load_google_api(){
	console.log("load google api");
	google.load('search', '1');
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
	}else if(req.func == "bing_search_image"){
		console.log("bing search image: " + req.card_name);
		var keyword = req.card_name + "+" + STR_YUGIOH;
		console.log("keyword: " + keyword);
		var url = "http://www.bing.com/images/search?q=" + keyword;
		console.log("url: " + url);
		$.get(url, function(data){
			data = fetch_html(data);
			html = $(data);
			//console.log(data);
			result = new Array();
			html.find("img[class='sg_t']").slice(0,10).each(function(){
				var imgsrc = $(this).attr("src").toString().replace(/^.*\&url=/, "");
				console.log("before unescape: " + imgsrc);
				imgsrc = unescape(imgsrc);
				console.log("after unescape: " + imgsrc);
				result.push(imgsrc);
			});
			send_response({'result': result});
		});
	}else if(req.func == 'google_search_image'){
		console.log("google search image: " + req.card_name);
		var keyword = req.card_name + "+" + STR_YUGIOH;
		console.log("keyword: " + keyword);
		var sobj = new SearchObject();
		var imageSearch = new google.search.ImageSearch();
		console.log("image search object created");
		/*
		imageSearch.setSearchCompleteCallback(this, function(searcher){
			var img_list = new Array();
			console.log("image search callback");
			if(searcher.results && searcher.results.length > 0){
				for(var i=0;i<10;i++){
					var result = results[i];
					console.log(result.tbUrl);
					img_list.push(result.tbUrl);
				}
			}
			send_response({'result': JSON.stringify(img_list)});
		}, [imageSearch]);
		*/
		imageSearch.setSearchCompleteCallback(sobj, SearchObject.prototype.search_cb);
		console.log("before execute");
		google.search.ImageSearch.RawCompletion = function(dummy, searcher){
			console.log("yeah, hijack");
			var img_list = new Array();
			console.log("image search callback");
			//console.log(JSON.stringify(searcher));
			console.log(searcher);
			if(searcher.results && searcher.results.length > 0){
				for(var i=0;i<4;i++){
					var result = searcher.results[i];
					console.log(result.url);
					img_list.push(result.url);
				}
			}
			send_response({'result': JSON.stringify(img_list)});
		};
		imageSearch.execute(keyword);
	}else if(req.func == 'test'){
		send_response({'result':'test result'});
	}else if(req.func == 'favorite_card_list'){
		var result = "[]";
		if(localStorage["favorite_list"]){
			result = localStorage["favorite_list"];
		}
		send_response({'result':result});
	}else if(req.func == 'deck_list'){
		var result = "[]";
		if(localStorage["decks"]){
			result = localStorage["decks"];
		}
		send_response({'result':result});
	}else if(req.func == 'reset_favorite'){
		localStorage["favorite_list"] = JSON.stringify([]);
		send_response({'result':'nothing'});
	}else if(req.func == 'delete_favorite'){
		if(localStorage["favorite_list"]){
			var fl = JSON.parse(localStorage["favorite_list"]);
			console.log("delete favorite: " + fl[req.index]);
			fl.splice(req.index, 1);
			localStorage["favorite_list"] = JSON.stringify(fl);
		}
		send_response({'result':'nothing'});
	}else if(req.func == 'delete_deck'){
		if(localStorage["decks"]){
			var dl = JSON.parse(localStorage["decks"]);
			console.log("delete deck: " + dl[req.index]);
			dl.splice(req.index, 1);
			localStorage["decks"] = JSON.stringify(dl);
		}
		send_response({'result':'nothing'});
	}else if(req.func == 'save_deck'){
		var fl = new Array();
		if(localStorage["favorite_list"]){
			var fl = JSON.parse(localStorage["favorite_list"]);
		}
		localStorage["deck:" + req.name] = JSON.stringify(fl);
		console.log("save deck: " + req.name);
		add_deck(req.name);
		send_response({'result':'nothing'});
	}else if(req.func == 'load_deck'){
		var deck_name = req.name;
		if(localStorage["deck:" + deck_name]){
			console.log("load deck: " + deck_name);
			localStorage["favorite_list"] = localStorage["deck:" + req.name];
		}
		send_response({'result':'nothing'});
	}
}

function add_deck(deck_name){
	var decks = new Array();
	if(localStorage['decks']){
		decks = JSON.parse(localStorage['decks']);
	}
	if($.inArray(deck_name, decks) < 0){
		decks.push(deck_name);
	}
	localStorage['decks'] = JSON.stringify(decks);
}

function checkForValidUrl(tabId, changeInfo, tab){
	if(tab.url.indexOf("http://yugioh-wiki.net/") >= 0){
		console.log("found yugioh wiki tab");
		chrome.pageAction.show(tabId);
	}
}


