var xmlHttp = new XMLHttpRequest();

xmlHttp.onreadystatechange = function() {
  if (xmlHttp.readyState === XMLHttpRequest.DONE) {
    if (xmlHttp.status === 200) {
      const telegramChart = new TelegramChart(
        document.getElementById('canvas'),
        JSON.parse(xmlHttp.responseText)
      );
      telegramChart.draw();
    } else if (xmlHttp.status === 400) {
      alert('No chart data found');
    }
    else {
      alert('something else other than 200 was returned');
    }
  }
};

xmlHttp.open("GET", "chart-data.json", true);
xmlHttp.send();