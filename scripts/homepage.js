function refreshForecast(){
  var lat = localStorage.getItem("latitude");
  var long = localStorage.getItem("longitude");
  var name = localStorage.getItem("locationName");
  $("#forecast").remove();
  var $forecast = $("<iframe>", {
    id: "forecast",
    "type": "text/html"
  });
  if(lat != null && long != null){
    $forecast.attr("src", "http://forecast.io/embed/#lat=" + lat + "&lon=" + long + "&name=" + name);
  }
  else{
    $forecast.attr("src", "http://forecast.io/embed/#lat=42.3583&lon=-71.0603&name=Downtown Boston");
  }

  $("#forecastContainer").append($forecast);
}

function geoCode(){
  var loc = $("#locInput").val();
  loc = loc.split(" ").join("+");
  var locUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + loc + "&key=AIzaSyCsarhD-9HTc4cQQqCtRa2uDlF-OJNPH50";
  $.ajax({
    url: locUrl,
    dataType: "json",
    success: function(result){
      var res = result.results[0];
      localStorage.setItem("locationName", res.address_components[2].short_name);
      localStorage.setItem("latitude", res.geometry.location.lat);
      localStorage.setItem("longitude", res.geometry.location.lng);
      refreshForecast();
    }
  });
}

function checkEnter(e){
  if(e.keyCode == 13){
    geoCode();
  }
}

function overflown(e){
  if (e.offsetHeight < e.scrollHeight || e.offsetWidth < e.scrollWidth) {
    return true;
  } else {
    return false;
  }
}

function fillNext(){
  var r = parseInt(sessionStorage.getItem("curRSS"));
  $("#prevButton").attr("class", "page-item");
  $("#prevButton").removeAttr("tabindex");
  fillRSS();
}

function fillPrev(){
  var r = parseInt(sessionStorage.getItem("curRSS"));
  var set = r - parseInt(sessionStorage.getItem("step")) * 2;
  if(set <= 0){
    set = 0;
    $("#prevButton").attr("class", "page-item disabled");
    $("#prevButton").attr("tabindex", "-1");
  }
  else{
    $("#prevButton").attr("class", "page-item");
    $("#prevButton").removeAttr("tabindex");
  }
  sessionStorage.setItem("curRSS", set);
  fillRSS();
}

function fillRSS() {
  $("#rssFeed").empty();
  var $loadingIcon = $("<img>", {
    "src": "resources/gears.svg",
    "id": "loading"
  });
  $("#rssFeed").append($loadingIcon);

  var url = 'http://rss.cnn.com/rss/cnn_topstories.rss';
  feednami.load(url,function(result){
    if(result.error){
      console.log(result.error);
    }
    else{
      $("#rssFeed").empty();
      entries = result.feed.entries;
      var cur = parseInt(sessionStorage.getItem("curRSS"));
      var i = cur;
      while (!overflown(document.getElementById("rssFeed"))) {
        var d = new Date();
        var time = Math.round((d.getTime() - entries[i].date_ms) / 1000);
        if(time >= 60){
          time = Math.round(time / 60);
          if(time >= 60){
            time = Math.round(time / 60);
            if(time >= 24){
              time += " days";
            }
            else{
              time += " hours";
            }
          }
          else{
            time += " minutes";
          }
        }
        else{
          time += " seconds";
        }
        time += " ago";

        var $card = $("<div>", {
          "class": "card text-xs-center"
        });
        var $header = $("<div>", {
          "class": "card-header",
          "text": time
        });
        $card.append($header);
        var $title = $("<h3>", {
          "class": "card-title",
          "text": entries[i].title
        });
        $card.append($title);
        var summary = entries[i].summary;
        var ind = summary.indexOf('<div class="feedflare">');
        var $text = $("<p>", {
          "class": "card-title",
          "text": summary.substring(0, ind)
        });
        $card.append($text);
        var $anchor = $("<a>", {
          "href": entries[i].link,
          "target": "_blank"
        });
        var $link = $("<div>", {
          "class": "card-footer",
          "text": "Read More"
        });
        $anchor.append($link);
        $card.append($anchor);

        $("#rssFeed").append($card);
        i++;
      }
      sessionStorage.setItem("step", (i - 1) - cur);
      sessionStorage.setItem("curRSS", i - 1);

      $("#rssFeed").children("div").last().remove();
      if(overflown(document.getElementById("rssFeed"))){
        $("#rssFeed").children("div").last().remove();
      }
    }
  });
}

$(document).ready(function(){
  sessionStorage.setItem("curRSS", 0);
  var $greeting = $("#greeting");
  var date = new Date();
  var hours = date.getHours();
  if(hours < 12) {
    $greeting.text("Good Morning!");
  }
  else if(hours < 19){
    $greeting.text("Good Afternoon!");
  }
  else{
    $greeting.text("Good Evening!");
  }

  $("#prevButton").attr("class", "page-item disabled");
  $("#prevButton").attr("tabindex", "-1");

  refreshForecast();
  fillRSS();
});