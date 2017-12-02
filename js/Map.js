/*
*Class that constructs objects on top of the google map and adjust according to selected data
*
*/
class MAP {
    /**
     *Constructor for the map class
     * @param map instance of google map object
     *
     */
    constructor(map) {
        this.map = map;
        //instance of heatmap
        this.heatmap = null;
        //Keeps track of the current markers on the map
        this.markers = [];
    }

    /**
     *
     *@param map instance of google map object
     *
     */
    setCircles(map) {
        d3.selectAll(".circle").remove();

        let keyValues = [];
        let self_item = this;
        let citymap = [];
        let heatMapData = [];

        d3.json("stations.json", function (error, data) {
            if (error) {
                console.log("something went wrong");
            }

            let keys = Object.keys(data.stations);
            let vals = Object.keys(data.stations).map(function (key) {
                //combine this object to use later.
                keyValues.push({k: key, title: data.stations[key].title, position: data.stations[key].position});
                return data.stations[key];
            });

            //Get the selected year, type, and week/weekend for the data
            let e = document.getElementById("data-type");
            let type = e.options[e.selectedIndex].value;

            let f = document.getElementById("data-week");
            let week = f.options[f.selectedIndex].value;

            let g = document.getElementById("data-year");
            let year = g.options[g.selectedIndex].value;

            console.log(year);

            //Retrieve the necessary data
            d3.csv("tubedata/counts/" + year + "_Entry_Exit.csv", function (error, csvData) {
                console.log("read function");
                csvData.forEach(function (da, i) {
                    da.Entry_Week = +da.Entry_Week;
                    da.Entry_Saturday = +da.Entry_Saturday;
                    da.Entry_Sun = +da.Entry_Sun;
                    da.Exit_Week = +da.Exit_Week;
                    da.Exit_Sat = +da.Exit_Sat;
                    da.Exit_Sun = +da.Exit_Sun;
                });

                keyValues.forEach(function (d, i) {
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
        });
    }

//
    setMapOnAll(map) {
        for (let i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(map);
        }
    }

//Clears all markers on the map
    clearMarkers() {
        this.setMapOnAll(null);
    }

    setHeatmap(map) {
        d3.selectAll(".circle").remove();

        let keyValues = [];
        let self_item = this;
        let citymap = [];
        let heatMapData = [];

        d3.json("stations.json", function (error, data) {
            if (error) {
                console.log("something went wrong");
            }

            let keys = Object.keys(data.stations);
            let vals = Object.keys(data.stations).map(function (key) {
                //combine this object to use later.
                keyValues.push({k: key, title: data.stations[key].title, position: data.stations[key].position});
                return data.stations[key];
            });

            //Get the selected year, type, and week/weekend for the data
            let e = document.getElementById("data-type");
            let type = e.options[e.selectedIndex].value;

            let f = document.getElementById("data-week");
            let week = f.options[f.selectedIndex].value;

            let g = document.getElementById("data-year");
            let year = g.options[g.selectedIndex].value;

            //Retrieve the necessary data
            d3.csv("tubedata/counts/" + year + "_Entry_Exit.csv", function (csvData) {
                csvData.forEach(function (da) {
                    if (parseInt(year) < 2009) {
                        da.Entry_Weekday = +da.Entry_Weekday;
                        da.Entry_Saturday = +da.Entry_Saturday;
                        da.Entry_Sunday = +da.Entry_Sunday;
                        da.Exit_Weekday = +da.Exit_Weekday;
                        da.Exit_Saturday = +da.Exit_Saturday;
                        da.Exit_Sunday = +da.Exit_Sunday;
                    }
                });

                keyValues.forEach(function (d) {
                    let val = csvData.filter(function (n) {
                        return n.Station === d.title;
                    });

                    if (val.length === 0) {
                        val.push({entry: 0});

                    }

                    //Construct object with all the information for the bubble chart
                    citymap.push({
                        title: d.title, center: {lat: d.position.lat, lng: d.position.lon},
                        entWeek: val[0].Entry_Weekday,
                        entSat: val[0].Entry_Saturday,
                        entSun: val[0].Entry_Sunday,
                        extWeek: val[0].Exit_Weekday,
                        extSat: val[0].Exit_Saturday,
                        extSun: val[0].Exit_Sunday
                    });

                    console.log(citymap[0])

                    //here we construct an object that stores the information we need.
                    //Construct heat map data
                    // {location: new google.maps.LatLng(37.782, -122.443), weight: 2}
                });

                for (let city in citymap) {
                    heatMapData.push({
                        location: new google.maps.LatLng(citymap[city].center.lat, citymap[city].center.lng),
                        weight: citymap[city]["" + type + week + ""]
                    });
                }


                self_item.heatmap = new google.maps.visualization.HeatmapLayer({
                    data: heatMapData
                });

                self_item.heatmap.setMap(map);
                self_item.heatmap.setOptions({
                    radius: 15,
                    maxIntensity: d3.max(heatMapData).weight,
                    gradient: [ 'rgba(0, 255, 255, 0)',
                        'rgba(0, 255, 255, 1)',
                        'rgba(0, 191, 255, 1)',
                        'rgba(0, 127, 255, 1)',
                        'rgba(0, 63, 255, 1)',
                        'rgba(0, 0, 255, 1)',
                        'rgba(0, 0, 223, 1)',
                        'rgba(0, 0, 191, 1)',
                        'rgba(0, 0, 159, 1)',
                        'rgba(0, 0, 127, 1)',
                        'rgba(63, 0, 91, 1)',
                        'rgba(127, 0, 63, 1)',
                        'rgba(191, 0, 31, 1)',
                        'rgba(255, 0, 0, 1)']
                });

                self_item.markers.push(self_item.heatmap);
            });
        });
    }

    changeGradient(gradient) {
        let menu = document.getElementById("vis-type");
        let type = menu.options[menu.selectedIndex].value;

        if (this.heatmap) {
            this.heatmap.set('gradient', this.heatmap.get('gradient') ? null : gradient);
        }
    }

    changeRadius(radius) {
        let menu = document.getElementById("vis-type");
        let type = menu.options[menu.selectedIndex].value;

        let currRadius = this.heatmap.get('radius');
        let newRadius = currRadius + radius;

        this.heatmap.set('radius', newRadius >= 0 ? newRadius : 0);

        return newRadius;
    }


//Changes the opacity of the circles and the heatmap
    changeOpacity(opacity) {
        let menu = document.getElementById("vis-type");
        let type = menu.options[menu.selectedIndex].value;

        let currOpacity = this.heatmap.get('opacity');
        let newOpacity = currOpacity + opacity;

        newOpacity = newOpacity > 1 ? 1 : newOpacity;

        this.heatmap.set('opacity', newOpacity >= 0 ? newOpacity : 0);
        return newOpacity;
    }
}
