"use strict";

class TelegramChart {

  constructor(chartData, chartIndex, documentElement) {
    // this.ctx = documentElement.getContext("2d");
    this.graph = new Graph(chartData, chartIndex, this);
    this.chartDom = new ChartDom(this, documentElement);
    this.track = new Track(this);
    this.graph.buildLineCheckbox();
    this.maxLabel = 0;
    this.maxWidth = this.chartDom.canvas.offsetWidth;
    this.draw();
  }

  setVerticalLabels() {
    const graphLines = this.graph.graphLines.filter(graph => graph.visible);
    this.maxLabel = Math.max(...graphLines.map(graphLine => graphLine.maxPoint));
    let verticalLabels = [0];
    let labelsCountPercent = 100/VERTICAL_LABELS_COUNT;
    let currentPercent = 100/VERTICAL_LABELS_COUNT;
    for (let i = 0; i < VERTICAL_LABELS_COUNT; i++) {
      verticalLabels.push(Math.round((currentPercent / 100) * this.maxLabel));
      currentPercent = currentPercent + labelsCountPercent
    }
    const activeName = graphLines.length
      ? graphLines.find(graph => graph.maxPoint === this.maxLabel).name
      : "";
    let k = 0;
    for (let j = 0; j < this.chartDom.labels_vertical.length; j++) {
      const label = this.chartDom.labels_vertical[j];
      if (label.dataset.name === activeName) {
        if (!label.innerText) {
          label.innerText = verticalLabels[k];
        }
        k++;
        label.classList.remove("label--hidden", "label--hide");
        label.classList.add('label--show')
      } else {
        label.classList.remove('label--show');
        label.classList.add('label--hide');
      }
    }
    clearTimeout(this.timeoutId);
    this.timeoutId = window.setTimeout(() => {
      for (let j = 0; j < this.chartDom.labels_vertical.length; j++) {
        const label = this.chartDom.labels_vertical[j];
        if (label.dataset.name !== activeName) {
          label.classList.remove('label--hide');
          label.classList.add('label--hidden');
        }
      }
    }, 300);
    // console.log('verticalLabels', verticalLabels);
  }

  setHorizontalLabels() {
    console.log('this.graph', this.graph);
    for (let i = 0; i < this.graph.dates.length; i++) {
      this.chartDom.labels_horizontal[i].innerText = this.graph.dates[i];
    }
    // this.chartDom.chartDates = column.map(timeStamp => this.dateLabel(timeStamp));
  }

  updateCanvas() {
    this.chartDom.canvas.width = this.chartDom.chart__scrollable.offsetWidth;
    this.chartDom.chartMap.width = this.chartDom.chart__main.offsetWidth;
    this.graph.drawLines();
  }

  updateCanvasWidth() {
    const trackWidth = this.chartDom.chartTrack.offsetWidth;
    const mapWidth = this.chartDom.chartMap.offsetWidth;
    const changedPercent = trackWidth*100/mapWidth;
    const newWidth = this.maxWidth*(1-changedPercent/100);
    this.chartDom.canvas.style.width = (newWidth < mapWidth) ? mapWidth + "px" : newWidth + "px";
  }

  scrollCanvas(currentTrackScroll) {
    const mainWidth = this.chartDom.chart__main.offsetWidth;
    const maxTrackScroll = mainWidth - this.chartDom.chartTrack.offsetWidth;
    const scrollPercentOfTrack = 100/(maxTrackScroll/currentTrackScroll);
    const scrollableTranslateX = -(((this.chartDom.chart__scrollable.offsetWidth-mainWidth)/100)*scrollPercentOfTrack);
    this.chartDom.chart__scrollable.style.transform = "translateX("+ scrollableTranslateX +"px)";
  }

  getMapTrackWidth() {
    const mapLabelWidth = this.chartDom.chartMap.width / this.chartDom.labels_horizontal.length;
    return (mapLabelWidth * 6); // TODO replace 12 to dynamic canvas labels
  }

  setMapTrackWidth() {
    this.chartDom.chartTrack.style.width = this.getMapTrackWidth() + "px";
  }

  draw() {
    this.setVerticalLabels();
    this.setHorizontalLabels();
    this.updateCanvas();
    this.setMapTrackWidth()
    // this.ruler.render();
  }

}

class ChartDom {

