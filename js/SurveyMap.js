/*
*Class that constructs objects on top of the survey data google map
*
*/
class SurveyMap {

    /**
     *Constructor for the map class
     * @param map instance of google map object
     * @param stationData data of station
     */
    constructor(map, stationData) {

        this.map = map;

        //instance of heatmap
        this.heatmap = null;

        //Keeps track of the current markers on the map
        this.markers = [];

        //Keeps track of the actual station data with latitude and longitude
        this.stations = stationData;
    }


    /**
     *
     *@param map instance of google map object
     *
     */
    setCircles(map) {

        d3.selectAll(".circle").remove();

        //Use of this instance inside CSV methods
        let self_item = this;
        let citymap = [];
        let heatMapData = [];

        //Get the selected year, type, and week/weekend for the data
        let e = document.getElementById("data-type");
        let type = e.options[e.selectedIndex].value;

        let f = document.getElementById("data-week");
        let week = f.options[f.selectedIndex].value;

        let g = document.getElementById("data-year");
        let year = g.options[g.selectedIndex].value;

        //Retrieve the necessary data
        d3.csv("tubedata/counts/2007_Entry_Exit.csv", function (error, csvData) {
            csvData.forEach(function (da, i) {
                da.Entry_Week = +da.Entry_Week;
                da.Entry_Saturday = +da.Entry_Saturday;
                da.Entry_Sun = +da.Entry_Sun;
                da.Exit_Week = +da.Exit_Week;
                da.Exit_Sat = +da.Exit_Sat;
                da.Exit_Sun = +da.Exit_Sun;
            });

            self_item.stations.forEach(function (d, i) {
                let val = csvData.filter(function (n) {
                    return n.Station === d.title;
                });

                if (val.length === 0) {
                    val.push({entry: 0});
                }

                //here we construct an object that stores the information we need.
                //Construct heat map data
                // {location: new google.maps.LatLng(37.782, -122.443), weight: 2}
                heatMapData.push({
                    location: new google.maps.LatLng(d.position.lat, d.position.lon),
                    weight: val[0].Entry_Week
                });

                //Construct object with all the information for the bubble chart
                citymap.push({
                    title: d.title, center: {lat: d.position.lat, lng: d.position.lon}, entWeek: val[0].Entry_Week,
                    entSat: val[0].Entry_Saturday,
                    entSun: val[0].Entry_Sun,
                    extWeek: val[0].Exit_Week,
                    extSat: val[0].Exit_Sat,
                    extSun: val[0].Exit_Sun
                });
            });

            for (let city in citymap) {
                // Add the circle for this city to the map.
                //  console.log(""+ type + week+ "");
                //  console.log(citymap[city][""+ type + week+ ""]);
                let cityCircle = new google.maps.Circle({
                    class: "circle",
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 1,
                    fillColor: '#FF0000',
                    fillOpacity: 0.25,
                    map: map,
                    center: citymap[city].center,
                    //Here we set the radius according to some data gathered by the csv
                    radius: citymap[city]["" + type + week + ""] / 20
                    //Math.sqrt(citymap[city].population) * 100
                });
                self_item.markers.push(cityCircle);
            }
        });
    }

//Methods used for clearing all the info off the map

    setMapOnAll(map) {
        for (let i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(map);
        }
    }

    clearMarkers() {
        this.setMapOnAll(null);
    }

