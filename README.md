# 5630 Project
Visualization of London Underground


In this project I am looking to make a visualization of the London Underground with aggregate, line, and station data obtained from the TFL (Transport For London) API website. The idea is to show interesting trends that have occured over time in the entry/exit information as well as highlight data obtained in 2016 on demographic/origin&destination information from each station. 

The map of the London Underground is one of my favorite visualizations just as an abstraction of irrelevant information to something simple and easy to understand.

After returning from working in London over the summer and experiencing the Tube and how user friendly it is compared to other metros in Europe I looked into what kind of data is available about it. Come to find out that the TFL has very accurate data that they make public as well as put on their API for developers. I want to use this data and take advantage of the unique structure of the Tube map to explore this landscape. 

I also had some inspiration from other developers that have made incredible visualizations off the Oyster Card data such as the animation 'day on the tube' where time, entry, and exit information are uitilzed to show people as dots riding the tube on the map. 

![alt text](https://i.pinimg.com/736x/5f/84/8e/5f848ee26df8d48187cd3176cda11fba.jpg)


![alt text](https://i.pinimg.com/736x/32/b7/c9/32b7c90679afb8c2f552ae7d4e0a0bc5--london-underground-tube-map-data-visualization.jpg)



![alt text](https://i.pinimg.com/originals/6c/57/ce/6c57ce5c9760b795a47d4dab624a7cdd.jpg)

My personal favorite is the live 3D tube map using the API to show where trains are as well as how the lines are spatially related. Link below

![alt text](https://cdn.searchenginejournal.com/wp-content/uploads/2013/09/london.png)


http://brunoimbrizi.com/experiments/#/07


The 4 main components of the project will be:

1: Drawing a scale Tube Map using the d3.tube package that draws nice maps from json files. (This just involves typing in each station to the json file and making sure the cooridnate system matches)

2: Displaying aggregate data on the full map, this will involve creating a selection menu and filtering the data for days of the week/entries/exits etc. 

3: Animating the lines when clicked so that we get just the stations on a particular line (similar to how the Tube displays an individual line to the user)

4: Allowing the user to select individual stations. Here we will select a station and show data that was compiled from a 2016 study that shows demographic, origin, destination, and other metrics for people who used the station. 
