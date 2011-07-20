var helper_content_visible = false;

$(init);

function init(){
	console.log("init");
	cache_card_effect();
	//append_control_panel();
	inject_css();
	inject_mass_parts();
	bind_events();
	load_card_image();
}

function cache_card_effect(){
	var card_name = get_card_name();
	if(card_name && card_name.length > 0){
		var effect_pre = $("#body > pre");
		if(effect_pre.size() > 0){
			var effect_text = effect_pre.text();
			localStorage["effect:" + card_name] = effect_text;
			console.log("card effect cached: " + card_name);
		}
	}
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

function check_card_effect(){
	//console.log("check card effect");
	var card_name = rip_card_name($(this).text());
	if(localStorage["effect:" + card_name]){
		var effect = localStorage["effect:" + card_name];
		console.log(card_name + ": " + effect);
		var card_div = $("<div></div>");
		card_div.attr("id", "card_effect_div");
		card_div.addClass("card_effect_div");
		var offset = $(this).offset();
		var div_left = offset.left;
		var div_top = offset.top + 40;
		card_div.css("left", div_left+"px");
		card_div.css("top", div_top+"px");
		card_div.html("<pre>"+effect+"</pre>");
		$("body").append(card_div);
	}
}

function hide_card_effect(){
	//console.log("hide card effect");
	$("#card_effect_div").remove();
}

function bind_events(){
	$("#helper_title").click(toggle_help_content);
	$('"div[id^="helper_command_"]').addClass("helper_command");
	$("#helper_command_search_image").click(search_image);
	var card_link_count = 0;
	var card_string = "";
	$("a").each(function(){
		var card_name = rip_card_name($(this).text());
		if(card_name.length > 0){
			$(this).hover(check_card_effect, hide_card_effect);
			card_link_count++;
			card_string += card_name + ", ";
		}
	});
	console.log("card link event bind: " + card_link_count);
	console.log(card_string);
}

function inject_mass_parts(){
	$("#body h2").first().append($("<div id=\"helper_command_search_image\">"+STR_SEARCH_IMAGE+"</div>"));
	var card_image_container = $("<div id=\"card_image_container\"></div>");
	card_image_container.insertAfter($("#body h2").first());
	card_image_container.hide();
}

function inject_css(){
	$("head").append(content_css.getString());
}

function append_control_panel(){
	//console.log(control_panel_html.getString());
	$(control_panel_html.getString()).insertBefore("#header");
	$("#helper_title").hover(
		function(){
			$(this).addClass("title_hover");
		},
		function(){
			$(this).removeClass("title_hover");
		}
	);
	$("#helper_content").hide();
}

function get_hex_of_string(str){
	var result = "";
	for(var c=0;c<str.length;c++){
		result += str.substr(c, 1);
		result += "(" + str.charCodeAt(c).toString(16) + ")";
		result += ", ";
	}
	return result;
}

function get_card_name(){
	var result = $("#header .title a").text();
	if(result){
		//console.log(get_hex_of_string(result));
		var start_pos = result.indexOf(unescape("%u300a"));
		var end_pos = result.indexOf(unescape("%u300b"));
		//console.log(start_pos+","+end_pos);
		if(start_pos >= 0 && end_pos >= 0){
			result = result.substr(start_pos + 1, end_pos - start_pos - 1);
		}
	}
	return result;
}

function get_google_image_real_url(url){
	var start_pos = url.indexOf("imgurl=") + 7;
	var end_pos = url.indexOf("imgrefurl=");
	return url.substr(start_pos, end_pos - start_pos - 1);
}

function search_image(){
	console.log("search image");
	var card_name = get_card_name();
	if(card_name){
		var data = {
			'func': 'search_image',
			'card_name': card_name
		};
		chrome.extension.sendRequest(data, function(response){
			//console.log(response.result);
			data = response.result;
			cache_hidden_html(data);
			var imgsrc_array = new Array();
			jsearch('.rg_l').slice(0,10).each(function(){
				//console.log($(this).attr("href"));
				var href = $(this).attr("href");
				//href = "http://www.google.com" + href;
				href = get_google_image_real_url(href);
				//$(this).attr("href", href);
				imgsrc_array.push(href);
				console.log(href);
			});
			show_result_image(imgsrc_array);
		});
	}
}

function show_result_image(imgsrc_array){
	$("#card_image_container").empty();
	$("#card_image_container").show();
	$("#card_image_container").append($("<div>"+STR_CHOOSE_IMAGE+":</div>"));
	//$("#card_image_container").append($("<br>"));
	for(var c=0;c<imgsrc_array.length;c++){
		var img = $("<img>");
		img.attr("src", imgsrc_array[c]);
		img.addClass("card_image");
		$("#card_image_container").append(img);
	}
	$("#card_image_container").append($("<br>"));
	$("#card_image_container").append($("<div id=\"cancel_select_image\">"+STR_CANCEL+"</div>"));
	$("#cancel_select_image").addClass("helper_command");
	$("#cancel_select_image").click(function(){
		$("#card_image_container").hide();
	});
	$(".card_image").click(function(){
		var card_image_src = $(this).attr("src");
		$("#card_image_container").hide();
		save_card_image(card_image_src);
		load_card_image();
	});
}

function save_card_image(card_image_src){
	var card_name = get_card_name();
	localStorage["img:" + card_name] = card_image_src;
}

function load_card_image(){
	var card_name = get_card_name();
	if(localStorage["img:" + card_name]){
		var imgsrc = localStorage["img:" + card_name];
		$("#image_of_the_card").remove();
		var image_of_the_card = $("<img>");
		image_of_the_card.attr("src", imgsrc);
		image_of_the_card.attr("id", "image_of_the_card");
		//$("#body h2").first().append(image_of_the_card);
		$("#body pre").first().css("display", "inline-block");
		image_of_the_card.insertAfter($("#body pre").first());
		$("<br>").insertAfter(image_of_the_card);
	}
}

function toggle_help_content(){
	if(helper_content_visible){
		helper_content_visible = false;
		$("#helper_content").hide("slow");
	}else{
		helper_content_visible = true;
		$("#helper_content").show("slow");
	}
}

function content_css(){
	/*
<style>
#helper_title {
	display: inline-block;
	cursor: pointer;
	font-weight: bold;
	margin: 2px;
}
.title_hover {
	color: #F00;
	background-color: #DDD;
}
#helper_container {
	display: inline-block;
	border-style: dashed;
	border-color: #CCC;
	border-width: 1px;
}
.helper_command {
	display: inline-block;
	border-style: solid;
	border-color: #666;
	border-width: 1px;
	margin: 5px;
	padding: 5px;
	cursor: pointer;
	background-color: #CCC;
	font-size: 12px;
}
#card_image_container {
	display: inline-block;
	background-color: #DEF;
}
.card_image {
	height: 200px;
	margin: 5px;
	border-style: solid;
	border-width: 2;
	border-color: #C88;
	cursor: pointer;
}
#cancel_select_image {
	display: inline-block;
	border-style: solid;
	border-width: 1px;
	border-color: #666;
	cursor: pointer;
}
#image_of_the_card {
	display: inline-block;
	height: 200px;
	border-style: solid;
	border-width: 3px;
	border-color: #666;
	margin: 5px;
	padding: 5px;
}
.card_effect_div {
	display: block;
	position: absolute;
	z-index: 1000;
	border-style: solid;
	border-width: 2;
	border-color: #C88;
	background-color: #88C;
}
</style>
	*/
}

function control_panel_html(){
	/*
<div id="helper_container">
	<div id="helper_title">
		YuGiOh Wiki Helper
	</div>
	<div id="helper_content">
		<hr>
	</div>
</div>
	*/
}
