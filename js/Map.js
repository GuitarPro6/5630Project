class MAP {

constructor(map){

this.map = map;

this.cityCircle = null;

this.markers = [];

}



setCircles(map){

  d3.selectAll(".circle").remove();

        var keyValues = [];

        var self_item = this;

        var citymap = [];
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

                      console.log(csvData);


        });




        keyValues.forEach(function(d,i){



          var val = csvData.filter(function(n){


            return n.Station === d.title;});


            if(val.length === 0){
              val.push({entry: 0});
            }



          //here we construct an object that stores the information we need.
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
           strokeWeight: 2,
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

setMapOnAll(map) {
            for (var i = 0; i < this.markers.length; i++) {
              this.markers[i].setMap(map);
            }
          }
clearMarkers() {
             this.setMapOnAll(null);
           }


}