  constructor(chart, documentElement) {
    this.chart = chart;
    this.documentFragment = document.createDocumentFragment();
    this.chart__main = null;
    this.chart__map = null;
    this.chart__graphs = null;
    this.chart__scrollable = null;
    this.labels_vertical_list = null;
    this.labels_horizontal_list = null;
    this.ctx = null;
    this.mapCtx = null;
    this.labels_vertical = [];
    this.labels_horizontal = [];
    this.buildStaticDom(documentElement);
  }

  buildStaticDom(documentElement) {

    /*** 0) add main element needed class ***/
    documentElement.classList.add('charts');

    /*** 1) add chart element ***/
    this.chartElement = document.createElement("div");
    this.chartElement.classList.add("chart");

    /*** 3) add chart body, map, graphs ***/
    ["chart__main", "chart__map", "chart__graphs"].forEach(className => {
      this[className] = document.createElement(className === "chart__graphs" ? "ul" : "div");
      this[className].classList.add(className);
      this.documentFragment.appendChild(this[className]);
    });

    /*** 4) add chart__scrollable ***/
    this.chart__scrollable = document.createElement("div");
    this.chart__scrollable.classList.add("chart__scrollable");
    this.chart__main.appendChild(this.chart__scrollable);

    /*** 5) add main canvas ***/
    this.canvas = document.createElement("canvas");
    this.canvas.classList.add("chart__canvas");
    this.canvas.style.height = "200px"; //TODO set dynamic height
    this.canvas.height = 200; //TODO set dynamic height
    this.chart__scrollable.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    /*** 6) add chart__labels ***/
    ["vertical", "horizontal"].forEach(className => {
      const labelList = "labels_"+className+"_list";
      this[labelList] = document.createElement("ul");
      this[labelList].classList.add("chart__labels", "chart__labels--"+className);
      this[className === "vertical" ? "chart__main" : "chart__scrollable"].appendChild(this[labelList]);
    });

    /*** 7) add static vertical__labels ***/
    const labelHeight = 22;
    this.chart.graph.graphLines.forEach(graphLine => {
      for (let i = 0; i < VERTICAL_LABELS_COUNT; i++) {
        const labelElement = document.createElement("li");
        labelElement.classList.add('label');
        labelElement.dataset.name = graphLine.name;
        labelElement.style.top = (this.canvas.height*(VERTICAL_LABELS_COUNT-i)/VERTICAL_LABELS_COUNT - labelHeight)+"px";
        this.labels_vertical.push(labelElement);
        this.labels_vertical_list.appendChild(labelElement);
      }
    });

    /*** 7) add static horizontal__labels ***/
    for (let j = 0; j < this.chart.graph.dates.length; j++) {
      // const graphLabel = this.chart.graph.dates[j];
      const labelElement = document.createElement("li");
      labelElement.classList.add('label');
      this.labels_horizontal.push(labelElement);
      this.labels_horizontal_list.appendChild(labelElement);
    }

    /*** 8) add chart map ***/
    this.chartMap = document.createElement("canvas");
    this.chartMap.classList.add("chart__canvas-map");
    this.chartMap.height = 40; //TODO set dynamic height
    this.chart__map.appendChild(this.chartMap);
    /*** 9) add chart map track & resize divs***/
    this.chartTrack = document.createElement("div");
    this.chartTrack.classList.add("chart__track");
    this.chart__map.appendChild(this.chartTrack);
    this.mapCtx = this.chartMap.getContext('2d');
    this.chartTrackLeft = document.createElement("div");
    this.chartTrackLeft.classList.add("track", "track--left");
    this.chartTrackRight = document.createElement("div");
    this.chartTrackRight.classList.add("track", "track--right");
    this.chartTrack.appendChild(this.chartTrackLeft);
    this.chartTrack.appendChild(this.chartTrackRight);

    /*** 10) add everything to element ***/
    this.chartElement.appendChild(this.documentFragment);

    /*** 11) add everything to charts list ***/
    documentElement.appendChild(this.chartElement);

  }

}

class Graph {
  constructor(graph, graphIndex, chart) {
    this.chart = chart;
    this.colors = graph.colors;
    this.names = graph.names;
    this.types = graph.types;
    this.graphLines = this.setGraphLines(graph.columns);
    this.dates = this.setDates(graph.columns);
    this.graphIndex = graphIndex;
  }