    setHeatmap(map, type) {
        d3.selectAll(".circle").remove();

        let self_item = this;
        let citymap = [];
        let heatMapData = [];

        if (type === "avtime") {
            let e = document.getElementById("categoryMenu");
            let cate = e.options[e.selectedIndex].value;

            let f = document.getElementById("dayMenu");
            let day = f.options[f.selectedIndex].value;

            //Retrieve the necessary data
            d3.csv("tubedata/RODS_2016/Exit/Average journey time/station.csv", function (csvData) {
                csvData.forEach(function (da, i) {
                    da.Average     = +da.Average;
                    da.l_15_mins   = +da.l_15_mins;
                    da.f15_30      = +da.f15_30;
                    da.f30_45      = +da.f30_45;
                    da.f45_60      = +da.f45_60;
                    da.f60_90      = +da.f60_90;
                    da.over_90     = +da.over90
                });
                self_item.stations.forEach(function (d, i) {
                    let val = csvData.filter(function (n) {
                      return n.Station.trim() === d.title.trim() && n.Time_period.trim() === day;
                    });


                    let currCate = {
                      'Average': 'Average',
                      '< 15 mins': 'l_15_mins',
                      '15 - 30': 'f15_30',
                      '30 - 45': 'f30_45',
                      '45 - 60': 'f45_60',
                      '60 - 90': 'f60_90',
                      'over 90': 'over_90'
                    };

                    //here we construct an object that stores the information we need.
                    //Construct heat map data
                    // {location: new google.maps.LatLng(37.782, -122.443), weight: 2}


                    if (val[0]) {
                        heatMapData.push({
                            location: new google.maps.LatLng(d.position.lat, d.position.lon),
                            weight: val[0][currCate[cate]]
                        });

                        //Construct object with all the information for the heatmap
                        // citymap.push({
                        //     title:      d.title,
                        //     center:     {lat: d.position.lat, lng: d.position.lon},
                        //     average:    val[0].Average,
                        //     less15:     val[0].l_15_mins,
                        //     f15to30:    val[0].f15_30,
                        //     f30to45:    val[0].f30_45,
                        //     f45to60:    val[0].f45_60,
                        //     f60to90:    val[0].f60_90,
                        //     over90:     val[0].over90
                        // });
                    }
                });

                //Code to add cluster markers
                //
                //         let markers = heatMapData.map(function(location, i) {
                //           console.log(location.location);
                //   return new google.maps.Marker({
                //     position: location.location,
                //     label: location.weight
                //   });
                // });
                //
                // // Add a marker clusterer to manage the markers.
                // let markerCluster = new MarkerClusterer(map, markers,
                //     {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});

                console.log(heatMapData)

                self_item.heatmap = new google.maps.visualization.HeatmapLayer({
                    data: heatMapData
                });

                self_item.heatmap.setMap(map);
                self_item.heatmap.setOptions({
                    radius: 15,
                    maxIntensity: d3.max(heatMapData).weight,
                    gradient: ['rgba(0, 255, 255, 0)',
                        "#00FFFF",
                        "#00EFFF",
                        "#00DFFF",
                        "#00D0FF",
                        "#00C0FF",
                        "#00B0FF",
                        "#00A1FF",
                        "#0091FF",
                        "#0082FF",
                        "#0072FF",
                        "#0062FF",
                        "#0053FF",
                        "#0043FF",
                        "#0034FF",
                        "#0024FF",
                        "#0014FF",
                        "#0005FF",
                        "#0A00FF",
                        "#1A00FF",
                        "#2900FF",
                        "#3900FF",
                        "#4800FF",
                        "#5800FF",
                        "#6800FF",
                        "#7700FF",
                        "#8700FF",
                        "#9600FF",
                        "#A600FF",
                        "#B600FF",
                        "#C500FF",
                        "#D500FF",
                        "#E400FF",
                        "#F400FF",
                        "#FF00F9",
                        "#FF00EA",
                        "#FF00DA",
                        "#FF00CA",
                        "#FF00BB",
                        "#FF00AB",
                        "#FF009C",
                        "#FF008C",
                        "#FF007C",
                        "#FF006D",
                        "#FF005D",
                        "#FF004E",
                        "#FF003E",
                        "#FF002E",
                        "#FF001F",
                        "#FF000F",
                        "#FF0000"]
                });

                self_item.markers.push(self_item.heatmap);
            });
        }
        else if (type === "distancekm") {
            //Retrieve the necessary data
            d3.csv("tubedata/RODS_2016/Entry/Distance_travelled/By_station.csv", function (error, csvData) {

                let menu = document.getElementById("categoryMenu");
                let kms = menu.options[menu.selectedIndex].value;

                if (kms === "<1 km") {
                    kms = "l1km";
                }
                else if (kms === "30+ kms") {
                  kms = "30pkms";
                }

                //change necessary columns
                csvData.forEach(function (da, i) {
                    da["" + kms + ""] = + da["" + kms + ""] / da["Total"];
                });

                self_item.stations.forEach(function (d, i) {
                    let val = csvData.filter(function (n) {
                        return n.Station.trim() === d.title.trim();
                    });
                    if (val[0]) {
                        //Construct object with all the information for heatmap based on what the user selects
                        citymap.push({
                            title: d.title,
                            center: {lat: d.position.lat, lng: d.position.lon},
                            kilo: val[0]["" + kms + ""]
                        });
                    }

                    for (let city in citymap) {
                        heatMapData.push({
                            location: new google.maps.LatLng(citymap[city].center.lat, citymap[city].center.lng),
                            weight: citymap[city].kilo
                        });
                    }
                });


                self_item.heatmap = new google.maps.visualization.HeatmapLayer({
                    data: heatMapData
                });

                //d3.max(heatMapData).weight
                //
                self_item.heatmap.setMap(map);
                self_item.heatmap.setOptions({
                    radius: 15,
                    maxIntensity: d3.max(heatMapData).weight,
                    gradient: [
                        'rgba(0, 255, 255, 0)',"#00FFFF",
                        "#00EFFF",
                        "#00DFFF",
                        "#00D0FF",
                        "#00C0FF",
                        "#00B0FF",
                        "#00A1FF",
                        "#0091FF",
                        "#0082FF",
                        "#0072FF",
                        "#0062FF",
                        "#0053FF",
                        "#0043FF",
                        "#0034FF",
                        "#0024FF",
                        "#0014FF",
                        "#0005FF",
                        "#0A00FF",
                        "#1A00FF",
                        "#2900FF",
                        "#3900FF",
                        "#4800FF",
                        "#5800FF",
                        "#6800FF",
                        "#7700FF",
                        "#8700FF",
                        "#9600FF",
                        "#A600FF",
                        "#B600FF",
                        "#C500FF",
                        "#D500FF",
                        "#E400FF",
                        "#F400FF",
                        "#FF00F9",
                        "#FF00EA",
                        "#FF00DA",
                        "#FF00CA",
                        "#FF00BB",
                        "#FF00AB",
                        "#FF009C",
                        "#FF008C",
                        "#FF007C",
                        "#FF006D",
                        "#FF005D",
                        "#FF004E",
                        "#FF003E",
                        "#FF002E",
                        "#FF001F",
                        "#FF000F",
                        "#FF0000"]
                });

                self_item.markers.push(self_item.heatmap);
            });
        }
        else if (type === "avdistance") {
            //from Totals.csv
            //Retrieve the necessary data
            d3.csv("tubedata/RODS_2016/Exit/Distance travelled/Totals.csv", function (csvData) {
                let menu = document.getElementById("categoryMenu");
                let stat = menu.options[menu.selectedIndex].value;

                stat = (stat.split(' ')).splice(0, 3).join('_');

                //change necessary columns
                csvData.forEach(function (da, i) {
                    da["" + stat + ""] = +da["" + stat + ""];
                    console.log(da["" + stat + ""]);
                });

                self_item.stations.forEach(function (d, i) {
                    let val = csvData.filter(function (n) {
                        return n.Station.trim() === d.title.trim();
                    });

                    if (val[0]) {
                        //Construct object with all the information for heatmap based on what the user selects
                        citymap.push({
                            title: d.title,
                            center: {lat: d.position.lat, lng: d.position.lon},
                            dist: val[0]["" + stat + ""]
                        });
                    }

                    for (let city in citymap) {
                        heatMapData.push({
                            location: new google.maps.LatLng(citymap[city].center.lat, citymap[city].center.lng),
                            weight: citymap[city].dist
                        });
                    }
                });

                self_item.heatmap = new google.maps.visualization.HeatmapLayer({
                    data: heatMapData
                });

                console.log(heatMapData)

                //d3.max(heatMapData).weight
                //

                self_item.heatmap.setMap(map);
                self_item.heatmap.setOptions({
                    radius: 15,
                    maxIntensity: d3.max(heatMapData).weight * 50,
                    gradient: [ 'rgba(0, 255, 255, 0)',
                        "#00FFFF",
                        "#00EFFF",
                        "#00DFFF",
                        "#00D0FF",
                        "#00C0FF",
                        "#00B0FF",
                        "#00A1FF",
                        "#0091FF",
                        "#0082FF",
                        "#0072FF",
                        "#0062FF",
                        "#0053FF",
                        "#0043FF",
                        "#0034FF",
                        "#0024FF",
                        "#0014FF",
                        "#0005FF",
                        "#0A00FF",
                        "#1A00FF",
                        "#2900FF",
                        "#3900FF",
                        "#4800FF",
                        "#5800FF",
                        "#6800FF",
                        "#7700FF",
                        "#8700FF",
                        "#9600FF",
                        "#A600FF",
                        "#B600FF",
                        "#C500FF",
                        "#D500FF",
                        "#E400FF",
                        "#F400FF",
                        "#FF00F9",
                        "#FF00EA",
                        "#FF00DA",
                        "#FF00CA",
                        "#FF00BB",
                        "#FF00AB",
                        "#FF009C",
                        "#FF008C",
                        "#FF007C",
                        "#FF006D",
                        "#FF005D",
                        "#FF004E",
                        "#FF003E",
                        "#FF002E",
                        "#FF001F",
                        "#FF000F",
                        "#FF0000"]
                });

                self_item.markers.push(self_item.heatmap);
            });
        }
        else if (type === "access") {
            //from Access.csv
            //Retrieve the necessary data
            d3.csv("tubedata/RODS_2016/Entry/Access mode/Access.csv", function (error, csvData) {
                let menu1 = document.getElementById("categoryMenu");
                let cat = menu1.options[menu1.selectedIndex].value;

                cat = cat.split(' ').join('_');

                let menu2 = document.getElementById("dayMenu");
                let day = menu2.options[menu2.selectedIndex].value;

                //change necessary columns
                csvData.forEach(function (da) {
                  da[cat] = +da[cat];
                });

                self_item.stations.forEach(function (d, i) {
                    let val = csvData.filter(function (n) {
                        return n.Station.trim() === d.title.trim() && n.Time_period.trim() === day;
                    });

                    if (val[0]) {
                        //Construct object with all the information for heatmap based on what the user selects
                        citymap.push({
                            title: d.title,
                            center: {lat: d.position.lat, lng: d.position.lon},
                            num: val[0]["" + cat + ""]
                        });
                    }

                    for (let city in citymap) {
                        heatMapData.push({
                            location: new google.maps.LatLng(citymap[city].center.lat, citymap[city].center.lng),
                            weight: citymap[city].num
                        });
                    }
                });

                self_item.heatmap = new google.maps.visualization.HeatmapLayer({
                    data: heatMapData
                });

                //d3.max(heatMapData).weight
                //
                console.log(heatMapData);

                self_item.heatmap.setMap(map);
                self_item.heatmap.setOptions({
                    radius: 15,
                    maxIntensity: d3.max(heatMapData).weight*150,
                    gradient: [ 'rgba(0, 255, 255, 0)',
                        "#00FFFF",
                        "#00EFFF",
                        "#00DFFF",
                        "#00D0FF",
                        "#00C0FF",
                        "#00B0FF",
                        "#00A1FF",
                        "#0091FF",
                        "#0082FF",
                        "#0072FF",
                        "#0062FF",
                        "#0053FF",
                        "#0043FF",
                        "#0034FF",
                        "#0024FF",
                        "#0014FF",
                        "#0005FF",
                        "#0A00FF",
                        "#1A00FF",
                        "#2900FF",
                        "#3900FF",
                        "#4800FF",
                        "#5800FF",
                        "#6800FF",
                        "#7700FF",
                        "#8700FF",
                        "#9600FF",
                        "#A600FF",
                        "#B600FF",
                        "#C500FF",
                        "#D500FF",
                        "#E400FF",
                        "#F400FF",
                        "#FF00F9",
                        "#FF00EA",
                        "#FF00DA",
                        "#FF00CA",
                        "#FF00BB",
                        "#FF00AB",
                        "#FF009C",
                        "#FF008C",
                        "#FF007C",
                        "#FF006D",
                        "#FF005D",
                        "#FF004E",
                        "#FF003E",
                        "#FF002E",
                        "#FF001F",
                        "#FF000F",
                        "#FF0000"]
                });

                self_item.markers.push(self_item.heatmap);
            });
        }
        else if (type === "purpose") {
          //from journey purpose
          //Retrieve the necessary data
          d3.csv("tubedata/RODS_2016/Entry/Journey purpose/journey purpose.csv", function (csvData) {
              let menu1 = document.getElementById("categoryMenu");
              let cat   = menu1.options[menu1.selectedIndex].value;

              let menu2 = document.getElementById("placeMenu");
              let place = menu2.options[menu2.selectedIndex].value;

              let menu3 = document.getElementById("dayMenu");
              let day   = menu3.options[menu3.selectedIndex].value;

              if (place === "Destination Purpose")
                cat = "D" + cat;

              //change necessary columns
              csvData.forEach(function (da) {
                if (cat === "Work" || cat === "Home") {
                  da[cat] = +da[cat + '1'] + da[cat + '2'];
                }
                else {
                  da[cat] = +da[cat];
                }
              });

              self_item.stations.forEach(function (d, i) {
                  let val = csvData.filter(function (n) {
                      return n.Station.trim() === d.title.trim() && n["Time period"].trim() === day;
                  });

                  if (val[0]) {
                      //Construct object with all the information for heatmap based on what the user selects
                      citymap.push({
                          title: d.title,
                          center: {lat: d.position.lat, lng: d.position.lon},
                          num: val[0]["" + cat + ""]
                      });
                  }

                  for (let city in citymap) {
                      heatMapData.push({
                          location: new google.maps.LatLng(citymap[city].center.lat, citymap[city].center.lng),
                          weight: parseInt(citymap[city].num)
                      });
                  }
              });

              self_item.heatmap = new google.maps.visualization.HeatmapLayer({
                  data: heatMapData
              });

              //d3.max(heatMapData).weight
              //
              console.log(heatMapData);

              self_item.heatmap.setMap(map);
              self_item.heatmap.setOptions({
                  radius: 15,
                  maxIntensity: d3.max(heatMapData).weight*200,
                  gradient: [ 'rgba(0, 255, 255, 0)',
                      "#00FFFF",
                      "#00EFFF",
                      "#00DFFF",
                      "#00D0FF",
                      "#00C0FF",
                      "#00B0FF",
                      "#00A1FF",
                      "#0091FF",
                      "#0082FF",
                      "#0072FF",
                      "#0062FF",
                      "#0053FF",
                      "#0043FF",
                      "#0034FF",
                      "#0024FF",
                      "#0014FF",
                      "#0005FF",
                      "#0A00FF",
                      "#1A00FF",
                      "#2900FF",
                      "#3900FF",
                      "#4800FF",
                      "#5800FF",
                      "#6800FF",
                      "#7700FF",
                      "#8700FF",
                      "#9600FF",
                      "#A600FF",
                      "#B600FF",
                      "#C500FF",
                      "#D500FF",
                      "#E400FF",
                      "#F400FF",
                      "#FF00F9",
                      "#FF00EA",
                      "#FF00DA",
                      "#FF00CA",
                      "#FF00BB",
                      "#FF00AB",
                      "#FF009C",
                      "#FF008C",
                      "#FF007C",
                      "#FF006D",
                      "#FF005D",
                      "#FF004E",
                      "#FF003E",
                      "#FF002E",
                      "#FF001F",
                      "#FF000F",
                      "#FF0000"]
              });

              self_item.markers.push(self_item.heatmap);
          });
        }
    }

    changeGradient(gradient) {
        if (this.heatmap) {
            this.heatmap.set('gradient', this.heatmap.get('gradient') ? null : gradient);
        }
    }

    changeRadius(radius) {
        let currRadius = this.heatmap.get('radius');
        let newRadius = currRadius + radius;

        this.heatmap.set('radius', currRadius >= 0 ? newRadius : 0);

        return newRadius;
    }


    //Changes the opacity of the circles and the heatmap
    changeOpacity(opacity) {
        let currOpacity = this.heatmap.get('opacity');
        let newOpacity = currOpacity + opacity;

        newOpacity = newOpacity > 1 ? 1 : newOpacity;

        this.heatmap.set('opacity', newOpacity >= 0 ? newOpacity : 0);
        return newOpacity;
    }
}
