function buildCharts(chartsArray) {
  var chartList = document.getElementById("charts");
  chartsArray.forEach(function (chart, chartIndex) {
    new TelegramChart(chart, chartIndex, chartList)
  });
}

var xmlHttp = new XMLHttpRequest();

xmlHttp.onreadystatechange = function() {
  if (xmlHttp.readyState === XMLHttpRequest.DONE) {
    if (xmlHttp.status === 200) {
      buildCharts(JSON.parse(xmlHttp.responseText));
    } else if (xmlHttp.status === 400) {
      alert("No chart data found");
    }
    else {
      alert("something else other than 200 was returned");
    }
  }
};

xmlHttp.open("GET", "https://ucozlab.github.io/telegram_chart/data/chart-data.json", true);
xmlHttp.send();