  setGraphLines(columns) {
    return Object.keys(this.types)
      .filter(graphLineName => {
        return this.types[graphLineName] !== GRAPH_TYPES.x;
      })
      .map(graphLineName => {
        let graphLinePoints = columns.find(column => column[0] === graphLineName);
        graphLinePoints.shift();
        return new GraphLine(graphLineName, graphLinePoints, this.colors[graphLineName])
      });
  }

  setDates(columns) {
    let timeStamps = columns.find(column => column[0] === GRAPH_TYPES.x);
    timeStamps.shift();
    // console.log('======================')
    let newMonth = "";
    return timeStamps.map(timeStamp => {
      const date = new Date(timeStamp);
      const dateDay = date.getDate();
      if (!newMonth || dateDay === 1) { // this operation costs a lot of JS time, so we need to call it rarely
        newMonth = date.toLocaleString("en-us", { month: "short" });
      }
      return (dateDay % 2 === 0 ) ? newMonth + " " + dateDay : null
    }).filter(date => date);
    // return timeStamps
  }

  toggleLineCheckbox(graphLine) {
    console.log(this, graphLine);
    graphLine.visible = !graphLine.visible;
    const chartDom = this.chart.chartDom;
    this.chart.setVerticalLabels();
    /*** update vertical label ***/
    chartDom.ctx.clearRect(0, 0, chartDom.canvas.width, chartDom.canvas.height);
    chartDom.mapCtx.clearRect(0, 0, chartDom.chartMap.width, chartDom.chartMap.height);
    this.drawLines();
    /*** update canvas ***/
  }

  buildLineCheckbox() {
    this.graphLines.forEach((graphLine, graphLineIndex) => {
      this.chart.chartDom.chart__graphs.appendChild(
        new UiCheckbox(
          this.colors[graphLine.name],
          graphLine.visible,
          this.names[graphLine.name],
          this.toggleLineCheckbox.bind(this, graphLine),
          this.graphIndex.toString() + graphLineIndex.toString()
        )
      )
    });
  }

  drawLines() {

    const
      chartDom      = this.chart.chartDom,
      maxLabel      = this.chart.maxLabel,
      ctx           = chartDom.ctx,
      canvasHeight  = chartDom.canvas.height,
      labelWidth    = chartDom.canvas.width / chartDom.labels_horizontal.length,
      mapCtx        = chartDom.mapCtx,
      mapHeight     = chartDom.chartMap.height,
      mapLabelWidth = chartDom.chartMap.width / this.graphLines[0].points.length;

    this.graphLines
      .filter(graphLine => graphLine.visible)
      .forEach(graphLine => {
        const firstPoint = graphLine.points[0];
        const startY = GraphLine.getPointY(firstPoint, maxLabel, canvasHeight);
        const startMapY = GraphLine.getPointY(firstPoint, maxLabel, mapHeight);
        ctx.beginPath(); // Start a new path
        ctx.moveTo(0, startY); // Move the pen to start position
        mapCtx.beginPath(); // Start a new map path
        mapCtx.moveTo(0, startMapY); // Move the map pen to start position
        for (let i = 1; i < graphLine.points.length; i++) {
          const point = graphLine.points[i];
          const pointX = i*labelWidth/2; // get X for every point (should be center of the label)
          const pointY = GraphLine.getPointY(point, maxLabel, canvasHeight); // get Y for every point
          ctx.lineTo(pointX, pointY);  // Draw a line to the point
          // ctx.fillText(point, pointX, pointY);
          const pointMapX = i*mapLabelWidth; // get X for evetoFixedry map point (should be center of the label)
          // console.log(i, pointMapX);
          const pointMapY = GraphLine.getPointY(point, maxLabel, mapHeight);
          mapCtx.lineTo(pointMapX, pointMapY);  // Draw a line to the map point
          // mapCtx.fillText(point, pointMapX, pointMapY);
        }
        ctx.lineWidth = 2;
        ctx.strokeStyle = graphLine.color;
        ctx.stroke(); // Render the line
        mapCtx.strokeStyle = graphLine.color;
        mapCtx.stroke(); // Render the map line
      });
  }
}

class GraphLine {
  constructor(name, points, color) {
    this.name = name;
    this.visible = true;
    this.points = points;
    this.color = color;
    this.maxPoint = Math.max(...points);
  }

