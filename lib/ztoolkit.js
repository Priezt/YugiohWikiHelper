Function.prototype.getString = function(){
	var lines = new String(this);
	lines = lines.substring(lines.indexOf("/*") + 3, lines.lastIndexOf("*/"));
	return lines;
}

function fetch_html(data){
	var result = _rip_body_html(data);
	result = _remove_script(result);
	result = _remove_on_event(result);
	return result;
}

function _rip_body_html(data){
	var result = data.match(/\<body[^\>]*\>([\s\S]*)\<\/body\>/i);
	//console.log(result);
	if(result && result.length >= 2){
		return result[1];
	}else{
		return "";
	}
}

function _remove_script(data){
	var result = data.replace(/\<(?:\!\-\-)?script[\s\S]+?\<\/script(?:\-\-)?\>/ig, "");
	return result;
}

function _remove_on_event(data){
	var result = data.replace(/ on[a-z]+\=\"[\s\S]*?\"/gi, " ");
	result = result.replace(/ on[a-z]+\=\'[\s\S]*?\'/gi, " ");
	return result;
}

function cache_hidden_html(html){
	console.log("cache hidden html");
	var hidden_html = $("#z_hidden_html");
	if(hidden_html.size() == 0){
		console.log("div not found, create one");
		hidden_html = $("<div></div>");
		hidden_html.attr("id", "z_hidden_html");
		$("body").append(hidden_html);
		hidden_html.hide();
	}
	console.log("inject html");
	hidden_html.html(html);
}

function jsearch(selector){
	selector = "#z_hidden_html " + selector;
	console.log("jsearch: " + selector);
	return $(selector);
}
