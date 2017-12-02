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
                    da.Entry_Sat = +da.Entry_Sat;
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
                        entSat: val[0].Entry_Sat,
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
            d3.csv("tubedata/counts/" + year + "_Entry_Exit.csv", function (error, csvData) {
                csvData.forEach(function (da, i) {
                    da.Entry_Week = +da.Entry_Week;
                    da.Entry_Sat = +da.Entry_Sat;
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

                    //Construct object with all the information for the bubble chart
                    citymap.push({
                        title: d.title, center: {lat: d.position.lat, lng: d.position.lon}, entWeek: val[0].Entry_Week,
                        entSat: val[0].Entry_Sat,
                        entSun: val[0].Entry_Sun,
                        extWeek: val[0].Exit_Week,
                        extSat: val[0].Exit_Sat,
                        extSun: val[0].Exit_Sun
                    });

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
                    gradient: ['#010107', '#02020C', '#030312', '#050417', '#07051D', '#0A0723', '#0D0829', '#100A2F', '#140B35', '#170C3B', '#1B0C41',
                        '#1F0C48', '#230C4E', '#280B53', '#2C0B58', '#310A5D', '#350960', '#3A0963', '#3E0966', '#430A68', '#470B6A', '#4B0C6B', '#4F0D6C', '#540F6D', '#58106E', '#5C126E', '#60136E', '#64156E', '#68166E', '#6C186E', '#70196E',
                        '#741B6E', '#781C6D', '#7D1E6D', '#811F6C', '#85216B', '#89226A', '#8D2369', '#912568', '#952667', '#992865', '#9D2964', '#A12B62', '#A52D60', '#A92E5E', '#AD305C', '#B1325A', '#B53458', '#B93656', '#BD3853', '#C03A51',
                        '#C43C4E', '#C83F4C', '#CB4149', '#CF4446', '#D24644', '#D54941', '#D84C3E', '#DB4F3B', '#DE5338', '#E15635', '#E45A32', '#E65D2F', '#E9612B', '#EB6528', '#ED6925', '#EF6D22', '#F1711E', '#F3751B', '#F47A18', '#F67E14',
                        '#F78311', '#F8870E', '#F98C0A', '#FA9008', '#FB9506', '#FB9A06', '#FC9F07', '#FCA409', '#FCA80D', '#FCAD12', '#FCB217', '#FBB71C', '#FBBC22', '#FAC128', '#F9C72E', '#F8CC35', '#F7D13C', '#F6D643', '#F5DB4B', '#F4E054']
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