  static getPointY(point, maxLabel, canvasHeight) {
    const percentOfHeight = (point*100)/maxLabel; // calculate percent of real height canvas
    return canvasHeight - (canvasHeight*percentOfHeight)/100; // calculate Y of current height canvas
  }
}

class Track {
  constructor(chart) {
    this.chart = chart;
    this.track = chart.chartDom.chartTrack;
    this.chartTrackLeft = chart.chartDom.chartTrackLeft;
    this.chartTrackRight = chart.chartDom.chartTrackRight;
    this.track = chart.chartDom.chartTrack;
    this.chart__map = chart.chartDom.chart__map;
    this.setOnResize();
    this.setOnDrag();
  }

  setOnResize() {
    ["Left", "Right"].forEach((direction) => {
      const resizeEl = this["chartTrack"+direction];
      resizeEl.ondragstart = function() {
        return false;
      };
      resizeEl.onmousedown = (e) => {
        if (!this.isDragging) {
          this.isResizing = true;
          const trackCoords = Track.getCoords(this.track);  // get coordinates of the track div
          const mapCoords = Track.getCoords(this.chart__map); // get coordinates of the chart map div
          const shiftX = e.pageX - trackCoords.left;  // calculate startX
          const trackLeft = +this.track.style.left.split("px")[0];
          const startX = e.pageX;  // calculate startX
          const startWidth = this.track.offsetWidth; // get start width
          const maxWidth = (direction === "Right")
            ? this.chart__map.offsetWidth - trackLeft // get max width
            : trackLeft + startWidth;
          const minWidth = this.chart.getMapTrackWidth();
          document.onmousemove = (e) => {
            const shiftWidth = e.pageX - startX;
            let newWidth = (direction === "Right") ? startWidth + shiftWidth : startWidth - shiftWidth;
            if (newWidth > maxWidth) {
              newWidth = maxWidth
            } else if (newWidth < minWidth) {
              newWidth = minWidth
            }
            if (direction === "Left") {
              let newLeft = e.pageX - shiftX - mapCoords.left; // new position
              if (newLeft < 0) {
                newLeft = 0;
                if (this.track.offsetWidth !== maxWidth) {
                  this.track.style.width = maxWidth + "px";
                }
              } else if (newLeft <= trackLeft) {
                this.track.style.width = newWidth + "px";
              }
              if (newLeft <= trackLeft) {
                this.track.style.left = newLeft + "px";
              } else {
                this.track.style.left = trackLeft + "px";
                if (this.track.offsetWidth !== startWidth) {
                  this.track.style.width = startWidth + "px";
                }
              }
            } else {
              this.track.style.width = newWidth + "px";
              this.chart.updateCanvasWidth();
            }
          };

          document.onmouseup = () => {
            this.isResizing = false;
            document.onmousemove = document.onmouseup = null;
          };
        }
        return false; // disable selection start (cursor change)

      };
    });
  }

  setOnDrag() {
    this.track.ondragstart = function() {
      return false;
    };
    this.track.onmousedown = (e) => {
      if (!this.isResizing) {
        this.isDragging = true;
        const trackCoords = Track.getCoords(this.track);  // get coordinates of the track div
        const mapCoords = Track.getCoords(this.chart__map); // get coordinates of the chart map div
        const shiftX = e.pageX - trackCoords.left;  // calculate startX

        document.onmousemove = (e) => {
          let newLeft = e.pageX - shiftX - mapCoords.left; // new position
          newLeft = (newLeft < 0) ? 0 : newLeft; // cursor outside of the canvas (left side)
          const rightEdge = this.chart__map.offsetWidth - this.track.offsetWidth;
          newLeft = (newLeft > rightEdge) ? rightEdge : newLeft; // cursor outside of the canvas (right side)
          this.track.style.left = newLeft + 'px';
          this.chart.scrollCanvas(newLeft);
        };

        document.onmouseup = () => {
          this.isDragging = false;
          document.onmousemove = document.onmouseup = null;
        };
      }

      return false; // disable selection start (cursor change)

    };

  }

  static getCoords(elem) {
    const box = elem.getBoundingClientRect();
    return {
      top: box.top + pageYOffset,
      left: box.left + pageXOffset,
      width: box.width
    };
  }
}

