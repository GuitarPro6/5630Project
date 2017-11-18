/*
*Class that constructs objects on top of the survey data google map
*
*/
class SurveyMap {

  /**
  *Constructor for the map class
  * @param map instance of google map object
  *
  */
constructor(map){

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
setCircles(map){

  d3.selectAll(".circle").remove();

        var keyValues = [];

        //Use of this instance inside CSV methods
        var self_item = this;

        var citymap = [];

        var heatMapData = [];

        //obtain all the station information
        d3.json("stations.json", function(error, data) {
          if(error != null){
            console.log("something went wrong");
          }

            var keys = Object.keys(data.stations);


            var vals = Object.keys(data.stations).map(function(key) {

              //combine this object to use later.
              keyValues.push({k: key, title: data.stations[key].title, position: data.stations[key].position});
              return data.stations[key];
          });

          //Get the selected year, type, and week/weekend for the data
          var e = document.getElementById("data-type");
          var type = e.options[e.selectedIndex].value;

          var f = document.getElementById("data-week");
          var week = f.options[f.selectedIndex].value;

          var g = document.getElementById("data-year");
          var year = g.options[g.selectedIndex].value;


          //Retrieve the necessary data
          d3.csv("tubedata/counts/2007_Entry_Exit.csv", function(error, csvData){
            csvData.forEach(function (da, i) {
            da.Entry_Week = +da.Entry_Week;
              da.Entry_Sat = +da.Entry_Saturday;
                da.Entry_Sun = +da.Entry_Sunday;
                  da.Exit_Week = +da.Exit_Week;
                    da.Exit_Sat = +da.Exit_Saturday;
                      da.Exit_Sun = +da.Exit_Sunday;



        });




        keyValues.forEach(function(d,i){



          var val = csvData.filter(function(n){


            return n.Station === d.title;});


            if(val.length === 0){
              val.push({entry: 0});
            }



          //here we construct an object that stores the information we need.
          //Construct heat map data
          // {location: new google.maps.LatLng(37.782, -122.443), weight: 2}

          heatMapData.push({location: new google.maps.LatLng(d.position.lat, d.position.lon), weight: val[0].Entry_Week});

          //Construct object with all the information for the bubble chart
          citymap.push({title: d.title, center: {lat: d.position.lat, lng: d.position.lon}, entWeek: val[0].Entry_Week,
            entSat: val[0].Entry_Sat,
            entSun: val[0].Entry_Sun,
            extWeek: val[0].Exit_Week,
            extSat: val[0].Exit_Sat,
            extSun: val[0].Exit_Sun


          });



        })


        for (var city in citymap) {
         // Add the circle for this city to the map.
        //  console.log(""+ type + week+ "");
        //  console.log(citymap[city][""+ type + week+ ""]);
         var cityCircle = new google.maps.Circle({
           class: "circle",
           strokeColor: '#FF0000',
           strokeOpacity: 0.8,
           strokeWeight: 1,
           fillColor: '#FF0000',
           fillOpacity: 0.25,
           map: map,
           center: citymap[city].center,
           //Here we set the radius according to some data gathered by the csv
           radius: citymap[city][""+ type + week+ ""]/20

           //Math.sqrt(citymap[city].population) * 100
         });

         self_item.markers.push(cityCircle);
       }




      });







        });

      }

//Methods used for clearing all the info off the map

setMapOnAll(map) {
            for (var i = 0; i < this.markers.length; i++) {
              this.markers[i].setMap(map);
            }
          }
clearMarkers() {
             this.setMapOnAll(null);
           }

setHeatmap(map, type){
  d3.selectAll(".circle").remove();

        var keyValues = [];

        var self_item = this;

        var citymap = [];

        var heatMapData = [];

        //Obtain the station information
        d3.json("stations.json", function(error, data) {
          if(error != null){
            console.log("something went wrong");
          }

            var keys = Object.keys(data.stations);


            var vals = Object.keys(data.stations).map(function(key) {

              //combine this object to use later.
              keyValues.push({k: key, title: data.stations[key].title, position: data.stations[key].position});
              return data.stations[key];
          });

          //Get the selected year, type, and week/weekend for the data
          var e = document.getElementById("data-type");
          var type = e.options[e.selectedIndex].value;

          var f = document.getElementById("data-week");
          var week = f.options[f.selectedIndex].value;

          var g = document.getElementById("data-year");
          var year = g.options[g.selectedIndex].value;

if(type === "avJourneyTime"){

          //Retrieve the necessary data
          d3.csv("tubedata/counts/2007_Entry_Exit.csv", function(error, csvData){
            csvData.forEach(function (da, i) {
            da.Entry_Week = +da.Entry_Week;
              da.Entry_Sat = +da.Entry_Saturday;
                da.Entry_Sun = +da.Entry_Sunday;
                  da.Exit_Week = +da.Exit_Week;
                    da.Exit_Sat = +da.Exit_Saturday;
                      da.Exit_Sun = +da.Exit_Sunday;



        });
        keyValues.forEach(function(d,i){



          var val = csvData.filter(function(n){


            return n.Station === d.title;});


            if(val.length === 0){
              val.push({entry: 0});
            }



          //here we construct an object that stores the information we need.
          //Construct heat map data
          // {location: new google.maps.LatLng(37.782, -122.443), weight: 2}

          heatMapData.push({location: new google.maps.LatLng(d.position.lat, d.position.lon), weight: val[0].Entry_Week});

          //Construct object with all the information for the bubble chart
          citymap.push({title: d.title, center: {lat: d.position.lat, lng: d.position.lon}, entWeek: val[0].Entry_Week,
            entSat: val[0].Entry_Sat,
            entSun: val[0].Entry_Sun,
            extWeek: val[0].Exit_Week,
            extSat: val[0].Exit_Sat,
            extSun: val[0].Exit_Sun


          });



        })


      self_item.heatmap = new google.maps.visualization.HeatmapLayer({
  data: heatMapData
});

self_item.heatmap.setMap(map);
self_item.heatmap.setOptions({radius: 15, maxIntensity: 10000, gradient: ['#010107', '#02020C', '#030312', '#050417', '#07051D', '#0A0723', '#0D0829', '#100A2F', '#140B35', '#170C3B', '#1B0C41',
 '#1F0C48', '#230C4E', '#280B53', '#2C0B58', '#310A5D', '#350960', '#3A0963', '#3E0966', '#430A68', '#470B6A', '#4B0C6B', '#4F0D6C', '#540F6D', '#58106E', '#5C126E', '#60136E', '#64156E', '#68166E', '#6C186E', '#70196E',
 '#741B6E', '#781C6D', '#7D1E6D', '#811F6C', '#85216B', '#89226A', '#8D2369', '#912568', '#952667', '#992865', '#9D2964', '#A12B62', '#A52D60', '#A92E5E', '#AD305C', '#B1325A', '#B53458', '#B93656', '#BD3853', '#C03A51',
 '#C43C4E', '#C83F4C', '#CB4149', '#CF4446', '#D24644', '#D54941', '#D84C3E', '#DB4F3B', '#DE5338', '#E15635', '#E45A32', '#E65D2F', '#E9612B', '#EB6528', '#ED6925', '#EF6D22', '#F1711E', '#F3751B', '#F47A18', '#F67E14',
  '#F78311', '#F8870E', '#F98C0A', '#FA9008', '#FB9506', '#FB9A06', '#FC9F07', '#FCA409', '#FCA80D', '#FCAD12', '#FCB217', '#FBB71C', '#FBBC22', '#FAC128', '#F9C72E', '#F8CC35', '#F7D13C', '#F6D643', '#F5DB4B', '#F4E054',
  '#F3E45D', '#F2E967', '#F1EE71', '#F2F27C', '#F3F587', '#F5F991', '#F8FC9B', '#FCFFA4']});

    self_item.markers.push(self_item.heatmap);



      });

}
else if(type === "kilometers"){

}
else if(type === "avDistance"){

}
else if(type === "access"){

}
else if(type === "purpose"){

}

});
}

changeGradient(gradient){


  if(this.heatmap != null){

  this.heatmap.set('gradient', this.heatmap.get('gradient') ? null : gradient);



  }


}

changeRadius(radius){

  var currRadius = this.heatmap.get('radius');

  var newRadius = currRadius + radius;

  this.heatmap.set('radius', currRadius >= 0 ? newRadius : 0);
}


}
