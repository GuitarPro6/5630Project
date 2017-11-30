(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
	typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
	(factory((global.tubeMap = {}),global.d3));
}(this, (function (exports,d3) { 'use strict';

function tubeMap() {
  var margin = { top: 80, right: 80, bottom: 20, left: 80 };
  var width = 760;
  var height = 640;
  var xScale = d3.scaleLinear();
  var yScale = d3.scaleLinear();
  var xGeoScale = d3.scaleLinear();
  var yGeoScale = d3.scaleLinear();
  var lineWidth;
  var lineWidthMultiplier = 1.0;

  var dispatch$$1 = d3.dispatch("click");

  var svg;

  var model;

  var gEnter;
  var zoom$$1;

  var t;
  var s;

  function map(selection) {
    selection.each(function (data) {
      // Convert data to standard representation
      data = mangleData(data);

      model = data;

      var minX = d3.min(data.raw, function (line$$1) {
        return d3.min(line$$1.nodes, function (node) {
          return node.coords[0];
        });
      });
      var maxX = d3.max(data.raw, function (line$$1) {
        return d3.max(line$$1.nodes, function (node) {
          return node.coords[0];
        });
      });

      var minY = d3.min(data.raw, function (line$$1) {
        return d3.min(line$$1.nodes, function (node) {
          return node.coords[1];
        });
      });
      var maxY = d3.max(data.raw, function (line$$1) {
        return d3.max(line$$1.nodes, function (node) {
          return node.coords[1];
        });
      });

      var desiredAspectRatio = (maxX - minX) / (maxY - minY);
      var actualAspectRatio = (width - margin.left - margin.right) / (height - margin.top - margin.bottom);
      var ratioRatio = actualAspectRatio / desiredAspectRatio;

      var maxXRange, maxYRange;

      // Note that we flip the sense of the y-axis here
      if (desiredAspectRatio > actualAspectRatio) {
        maxXRange = width - margin.left - margin.right;
        maxYRange = (height - margin.top - margin.bottom) * ratioRatio;
      } else {
        maxXRange = (width - margin.left - margin.right) / ratioRatio;
        maxYRange = height - margin.top - margin.bottom;
      }

      // Update the x-scale
      xScale.domain([minX, maxX]).range([0, maxXRange]);

      // Update the y-scale
      yScale.domain([minY, maxY]).range([maxYRange, 0]);

      // Update the x-geo-scale
      xGeoScale.domain([d3.min(data.stations.toArray(), function (station) {
        if (station.position !== undefined) {
          return station.position.lon;
        }
      }), d3.max(data.stations.toArray(), function (station) {
        if (station.position !== undefined) {
          return station.position.lon;
        }
      })]).range([0, maxXRange]);

      // Update the y--geo-scale
      yGeoScale.domain([d3.min(data.stations.toArray(), function (station) {
        if (station.position !== undefined) {
          return station.position.lat;
        }
      }), d3.max(data.stations.toArray(), function (station) {
        if (station.position !== undefined) {
          return station.position.lat;
        }
      })]).range([maxYRange, 0]);

      // Update line width
      lineWidth = lineWidthMultiplier * (xScale(1) - xScale(0));

      // Select the svg element, if it exists
      svg = d3.select(this).selectAll("svg").data([data]);


      var g = svg.enter().append("svg").append("g");

      // Fill with white rectangle to capture zoom events
      g.append("rect").attr("width", "100%").attr("height", "100%").attr('fill', 'white');

      var zoomed = function zoomed() {
        gEnter.attr("transform", d3.event.transform.toString());
      };

      zoom$$1 = d3.zoom().scaleExtent([0.5, 6]).on("zoom", zoomed);

      gEnter = g.call(zoom$$1).append("g");

      var river = gEnter.append("g").attr("class", "river").selectAll("path").data(function (d) {
        return [d.river];
      });

      var lines = gEnter.append("g").attr("class", "line").attr("id", "line").selectAll("path").data(function (d) {
        return d.lines.lines;
      });

      var interchanges = gEnter.append("g").attr("class", "interchanges").selectAll("path").data(function (d) {
        return d.stations.interchanges();
      });

      var stations = gEnter.append("g").attr("class", "station").selectAll("path").data(function (d) {
        return d.stations.normalStations();
      });


      var labels = gEnter.append("g").attr("class", "labels").selectAll("text").data(function (d) {
        return d.stations.toArray();
      });

      var geoStations = gEnter.append("g").attr("class", "geoStations").style("display", "none").selectAll("path").data(function (d) {
        return d.stations.toArray();
      });

      var discrepencies = gEnter.append("g").attr("class", "discrepencies").style("display", "none").selectAll("path").data(function (d) {
        return d.stations.toArray();
      });

      // Update the outer dimensions
      svg.attr("width", '100%').attr("height", '100%');


      // Update the river
      river.enter().append("path").attr("d", drawLine).attr("stroke", "#C4E8F8").attr("fill", "none").attr("stroke-width", 1.8 * lineWidth);

			var self_item = this;
			var pathStorage = [];

			var markerFunction = d3.arc().innerRadius(0).outerRadius(lineWidth).startAngle(0).endAngle(2 * Math.PI);

      // Update the lines
      lines.enter().append("path")
          .attr("d", drawLine)
          .attr("id", function (d) {
              return d.title;
          })
          .attr("stroke", function (d) {
              return d.color;
          })
          .attr("fill", "none").attr("stroke-width", function (d) {
              return d.highlighted ? lineWidth * 1.3 : lineWidth;
          })
          .attr("class", function(d){
              return d.name;
          })
          .classed("line", true).on("click", function(){
              //Here we transform the path
              // keep this path so we can use it later
              var pathElement = d3.select(this).node();
              var pathSegList = pathElement.pathSegList;
              //d3.selectAll(".station-circle").remove();
              //var stations = d3.select("#map").selectAll(".station");
			  //console.log(stations);
			  //stations.filter("." + name);
          //Construct new path string
    		  var newPath = "M";
    		  var name = d3.select(this).attr("id");
    		  var lines = d3.select("#tube-map").selectAll(".line");
    		  //List that contains all names of the stations on selected line
  			  var stationOrder = [];
  			  //List that contains all the points together with the names
              var stationPoints = [];
              var lineName;
              lines.style("opacity",function(d){
                  if(d.title === name){
                      stationOrder = d.stations;
                      lineName = d.name;
                  }
              });
              //These are all the stations that are on the selected line
              var thisLineStations = d3.selectAll(".station").selectAll("." + lineName);
              //here we have the list of paths that correspond to the stations
			  var idIndicator = false;
			  var index = -1;

			  for(var k = 0; k < pathStorage.length; k++){
			      if(pathStorage[k].id != null){
			          if(pathStorage[k].id == name){
			              idIndicator = true;
			              index = k;
			          }
			      }
			  }
			  console.log(pathStorage);
              //The line is not currently transformed
			  if(idIndicator == false){
			      var path = d3.select(this).attr('d');
			      map.highlightLine(name);
			      //Store the old path to transition back to
                  pathStorage.push({"id": name, "path": path});
                  //Construct the object that ties names to stations and coordinates
		          for(var j = 0; j < stationOrder.length; j++){
		              if(j !== 0){
		                  newPath += "L" + (90 + j*90) + "," + 200;
		                  stationPoints.push({name: stationOrder[j], coords: [(90 + j*90), 200]});
		              }
		              else{
		                  newPath +=  (90) + "," + 200;
		                  stationPoints.push({name: stationOrder[j], coords: [(90), 200]});
		              }
		          }
			  }
			  else{
			      map.unhighlightAll();
			      newPath = pathStorage[index].path;
			      pathStorage.splice(index,1);
			  }

			  //Here we append circles that represent each station on the line
              var svgCir = d3.select("#line").selectAll("g").data(stationPoints);
			  svgCir.exit().remove();
			  svgCir = svgCir.enter().append("g").merge(svgCir);
			  svgCir.append("circle")
                  .attr("class", "station-circle")
                  .attr("cx", function(d,i){return d.coords[0]})
                  .attr("cy", function(d){ return d.coords[1]})
                  .attr("r", 6).style("visibility", "visible")
                  .on("click", function(d){})
                  .on("mouseover", function(d){})
                  .attr("stroke", fgColor)
                  .attr("fill", bgColor)
                  .attr("stroke-width", lineWidth / 2);

               //Set the staion names, first append g
              var station_text = d3.select("#line").selectAll("g").data(stationPoints);
              station_text.exit().remove();
              station_text = station_text.enter().append("g").attr("display", "inline").merge(station_text);
              console.log(stationPoints);

              var text = station_text.selectAll('text')
                  .data(stationPoints);
              text.exit().remove();
              text = text.enter()
                  .append('text').merge(text);
              //Set station names
              text.attr('x', function(d){
                  return d.coords[0] + 30;
                  })
                  .attr('y', function(d, i){
                      if (i % 2 === 0) {
                          return d.coords[1] + 20;
                      }
                      else return d.coords[1] - 20;
                  })
                  .attr("position", "absolute").attr("transform", function(d){
                      return "rotate(-45) translate(0%,0%)";
                  })
                  .text(function(d){
                      return d.name;
                  })
                  .attr("dy", ".3em")
                  .style("visibility", "visible")// change dx and dy in order to center in the circle.
                  .style("text-anchor", "end");
              d3.select(this).transition().duration(4000).attr("d", newPath);
          });


      var fgColor = "#000000";
      var bgColor = "#ffffff";



      // Update the interchanges
      interchanges.enter().append("g")
          .attr("id", function (d) {
              return d.name;
          })
          .on("click", function () {
              var label = d3.select(this);
              var name = label.attr("id");
              selectStation(name);
              dispatch$$1.call("click", this, name);
          })
          .append("path").attr("d", markerFunction).attr("transform", function (d) {
              return "translate(" + xScale(d.x + d.marker[0].shiftX * lineWidthMultiplier) + "," + yScale(d.y + d.marker[0].shiftY * lineWidthMultiplier) + ")";
          })
          .attr("stroke-width", lineWidth / 2).attr("fill", function (d) {
              return d.visited ? fgColor : bgColor;
          })
          .attr("stroke", function (d) {
              return d.visited ? bgColor : fgColor;
          })
          .classed("interchange", true).style("cursor", "pointer");

      var lineFunction = d3.line().x(function (d) {
          return xScale(d[0]);
      }).y(function (d) {
          return yScale(d[1]);
      });

      // Update the stations
      stations.enter().append("g").attr("id", function (d) {
          return d.name;
          })
          .on("click", function () {
              var label = d3.select(this);
              var name = label.attr("id");
              selectStation(name);
              dispatch$$1.call("click", this, name);
          })
          .append("path").attr("d", function (d) {
              var dir;
              var sqrt2 = Math.sqrt(2);

              switch (d.labelPos.toLowerCase()) {
                  case "n":
                      dir = [0, 1];
                      break;
                  case "ne":
                      dir = [1 / sqrt2, 1 / sqrt2];
                      break;
                  case "e":
                      dir = [1, 0];
                      break;
                  case "se":
                      dir = [1 / sqrt2, -1 / sqrt2];
                      break;
                  case "s":
                      dir = [0, -1];
                      break;
                  case "sw":
                      dir = [-1 / sqrt2, -1 / sqrt2];
                      break;
                  case "w":
                      dir = [-1, 0];
                      break;
                  case "nw":
                      dir = [-1 / sqrt2, 1 / sqrt2];
                      break;
                  default:
                      break;
              }
              return lineFunction([[d.x + d.shiftX * lineWidthMultiplier + lineWidthMultiplier / 2.05 * dir[0], d.y + d.shiftY * lineWidthMultiplier + lineWidthMultiplier / 2.05 * dir[1]], [d.x + d.shiftX * lineWidthMultiplier + lineWidthMultiplier * dir[0], d.y + d.shiftY * lineWidthMultiplier + lineWidthMultiplier * dir[1]]]);
          })
          .attr("stroke", function (d) {
              return d.color;
          })
          .attr("stroke-width", lineWidth / 2).attr("fill", "none").attr("class", function (d) {
              return d.line;
          })
          .attr("id", function (d) {
              return d.name;
          })
          .classed("station", true);

      // Update the label text
      labels.enter().append("g")
          .attr("id", function (d) {
              return d.name;
          })
          .classed("label", true).on("click", function () {
              var label = d3.select(this);
              var name = label.attr("id");
              selectStation(name);

              dispatch$$1.call("click", this, name);
          })
          .append("text").text(function (d) {
              console.log(d);
              return d.text;
          })
          .attr("dy", 0.1).attr("x", function (d) {
              return xScale(d.x + d.labelShiftX) + textPos(d).pos[0];
          })
          .attr("y", function (d) {
              return yScale(d.y + d.labelShiftY) - textPos(d).pos[1];
          }) // Flip y-axis
          .attr("text-anchor", function (d) {
              return textPos(d).textAnchor;
          })
          .style("display", function (d) {
              return d.hide !== true ? "block" : "none";
          })
          .style("font-size", 1.2 * lineWidth / lineWidthMultiplier + "px")
          .style("-webkit-user-select", "none")
          .attr("class", function (d) {
              return d.marker.map(function (marker) {
                  return marker.line;
              }).join(" ");
          })
          .classed("highlighted", function (d) {
              return d.visited;
          })
          .call(wrap);

      var markerGeoFunction = d3.arc().innerRadius(0).outerRadius(lineWidth / 4).startAngle(0).endAngle(2 * Math.PI);

      // Update the geo stations
      geoStations.enter().append("path")
          .attr("d", markerGeoFunction)
          .attr("transform", function (d) {
              return "translate(" + xGeoScale(d.position !== undefined ? d.position.lon : NaN) + "," + yGeoScale(d.position !== undefined ? d.position.lat : NaN) + ")";
          })
          .attr("id", function (d) {
              return d.name;
          })
          .attr("fill", '#888888');

      // Update the geo stations
      discrepencies.enter().append("path")
          .attr("d", function (d) {
              return d3.line()([[xScale(d.x), yScale(d.y)], [xGeoScale(d.position.lon), yGeoScale(d.position.lat)]]);
          })
          .attr("id", function (d) {
              return d.name;
          })
          .attr("stroke", '#AAAAAA').attr("stroke-width", lineWidth / 4).style("stroke-dasharray", "3, 3");
    });
  }

  map.width = function (w) {
    if (!arguments.length) return width;
    width = w;
    return map;
  };

  map.height = function (h) {
    if (!arguments.length) return height;
    height = h;
    return map;
  };

  map.margin = function (m) {
    if (!arguments.length) return margin;
    margin = m;
    return map;
  };

  map.highlightLine = function (name) {
      var lines = d3.select("#tube-map").selectAll(".line");
      var stations = d3.select("#tube-map").selectAll(".station");
      var labels = d3.select("#tube-map").selectAll(".labels");
      var interchanges = d3.select("#tube-map").selectAll(".interchanges");

      interchanges.style("visibility", "hidden");

      lines.style("visibility", function(e) {
          return (e.title === name) ? "visible" : "hidden";
      });

      stations.style("visibility", function(e) {
          return (e.title === name) ? "visible" : "hidden";
      });

      labels.style("visibility", function(e) {
          return (e.title === name) ? "visible" : "hidden";
      });
  };

	map.startTimer = function(csvData){

		//create a data structure that ties each station to the time passed through, and whether it was an entry or exit
		//Take that data and tie the count to the circles that will be at each staation


		//Start timer
	};

  map.unhighlightAll = function () {
    var lines = d3.select("#tube-map").selectAll(".line");
    var stations = d3.select("#tube-map").selectAll(".station");
    var labels = d3.select("#tube-map").selectAll(".labels");

    var interchanges = d3.select("#tube-map").selectAll(".interchanges");

    interchanges.style("visibility", "visible");

    lines.style("visibility", "visible");
    stations.style("visibility", "visible");
    labels.style("visibility", "visible");
  };

  map.unhighlightLine = function () {
    this.unhighlightAll();
  };

  map.highlightNearestStation = function (name) {
    var station = model.stations.stations[name];
  };

  map.centerOnPub = function (name) {
    if (name === undefined) return;

    var station = model.stations.stations[name];

    var width = window.innerWidth;
    var height = window.innerHeight;

    var scale = 2;

    t = [-scale * xScale(station.x) + width / 2, -scale * yScale(station.y) + height / 2];

    // FIXME: Need valid d3 v4 syntax for zooming
    zoom$$1.translateBy(t).scaleTo(2);
    gEnter.transition().duration(750).attr("transform", "translate(" + t[0] + "," + t[1] + ")scale(" + scale + ")");
  };

  map.addStation = function (name) {
    visitStation(name, true);
  };

  map.removeStation = function (name) {
    visitStation(name, false);
  };

  map.visitStations = function (visited) {
    d3.selectAll(".labels").select("text").classed("highlighted", false);
    visited.map(function (pub) {
      visitStation(pub, true);
    });
  };

  map.on = function (event$$1, callback) {
    dispatch$$1.on(event$$1, callback);
  };

  map.selectStation = function (name) {
    selectStation(name);
  };

  function selectStation(name) {
    d3.select(".labels").selectAll(".label").classed("selected", false);
    d3.select(".labels").select("#" + name).classed("selected", true);
  }

  function visitStation(name, highlighted) {
    d3.select(".labels").select("#" + name).select("text").classed("highlighted", highlighted);
  }

  function drawLine(data) {
    var path = "";

    var lineNodes = data.nodes;

    var unitLength = xScale(1) - xScale(0);

    var shiftCoords = [data.shiftCoords[0] * lineWidth / unitLength, data.shiftCoords[1] * lineWidth / unitLength];

    var lastSectionType = "diagonal"; // TODO: HACK

    var nextNode, currNode, xDiff, yDiff;
    var points;

    for (var lineNode = 0; lineNode < lineNodes.length; lineNode++) {
      if (lineNode > 0) {
        nextNode = lineNodes[lineNode];
        currNode = lineNodes[lineNode - 1];

        var direction = "";

        xDiff = Math.round(currNode.coords[0] - nextNode.coords[0]);
        yDiff = Math.round(currNode.coords[1] - nextNode.coords[1]);

        var lineEndCorrection = [0, 0];

        if (lineNode === lineNodes.length - 1) {
          if (xDiff == 0 || yDiff == 0) {
            if (xDiff > 0) lineEndCorrection = [-lineWidth / (4 * unitLength), 0];
            if (xDiff < 0) lineEndCorrection = [lineWidth / (4 * unitLength), 0];
            if (yDiff > 0) lineEndCorrection = [0, -lineWidth / (4 * unitLength)];
            if (yDiff < 0) lineEndCorrection = [0, lineWidth / (4 * unitLength)];
          } else {
            var sqrt2 = Math.sqrt(2);

            if (xDiff > 0 && yDiff > 0) lineEndCorrection = [-lineWidth / (4 * unitLength * sqrt2), -lineWidth / (4 * unitLength * sqrt2)];
            if (xDiff > 0 && yDiff < 0) lineEndCorrection = [-lineWidth / (4 * unitLength * sqrt2), lineWidth / (4 * unitLength * sqrt2)];
            if (xDiff < 0 && yDiff > 0) lineEndCorrection = [lineWidth / (4 * unitLength * sqrt2), -lineWidth / (4 * unitLength * sqrt2)];
            if (xDiff < 0 && yDiff < 0) lineEndCorrection = [lineWidth / (4 * unitLength * sqrt2), lineWidth / (4 * unitLength * sqrt2)];
          }
        }

        points = [[xScale(currNode.coords[0] + shiftCoords[0]), yScale(currNode.coords[1] + shiftCoords[1])], [xScale(nextNode.coords[0] + shiftCoords[0] + lineEndCorrection[0]), yScale(nextNode.coords[1] + shiftCoords[1] + lineEndCorrection[1])]];

        if (xDiff == 0 || yDiff == 0) {
          lastSectionType = "udlr";
          path += "L" + points[1][0] + "," + points[1][1];
        } else if (Math.abs(xDiff) == Math.abs(yDiff) && Math.abs(xDiff) > 1) {
          lastSectionType = "diagonal";
          path += "L" + points[1][0] + "," + points[1][1];
        } else if (Math.abs(xDiff) == 1 && Math.abs(yDiff) == 1) {
					if(nextNode.dir != null){
          direction = nextNode.dir.toLowerCase();
				}
				else{
					direction = "s";
				}

          switch (direction) {
            case "e":
              path += "Q" + points[1][0] + "," + points[0][1] + "," + points[1][0] + "," + points[1][1];
              break;
            case "s":
              path += "Q" + points[0][0] + "," + points[1][1] + "," + points[1][0] + "," + points[1][1];
              break;
            case "n":
              path += "Q" + points[0][0] + "," + points[1][1] + "," + points[1][0] + "," + points[1][1];
              break;
            case "w":
              path += "Q" + points[1][0] + "," + points[0][1] + "," + points[1][0] + "," + points[1][1];
              break;
          }
        } else if (Math.abs(xDiff) == 1 && Math.abs(yDiff) == 2 || Math.abs(xDiff) == 2 && Math.abs(yDiff) == 1) {
          var controlPoints;
          if (xDiff == 1) {
            if (lastSectionType == "udlr") {
              controlPoints = [points[0][0], points[0][1] + (points[1][1] - points[0][1]) / 2];
            } else if (lastSectionType == "diagonal") {
              controlPoints = [points[1][0], points[0][1] + (points[1][1] - points[0][1]) / 2];
            }
          } else if (xDiff == -1) {
            if (lastSectionType == "udlr") {
              controlPoints = [points[0][0], points[0][1] + (points[1][1] - points[0][1]) / 2];
            } else if (lastSectionType == "diagonal") {
              controlPoints = [points[1][0], points[0][1] + (points[1][1] - points[0][1]) / 2];
            }
          } else if (xDiff == -2) {
            if (lastSectionType == "udlr") {
              controlPoints = [points[0][0] + (points[1][0] - points[0][0]) / 2, points[0][1]];
            } else if (lastSectionType == "diagonal") {
              controlPoints = [points[0][0] + (points[1][0] - points[0][0]) / 2, points[1][1]];
            }
          } else if (xDiff == 2) {
            if (lastSectionType == "udlr") {
              controlPoints = [points[0][0] + (points[1][0] - points[0][0]) / 2, points[0][1]];
            } else if (lastSectionType == "diagonal") {
              controlPoints = [points[0][0] + (points[1][0] - points[0][0]) / 2, points[1][1]];
            }
          }

          path += "C" + controlPoints[0] + "," + controlPoints[1] + "," + controlPoints[0] + "," + controlPoints[1] + "," + points[1][0] + "," + points[1][1];
        }
      } else {
        nextNode = lineNodes[lineNode + 1];
        currNode = lineNodes[lineNode];

        xDiff = Math.round(currNode.coords[0] - nextNode.coords[0]);
        yDiff = Math.round(currNode.coords[1] - nextNode.coords[1]);

        var lineStartCorrection = [0, 0];

        if (xDiff == 0 || yDiff == 0) {
          if (xDiff > 0) lineStartCorrection = [lineWidth / (4 * unitLength), 0];
          if (xDiff < 0) lineStartCorrection = [-lineWidth / (4 * unitLength), 0];
          if (yDiff > 0) lineStartCorrection = [0, lineWidth / (4 * unitLength)];
          if (yDiff < 0) lineStartCorrection = [0, -lineWidth / (4 * unitLength)];
        } else {
          var sqrt2 = Math.sqrt(2);
          if (xDiff > 0 && yDiff > 0) lineStartCorrection = [lineWidth / (4 * unitLength * sqrt2), lineWidth / (4 * unitLength * sqrt2)];
          if (xDiff > 0 && yDiff < 0) lineStartCorrection = [lineWidth / (4 * unitLength * sqrt2), -lineWidth / (4 * unitLength * sqrt2)];
          if (xDiff < 0 && yDiff > 0) lineStartCorrection = [-lineWidth / (4 * unitLength * sqrt2), lineWidth / (4 * unitLength * sqrt2)];
          if (xDiff < 0 && yDiff < 0) lineStartCorrection = [-lineWidth / (4 * unitLength * sqrt2), -lineWidth / (4 * unitLength * sqrt2)];
        }

        points = [xScale(currNode.coords[0] + shiftCoords[0] + lineStartCorrection[0]), yScale(currNode.coords[1] + shiftCoords[1] + lineStartCorrection[1])];

        path += "M" + points[0] + "," + points[1];
      }
    }

    return path;
  }

  function mangleData(data) {
    var mangledData = {};

    // Data manipulation
    mangledData.raw = data.lines;
    mangledData.river = data.river;
    mangledData.stations = extractStations(data);
    mangledData.lines = extractLines(data.lines);

    return mangledData;
  }

  function extractStations(data) {

    data.lines.forEach(function (line$$1) {
      for (var node = 0; node < line$$1.nodes.length; node++) {
        var d = line$$1.nodes[node];

        if (!d.hasOwnProperty("name")) continue;

        if (!data.stations.hasOwnProperty(d.name)) throw new Error("Cannot find station with key: " + d.name);

        var station = data.stations[d.name];

				console.log(data.stations);

        station.x = d.coords[0];
        station.y = d.coords[1];

        if (station.labelPos === undefined) {
          station.labelPos = d.labelPos;
          station.labelShiftX = d.hasOwnProperty("shiftCoords") ? d.shiftCoords[0] : line$$1.shiftCoords[0];
          station.labelShiftY = d.hasOwnProperty("shiftCoords") ? d.shiftCoords[1] : line$$1.shiftCoords[1];
        }

        if (d.hasOwnProperty("canonical")) {
          station.labelShiftX = d.hasOwnProperty("shiftCoords") ? d.shiftCoords[0] : line$$1.shiftCoords[0];
          station.labelShiftY = d.hasOwnProperty("shiftCoords") ? d.shiftCoords[1] : line$$1.shiftCoords[1];
          station.labelPos = d.labelPos;
        }
        station.label = data.stations[d.name].title;
        station.text = data.stations[d.name].text;
        station.position = data.stations[d.name].position;
        station.visited = false;

        if (!d.hide) {

          station.marker = station.marker || [];

          station.marker.push({
            "line": line$$1.name,
            "color": line$$1.color,
            "labelPos": d.labelPos,
            "marker": d.hasOwnProperty("marker") ? d.marker : "station",
            "shiftX": d.hasOwnProperty("shiftCoords") ? d.shiftCoords[0] : line$$1.shiftCoords[0],
            "shiftY": d.hasOwnProperty("shiftCoords") ? d.shiftCoords[1] : line$$1.shiftCoords[1]
          });
        }
      }
    });

    return new Stations(data.stations);
  }

  function extractLines(data) {
    var lines = [];

    data.forEach(function (line$$1) {

      var lineObj = {
        "name": line$$1.name,
        "title": line$$1.label,
        "stations": [],
        "color": line$$1.color,
        "shiftCoords": line$$1.shiftCoords,
        "nodes": line$$1.nodes,
        "highlighted": false
      };

      lines.push(lineObj);

      for (var node = 0; node < line$$1.nodes.length; node++) {
        var data = line$$1.nodes[node];

        if (!data.hasOwnProperty("name")) continue;

        lineObj.stations.push(data.name);
      }
    });

    return new Lines(lines);
  }

  function textPos(data) {
    var pos;
    var textAnchor;
    var offset = lineWidth * 1.8;

    var numLines = data.label.split(/\n/).length;

    var sqrt2 = Math.sqrt(2);

    switch (data.labelPos.toLowerCase()) {
      case "n":
        pos = [0, lineWidth * (numLines - 1) + offset];
        textAnchor = "middle";
        break;
      case "ne":
        pos = [offset / sqrt2, (lineWidth * (numLines - 1) + offset) / sqrt2];
        textAnchor = "start";
        break;
      case "e":
        pos = [offset, 0];
        textAnchor = "start";
        break;
      case "se":
        pos = [offset / sqrt2, -offset / sqrt2];
        textAnchor = "start";
        break;
      case "s":
        pos = [0, -lineWidthMultiplier * offset];
        textAnchor = "middle";
        break;
      case "sw":
        pos = [-offset / sqrt2, -1.4 * offset / sqrt2];
        textAnchor = "end";
        break;
      case "w":
        pos = [-offset, 0];
        textAnchor = "end";
        break;
      case "nw":
        pos = [-(lineWidth * (numLines - 1) + offset) / sqrt2, (lineWidth * (numLines - 1) + offset) / sqrt2];
        textAnchor = "end";
        break;
      default:
        break;
    }

    return {
      "pos": pos,
      "textAnchor": textAnchor
    };
  }

  // Render line breaks for svg text
  function wrap(text) {
    text.each(function () {
      var text = d3.select(this);
      var lines = text.text().split(/\n/);

      var y = text.attr("y");
      var x = text.attr("x");
      var dy = parseFloat(text.attr("dy"));

      var tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em").text(lines[0]);

      for (var lineNum = 1; lineNum < lines.length; lineNum++) {
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", lineNum * 1.1 + dy + "em").text(lines[lineNum]);
      }
    });
  }

  return map;
}

var Stations = function Stations(stations) {
  this.stations = stations;
};

Stations.prototype.toArray = function () {
  var stations = [];

  for (var name in this.stations) {
    if (this.stations.hasOwnProperty(name)) {
      var station = this.stations[name];
      station.name = name;
      stations.push(station);
    }
  }

  return stations;
};

Stations.prototype.interchanges = function () {
  var interchangeStations = this.toArray();
  return interchangeStations.filter(function (station) {
    return station.marker[0].marker === "interchange";
  });
};

Stations.prototype.normalStations = function () {
  var stations = this.toArray();

  var stationStations = stations.filter(function (station) {
    return station.marker[0].marker !== "interchange";
  });

  var stationMarkers = [];

  stationStations.forEach(function (station) {
    station.marker.forEach(function (marker) {
      stationMarkers.push({
        "name": station.name,
        "line": marker.line,
        "x": station.x,
        "y": station.y,
        "color": marker.color,
        "shiftX": marker.shiftX,
        "shiftY": marker.shiftY,
        "labelPos": station.labelPos
      });
    });
  });

  return stationMarkers;
};

Stations.prototype.visited = function () {
  var visitedStations = this.toArray();

  return visitedStations.filter(function (station) {
    return station.visited;
  });
};

Stations.prototype.visitedFriendly = function () {
  var visitedStations = this.visited();

  return visitedStations.map(function (station) {
    return station.title;
  });
};

Stations.prototype.isVisited = function (name) {
  return this.stations[name].visited;
};

var Lines = function Lines(lines) {
  this.lines = lines;
};

Lines.prototype.highlightLine = function (name) {
  this.lines.forEach(function (line$$1) {
    if (line$$1.name === name) {
      line$$1.highlighted = true;
    }
  });
};

Lines.prototype.unhighlightLine = function (name) {
  this.lines.forEach(function (line$$1) {
    if (line$$1.name === name) {
      line$$1.highlighted = false;
    }
  });
};

exports.tubeMap = tubeMap;

Object.defineProperty(exports, '__esModule', { value: true });

})));
