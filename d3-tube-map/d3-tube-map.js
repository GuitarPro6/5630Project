(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
        typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
            (factory((global.tubeMap = {}), global.d3));
}(this, (function (exports, d3) {
    'use strict';

    function tubeMap() {
        var margin = {top: 80, right: 80, bottom: 20, left: 80};
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

        var timer;

        var timeStop = false;

        var t;
        var s;
        let dataStore = null;
        let currentStationSelection = null;
        const selectColor = 'steelblue';
        const otherColor = 'grey';
        const parseTime = d3.timeParse("%Y");
        const lineChartWidth = 600;
        const lineChartHeight = 400;
        const lineChartMargin = {top: 20, right: 20, bottom: 30, left: 40};
        const entryChartSVG = d3.select('.entry').append('svg')
            .attr('width', lineChartWidth + lineChartMargin.left + lineChartMargin.right)
            .attr('height', lineChartHeight + lineChartMargin.top + lineChartMargin.bottom)

        const exitChartSVG = d3.select('.exit').append('svg')
            .attr('width', lineChartWidth + lineChartMargin.left + lineChartMargin.right)
            .attr('height', lineChartHeight + lineChartMargin.top + lineChartMargin.bottom)

        const barChartWidth = 300;
        const barChartHeight = 250;

        const BAR_OFFSET = 20;
        const BAR_TOP_OFFSET = 10;

        const ageSVG = d3.select('.ageChart').append('svg')
            .attr('width', barChartWidth + lineChartMargin.left + lineChartMargin.right)
            .attr('height', barChartHeight + lineChartMargin.top + lineChartMargin.bottom)
            .append("g")
            .classed('ageBarChart', true)
            .attr("transform", "translate(" + lineChartMargin.left + "," + BAR_TOP_OFFSET + ")");

        const sexSVG = d3.select('.sexChart').append('svg')
            .attr('width', barChartWidth + lineChartMargin.left + lineChartMargin.right)
            .attr('height', barChartHeight + lineChartMargin.top + lineChartMargin.bottom)
            .append("g")
            .classed('sexChart', true)
            .attr("transform", "translate(" + lineChartMargin.left + "," + BAR_TOP_OFFSET + ")");

        const journeyChartSVG = d3.select('.journeyChart').append('svg')
            .attr('width', barChartWidth + lineChartMargin.left + lineChartMargin.right)
            .attr('height', barChartHeight + lineChartMargin.top + lineChartMargin.bottom)
            .append("g")
            .classed('journeyChart', true)
            .attr("transform", "translate(" + lineChartMargin.left + "," + BAR_TOP_OFFSET + ")");

        const marketSVG = d3.select('.marketChart').append('svg')
            .attr('width', barChartWidth + lineChartMargin.left + lineChartMargin.right)
            .attr('height', barChartHeight + lineChartMargin.top + lineChartMargin.bottom)
            .append("g")
            .classed('marketChart', true)
            .attr("transform", "translate(" + lineChartMargin.left + "," + BAR_TOP_OFFSET + ")");


        // const ageDiffSVG = d3.select(".ageDiffChart").append('svg')
        //     .attr('width', barChartWidth + lineChartMargin.left + lineChartMargin.right)
        //     .attr('height', barChartHeight + lineChartMargin.top + lineChartMargin.bottom)
        //     .append("g")
        //     .classed('ageDiffChart', true)
        //     .attr("transform", "translate(" + lineChartMargin.left + "," + BAR_TOP_OFFSET + ")");
        //
        //
        // const sexDiffSVG = d3.select(".sexDiffChart").append('svg')
        //     .attr('width', barChartWidth + lineChartMargin.left + lineChartMargin.right)
        //     .attr('height', barChartHeight + lineChartMargin.top + lineChartMargin.bottom)
        //     .append("g")
        //     .classed('sexDiffChart', true)
        //     .attr("transform", "translate(" + lineChartMargin.left + "," + BAR_TOP_OFFSET + ")");
        //
        // const journeyDiffSVG = d3.select(".journeyDiffChart").append('svg')
        //     .attr('width', barChartWidth + lineChartMargin.left + lineChartMargin.right)
        //     .attr('height', barChartHeight + lineChartMargin.top + lineChartMargin.bottom)
        //     .append("g")
        //     .classed('journeyDiffChart', true)
        //     .attr("transform", "translate(" + lineChartMargin.left + "," + BAR_TOP_OFFSET + ")");
        //
        // const marketDiffSVG = d3.select(".marketDiffChart").append('svg')
        //     .attr('width', barChartWidth + lineChartMargin.left + lineChartMargin.right)
        //     .attr('height', barChartHeight + lineChartMargin.top + lineChartMargin.bottom)
        //     .append("g")
        //     .classed('marketDiffChart', true)
        //     .attr("transform", "translate(" + lineChartMargin.left + "," + BAR_TOP_OFFSET + ")");


        const calcExtents = data => {
            let yExtents = [0, 0];
            data.forEach((d)=> {
                const temp = d3.extent([d.saturday, d.sunday, d.week])
                yExtents = [Math.min(temp[0], yExtents[0]), Math.max(temp[1], yExtents[1])];
        });

            return yExtents

        }

        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        const alphabetArray = alphabet.split('');
        const formatEntryData = data=> {
            return data.map(d=>({
                saturday: d.entry_saturday,
                sunday: d.entry_sunday,
                week: d.entry_week,
                station: d.station,
                year: parseTime(d.year)
            }));
        }
        const formatExitData = data => {

            return data.map(d=>({
                saturday: d.exit_saturday,
                sunday: d.exit_sunday,
                week: d.exit_week,
                station: d.station,
                year: parseTime(d.year)
            }));

        }

        const aggregateData = ({yearData}) => {
            const entryData = formatEntryData(yearData);
            const exitData = formatExitData(yearData);
            return prepareDataForLine(entryData, exitData);
        }


        const filterDataByCity = city => {
            const filtered = dataStore.yearData.filter(d=>d.station === city);
            const entryData = formatEntryData(filtered);
            const exitData = formatExitData(filtered);
            return prepareDataForLine(entryData, exitData)
        };

        const prepareDataForLine = (entryData, exitData) => {
            const entryExtents = calcExtents(entryData);
            const entrySaturday = entryData.map(d=>({
                day: 'saturday',
                value: d.saturday,
                year: d.year,
                type: 'entry',
                color: 'green',
                extents: entryExtents
            })).filter(d=>!isNaN(d.value));
            const entrySunday = entryData.map(d=>({
                day: 'sunday',
                value: d.sunday,
                year: d.year,
                type: 'entry',
                color: 'blue',
                extents: entryExtents
            })).filter(d=>!isNaN(d.value));
            const entryWeek = entryData.map(d=>({
                day: 'week',
                value: d.week,
                year: d.year,
                type: 'entry',
                color: 'orange',
                extents: entryExtents
            })).filter(d=>!isNaN(d.value));

            const exitExtents = calcExtents(exitData);
            const exitSaturday = exitData.map(d=>({
                day: 'saturday',
                value: d.saturday,
                year: d.year,
                type: 'exit',
                color: 'green',
                extents: exitExtents
            })).filter(d=>!isNaN(d.value));
            const exitSunday = exitData.map(d=>({
                day: 'sunday',
                value: d.sunday,
                year: d.year,
                type: 'exit',
                color: 'blue',
                extents: exitExtents
            })).filter(d=>!isNaN(d.value));
            const exitWeek = exitData.map(d=>({
                day: 'week',
                value: d.week,
                year: d.year,
                type: 'exit',
                color: 'orange',
                extents: exitExtents
            })).filter(d=>!isNaN(d.value));

            return [entrySaturday, entrySunday, entryWeek, exitSaturday, exitSunday, exitWeek];

        }

        const formatBarData = (data)=> {
            if (!data) return;
            const {age, journey, market} = data;
            const ageData = [];
            if (age.length === 0 || journey.length === 0 || market.length === 0) alert(' Error in CSV and JSON name');
            ageMap.forEach((category, key)=> ageData.push({category, value: age[0][key] + age[1][key]}));

            const sexData = [{category: 'Male', value: age[0].male + age[1].male},
                {category: 'Female', value: age[0].female + age[1].female}];

            const journeyData = [];
            journeyMap.forEach((category, key)=> journeyData.push({
                category,
                value: journey[0][key] + journey[1][key]
            }))

            const marketData = [];
            marketMap.forEach((category, key)=> marketData.push({category, value: market[0][key] + market[1][key]}));

            return [
                {label: 'Age', data: ageData, selector: 'ageChart', color: 'green'},
                {label: 'Sex', data: sexData, selector: 'sexChart', color: 'steelblue'},
                {label: 'Journey', data: journeyData, selector: 'journeyChart', color: 'orange'},
                {label: 'Market', data: marketData, selector: 'marketChart', color: 'grey'}];
        }
        const filetBarDataByStation = station => {
            const {ageData, marketData, journeyData} = dataStore;
            const age = ageData.filter(d=>d.station === station);
            const journey = journeyData.filter(d=>d.station === station);
            const market = marketData.filter(d=>d.station === station);
            return formatBarData({age, journey, market});

        }

        const makeBarChart = (bardata) => {
            const {label, selector, data, color} = bardata;
            const x = d3.scaleBand()
                .range([0, barChartWidth])
                .padding(0.1);
            const y = d3.scaleLinear()
                .range([barChartHeight - BAR_OFFSET, 0]);

            x.domain(data.map(d=>d.category));
            y.domain([0, d3.max(data, d=>d.value)]);

            let barChart = null;

            switch (label) {
                case 'Age':
                    barChart = ageSVG;
                    break;
                case 'Sex':
                    barChart = sexSVG
                    break;
                case 'Journey':
                    barChart = journeyChartSVG;
                    break;
                case 'Market':
                    barChart = marketSVG;
                    break;
                default:
                    return barChart;
            }

            const barGroup = barChart.append('g').classed('barGroup', true);
            barGroup.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr('fill', selectColor)
                .attr("x", d=>x(d.category))
        .attr("width", x.bandwidth())
                .attr("y", d=>y(d.value))
        .attr("height", d=> barChartHeight - BAR_OFFSET - y(d.value));


            barGroup.append("g")
                .attr("transform", "translate(0," + (barChartHeight - BAR_OFFSET) + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");


            barGroup.append("g")
                .call(d3.axisLeft(y)
                    .ticks(6, 's'));

            // d3.select('body').classed('modal', true);
            // d3.select('.zoomRect').classed('modal', true);
            // d3.select('.closebarChart').on('click', ()=> {
            //     d3.select('body').classed('modal', false);
            //     d3.select('.zoomRect').classed('modal', false);
            //     d3.select('.barChartWrapper').classed('showMe', false);
            // })

        }

        const barChartFactory = station => {
            console.log(station, 'clicked')
            currentStationSelection = station;
            const bardata = filetBarDataByStation(station);
            d3.select('.mainBarWrapper').classed('showMe', true);
            d3.select('.barChartWrapper').classed('showMe', true);
            d3.selectAll('.barGroup').remove();
            bardata.forEach(bar=>makeBarChart(bar))

        }

        const formatBarDiffData = (options)=> {
            console.log(options, 'Selected')
            // const selectA = filetBarDataByStation('WoodLane');
            // const selectB = filetBarDataByStation('RoyalOak');
            const selectA = filetBarDataByStation(options[0]);
            const selectB = filetBarDataByStation(options[1]);
            const barDiffData = [];
            selectA.forEach((item, index)=> {
                const data = item.data.map((d, i)=> {
                    const nextVal = selectB.filter(d=>d.label === item.label)[0];
            return {
                category: alphabetArray[i].toUpperCase(),
                valueA: d.value,
                valueB: nextVal.data.filter(e=>e.category === d.category)[0].value,
                label: d.category
        }
        })
            barDiffData.push({label: item.label, data});
        })

            return barDiffData;

        }


        const dropDownFactory = ({nodes})=> {
            const stations = nodes.map(d=>d.name).filter(d=>d !== undefined);
            d3.select('.showBarDiff').style('display', 'block');
            d3.select('.barChartDropDown').classed('showMe', true);
            d3.selectAll('select').remove();
            makeDropDown(stations);
            d3.select('.lineMode').classed('showMe', true)
        }


        const barDiffFactory = () => {
            //  d3.select('.showBarDiff').on('click', ()=> {
            // d3.select('.barChartWrapper').classed('showMe', true);
            const leftSelect = d3.select('.selectLeft').property('value')
            const el = d3.selectAll('.station-circle');
            const circles = el._groups[0];
            const selection = Array.from(circles).filter(el=>d3.select(el).datum().name === leftSelect)[0];
            d3.select(selection).attr('fill', otherColor)
            //  const rightSelect = d3.select('.selectRight').property('value')
            const barDiffdata = formatBarDiffData([currentStationSelection, leftSelect]);
            d3.select('.barChartWrapper').classed('showMe', true);
            d3.selectAll('.barGroup').remove();
            barDiffdata.forEach(bar=>makeBarDiffChart(bar))

            //   })


        }
        const makeBarDiffChart = (bardata)=> {
            const {label, color, data} = bardata;
            const width = barChartWidth;
            const x0 = d3.scaleBand()
                .rangeRound([0, width - BAR_OFFSET])
                .paddingInner(0.1);

            const x1 = d3.scaleBand()
                .padding(0.05);
            const z = d3.scaleOrdinal()
                .range([selectColor, otherColor]);
            const alphas = data.map(d=>d.category).reverse();
            const y = d3.scaleLinear()
                .rangeRound([barChartHeight, 0]);
            const keys = ['valueA', 'valueB'];
            x0.domain(data.map(d=> d.category));
            x1.domain(keys).rangeRound([0, x0.bandwidth()]);
            y.domain([0, d3.max(data, d=> d3.max(keys, key=> d[key]))]).nice(); //Same as Math.floor

            let barChart = null;
            let legendData = null;
            switch (label) {
                case 'Age':
                    barChart = ageSVG;
                    legendData = ageInCSV.slice().reverse();
                    break;
                case 'Sex':
                    barChart = sexSVG;
                    legendData = ['Male', 'Female'].slice().reverse();
                    break;
                case 'Journey':
                    barChart = journeyChartSVG;
                    legendData = journeyInCSV.slice().reverse();
                    break;
                case 'Market':
                    barChart = marketSVG;
                    legendData = marketInCSV.slice().reverse();
                    break;
                default:
                    return barChart;
            }


            const barGroup = barChart.append("g").classed('barGroup', true)
            barGroup.append('g').selectAll("g")
                .data(data)
                .enter().append("g")
                .attr("transform", d=> "translate(" + x0(d.category) + ",0)")
        .selectAll("rect")
                .data(d=>keys.map(key=> ({key: key, value: d[key]})))
        .enter().append("rect")
                .attr("x", d=>x1(d.key))
        .attr("y", d=>y(d.value))
        .attr("width", x1.bandwidth())
                .attr("height", d=> barChartHeight - y(d.value))
        .attr("fill", (d)=> z(d.key));

            barGroup.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + (barChartHeight) + ")")
                .call(d3.axisBottom(x0));

            barGroup.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y).ticks(null, "s"))
                .append("text")
                .attr("x", 2)
                .attr("y", y(y.ticks().pop()) + 0.5)


            const legend = barGroup.append("g")

                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .attr("text-anchor", "end")
                .selectAll("g")
                .data(legendData)
                .enter().append("g")
                .attr("transform", (d, i)=> "translate(0," + i * 20 + ")");

            legend.append("rect")
                .attr("x", width - BAR_OFFSET)
                .attr("width", 19)
                .attr("height", 19)
                .attr("fill", 'lightgrey');

            legend.append("text")
                .attr("x", width - BAR_OFFSET - 14)
                .attr("y", 9.5)
                .attr("dy", "0.32em")
                .text(d=> d);

            legend.append("text")
                .attr("x", width - BAR_OFFSET + 12)
                .attr("y", 9.5)
                .attr("dy", "0.32em")
                .text((d, i)=> alphas[i]);


            // d3.select('body').classed('modal', true);
            // d3.select('.zoomRect').classed('modal', true);
            // d3.select('.closebarDiifChart').on('click', ()=> {
            //     d3.select('body').classed('modal', false);
            //     d3.select('.zoomRect').classed('modal', false);
            //     d3.select('.barDiffChartWrapper').classed('showMe', false);
            // })


        }


        const makeLine = (data, station) => {
            if (data.length < 1) return;
            d3.select('.linechart').classed('showMe', true);
            const {type, extents, color, day} = data[0];
            const x = d3.scaleTime().range([0, lineChartWidth]);
            const y = d3.scaleLinear().range([lineChartHeight, 0]);
            const mySVG = (type === 'entry') ? entryChartSVG : exitChartSVG;
            const xAxis = d3.axisBottom(x);
            const yAxis = d3.axisLeft(y)
                .ticks(6, 's')

            const valueline = d3.line()
                .x(d=>x(d.year))
        .y(d=>y(d.value));

            x.domain(d3.extent(data, d=> d.year));
            y.domain(extents);

            const line = mySVG.append("g")
                .classed('lineGroup', true)
                .classed(`line-${day}`, true)
                .classed('visible', true)
                .attr("transform", "translate(" + lineChartMargin.left + "," + lineChartMargin.top + ")");

            line.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + lineChartHeight + ")")
                .call(xAxis);

            line.append("g")
                .attr("class", "axis axis--y")
                .attr("transform", 'translate(0,0 )')
                .call(yAxis)
                .append("text")
                .attr("class", "axis-title")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .attr("fill", "#5D6971")
                .text("Unit");

            line.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", valueline)
                .attr('stroke', color)

            d3.select(`.${day}`).style('background', color)
            d3.select('.station').text(station ? station : 'Summary Data');
            d3.select('body').classed('modal', true);
            d3.select('.zoomRect').classed('modal', true);
            d3.select('.close').on('click', ()=> {
                d3.select('body').classed('modal', false);
            d3.select('.zoomRect').classed('modal', false);
            d3.select('.linechart').classed('showMe', false);
        })

            d3.select(`.${day}`).on('click', ()=> {
                const isVisible = d3.select(`.line-${day}`).attr('class').indexOf('notVisible') > 0;
            d3.selectAll(`.line-${day}`).classed('notVisible', !isVisible);
            d3.select(`.${day}`).classed('notVisibleLegend', !isVisible);

        })

        }


        const lineFactory = station => {
            const lineData = filterDataByCity(station)
            d3.selectAll('.lineGroup').remove();
            lineData.forEach(line=>makeLine(line, station))

        }

        const addSummaryListener = ()=> {
            // const aggData = aggregateData(dataStore);
            d3.select('.lineMode').on('click', ()=> {
                d3.selectAll('.lineGroup').remove();
            lineFactory(currentStationSelection);
            //aggData.forEach(line=>makeLine(line))
        })
        }


        const makeDropDown = categories => {
            const dropleft = d3.select('.dropleft')
                .append('select')
                .attr('class', 'selectLeft')
                .on('change', ()=> barDiffFactory())

            dropleft.selectAll('option')
                .data(categories).enter()
                .append('option')
                .text(d=>d);


            //
            // const dropRight = d3.select('.dropRight')
            //     .append('select')
            //     .attr('class', 'selectRight')
            //
            // dropRight.selectAll('option')
            //     .data(categories).enter()
            //     .append('option')
            //     .text(d=> d);
        }


        function map(selection) {
            selection.each(function (data) {
                // Convert data to standard representation
                dataStore = data;
                console.log(dataStore, 'store')
                data = mangleData(data.stations);
                addSummaryListener();
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


                var g = svg.enter().append("g").classed('stationWrapper', true);

                // Fill with white rectangle to capture zoom events
                g.append("rect")
                    .attr("width", "100%")
                    .attr("height", "100%")
                    .attr('fill', 'white')
                    .classed('zoomRect', true);

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
                    .attr("class", function (d) {
                        return d.name;
                    })
                    .classed("line", true).on("click", function (line) {
                    dropDownFactory(line);

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
                    lines.style("opacity", function (d) {
                        if (d.title === name) {
                            stationOrder = d.stations;
                            lineName = d.name;
                        }
                    });
                    //These are all the stations that are on the selected line
                    var thisLineStations = d3.selectAll(".station").selectAll("." + lineName);
                    //here we have the list of paths that correspond to the stations
                    var idIndicator = false;
                    var index = -1;

                    for (var k = 0; k < pathStorage.length; k++) {
                        if (pathStorage[k].id != null) {
                            if (pathStorage[k].id == name) {
                                idIndicator = true;
                                index = k;
                            }
                        }
                    }
                    //The line is not currently transformed
                    if (idIndicator == false) {
                        var path = d3.select(this).attr('d');
                        map.highlightLine(name);
                        //Store the old path to transition back to
                        pathStorage.push({"id": name, "path": path});
                        //Construct the object that ties names to stations and coordinates
                        for (var j = 0; j < stationOrder.length; j++) {
                            if (j !== 0) {
                                newPath += "L" + (90 + j * 90) + "," + 200;
                                stationPoints.push({name: stationOrder[j], coords: [(90 + j * 90), 200]});
                            }
                            else {
                                newPath += (90) + "," + 200;
                                stationPoints.push({name: stationOrder[j], coords: [(90), 200]});
                            }
                        }
                    }
                    else {
                        map.unhighlightAll();
                        newPath = pathStorage[index].path;
                        pathStorage.splice(index, 1);
                    }

                    //Here we append circles that represent each station on the line
                    var svgCir = d3.select("#line").selectAll("g").data(stationPoints);
                    svgCir.exit().remove();
                    svgCir = svgCir.enter().append("g").merge(svgCir);
                    svgCir.append("circle")
                        .attr("class", "station-circle")
                        .attr("cx", function (d, i) {
                            return d.coords[0]
                        })
                        .attr("cy", function (d) {
                            return d.coords[1]
                        })
                        .attr("r", 6).style("visibility", "visible")
                        .on("click", function (d) {
                            console.log(d, 'sss')
                            svgCir.selectAll('circle').attr('fill', bgColor)
                            d3.select(this).attr('fill', selectColor)
                            barChartFactory(d.name)


                        })
                        .on("mouseover", function (d) {
                        })
                        .attr("stroke", fgColor)
                        .attr("fill", bgColor)
                        .attr("stroke-width", lineWidth / 2);

//Set the staion names, first append g
var station_text = d3.select("#line").selectAll("g").data(stationPoints);

station_text.exit().remove();

station_text = station_text.enter().append("g").attr("display", "inline").merge(station_text);


                    var text = station_text.selectAll('text')
                        .data(stationPoints);
                    text.exit().remove();
                    text = text.enter()
                        .append('text').merge(text);
                    //Set station names
                    text.attr('x', function (d) {
                        return d.coords[0] + 30;
                    })
                        .attr('y', function (d, i) {
                            if (i % 2 === 0) {
                                return d.coords[1] + 20;
                            }
                            else return d.coords[1] - 20;
                        })
                        .attr("position", "absolute")
                        .text(function (d) {
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
      labels.enter().append("g").attr("id", function (d) {
        return d.name;
      }).classed("label", true).on("click", function () {
        var label = d3.select(this);
        var name = label.attr("id");

        selectStation(name);

        dispatch$$1.call("click", this, name);
      }).append("text").text(function (d) {
        return d.text;
      }).attr("dy", 0.1).attr("x", function (d) {
        return xScale(d.x + d.labelShiftX) + textPos(d).pos[0];
      }).attr("y", function (d) {
        return yScale(d.y + d.labelShiftY) - textPos(d).pos[1];
      }) // Flip y-axis
      .attr("text-anchor", function (d) {
        return textPos(d).textAnchor;
      }).style("display", function (d) {
        return d.hide !== true ? "block" : "none";
      }).style("font-size", 1.2 * lineWidth / lineWidthMultiplier + "px").style("-webkit-user-select", "none").attr("class", function (d) {
        return d.marker.map(function (marker) {
          return marker.line;
        }).join(" ");
      }).classed("highlighted", function (d) {
        return d.visited;
      }).call(wrap);

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
            var river = d3.select("#tube-map").selectAll(".river");

            interchanges.style("visibility", "hidden");

            d3.select('#tube-map').select('svg').attr('height', '200')
            d3.select('.legendWrapper').style('display', 'none')

           // d3.select('body').style('overflow', 'auto')
            d3.select('.stationWrapper')
                .attr("transform", "translate(5,-100  )");


            lines.style("visibility", function (e) {
                return (e.title === name) ? "visible" : "hidden";
            });

            stations.style("visibility", function (e) {
                return (e.title === name) ? "visible" : "hidden";
            });

            labels.style("visibility", function (e) {
                return (e.title === name) ? "visible" : "hidden";
            });

            river.style("visibility", "hidden");
        };

         map.setTimeStop = function(){
           this.timeStop = false;
         }

        map.endTimer = function(){
          this.timeStop = !this.timeStop;

        }

	map.startTimer = function(csvData, timeTable, stationData, type){

		//append circles to the stations with initial counts


		    var lines = d3.select("#tube-map").selectAll(".line");
		    var labels = d3.select("#tube-map").selectAll(".labels");
				var interchanges = d3.select("#tube-map").selectAll(".interchanges");
        var river = d3.select("#tube-map").selectAll(".river");


        river.style("visibility", "hidden");

				lines.style("opacity", 0.5);
				// stations.classed("translucent", true);
				//labels.classed("translucent", true);


		var stations = d3.select("#tube-map").selectAll(".station");

		var self_item = map;

    var journeyCount = "";

    if(type === "both"){
		var obj = ["entry", "exit"];
    journeyCount = "entry";
  }
  else if(type === "entry"){
    var obj = ["entry"];
    journeyCount = "entry";
  }
  else if(type === "exit"){
    var obj = ["exit"];
    journeyCount = "exit";

  }



		var svg = d3.select("#tube-map").selectAll(".station").selectAll("g").selectAll("circle").data(obj);

		svg.exit().remove();

		svg = svg.enter().append("circle").attr("class", function(d,i){
			if(d === "entry"){
				return "entry";
			}
			else{
				return "exit";
			}

		}).merge(svg);

		svg.attr("class", "time_circle").attr("r", 6).attr("cx", function(d){


			if(d === "entry"){
					return xScale(d3.select(this.parentNode)._groups[0][0].__data__.x + 1);
			}
			else{
					return xScale(d3.select(this.parentNode)._groups[0][0].__data__.x - 1);
			}

		}).attr("cy", function(d){

			if(d === "entry"){
				return yScale(d3.select(this.parentNode)._groups[0][0].__data__.y);
			}
			else{
				return yScale(d3.select(this.parentNode)._groups[0][0].__data__.y);
			}

		}).attr("class", function(d){
			if(d === "entry"){
				var mystring = d3.select(this.parentNode)._groups[0][0].__data__.name + "e";

				mystring = mystring.split('&').join('');
				mystring = mystring.replace(' ','');
				mystring = mystring.split('\'').join('');

				return mystring;
			}else{
				var mystring = d3.select(this.parentNode)._groups[0][0].__data__.name + "x";
				mystring = mystring.split('&').join('');
				mystring = mystring.replace(' ','');
				mystring = mystring.split('\'').join('');

				return mystring;
			}

		}).style("fill", function(d){
			if(d === "entry"){
				return "red";
			}
			else{
				return "blue";
			}
		});




			var time_data = setTimeData(csvData, timeTable, stationData);


		var format_entry = d3.timeFormat("%S:%L");

		var tick = 0;

    var day = "am";

		//create a data structure that ties each station to the time passed through, and whether it was an entry or exit
		//Take that data and tie the count to the circles that will be at each staation
		map.timer = setInterval(function(elapsed) {
			var time = timeTable[tick];



      if(time === "12:00"){
        day = "pm";
      }
      if(time === "00:00"){
        day = "am";
      }
      if(time === "04:45"){
        console.log("we stopped")
        map.timeStop = true;
      }

      d3.select("#clock").text(time + " " + day );

			if(tick % 15 === 0){
        var journeys = 0;



console.log(time_data);

		time_data.forEach(function(d){
			//Select Al Entries


			var mystring = d.txt_name;

			mystring = mystring.split('&').join('');
				mystring = mystring.split(' ').join('');
			mystring = mystring.split('\'').join('');
			mystring = mystring.split('.').join('');
			mystring = mystring.split('\n').join('');
			var entries  = d3.select("#tube-map").selectAll("." + mystring + "e");
			var exits = d3.select("#tube-map").selectAll("." + mystring + "x");



      // var exitScale = d3.scale.linear()
      // .domain([0,d3.max(d.ext[0])])
      // .range([3,20])


			entries.transition().ease(d3.easeSin).duration(1000).attr("r", function(c){

				if(d != null){
					if(d.ent[0] != null){
						if(d.ent[0][""+ time + ""] != null){



              var entryScale = d3.scaleLinear()
              .domain([0,+d.ent[0].Total])
              .range([2,300]);

              var num = 0;

              if(d.int[0] != null){
                if(d.int[0][""+ time + ""]){
                  num = +d.ent[0]["" + time + ""] + +d.int[0][""+ time + ""];
                }
                else{
                 num = +d.ent[0]["" + time + ""];
                }
              }
              else{
                num = +d.ent[0]["" + time + ""];
              }


              journeys+=+d.ent[0][""+ time + ""];
							return entryScale(num);

						}

				}
					else{
						return 0;
					};
				}});

        d3.select("#journey").text("" + journeys + " Journeys");

				exits.transition().ease(d3.easeSin).duration(1000).attr("r", function(c){

					if(d != null){
						if(d.ext[0] != null){
							if(d.ext[0][""+ time + ""] != null){
                if(journeyCount === "exit"){
                    journeys+=+d.ext[0][""+ time + ""];
                }

                var num = 0;

                if(d.int[0] != null){
                  if(d.int[0][""+ time + ""]){
                    num = +d.ext[0]["" + time + ""] + +d.int[0][""+ time + ""];
                  }
                  else{
                   num = +d.ext[0]["" + time + ""];
                  }
                }
                else{
                  num = +d.ext[0]["" + time + ""];
                }




                var exitScale = d3.scaleLinear()
                .domain([0,+d.ext[0].Total])
                .range([2,300]);

								return exitScale(num);
							}
							else{
								return 0;
							}

						}
						else{
							return 0;
						};
					}});




    //

		});
}




	tick++;

  if (elapsed > 72000 || map.timeStop){

    clearInterval(map.timer)
    river.style("visibility", "visible");
    d3.select("#tube-map").selectAll("circle").remove();
    lines.style("opacity", 1);
    d3.timerFlush();
    var button = document.getElementById("tube-button");
      d3.select("#journey").text("");
      d3.select("#clock").text("");

    button.addEventListener("click", function() {
  startTimeAnimation();
}, false);

d3.select("#stopButton").remove();


    return;
  }
}, 50,2000);


	};


  map.stopTubeTimer = function(){

    document.getElementById("stopButton").click();
     var lines = d3.select("#tube-map").selectAll(".line");
      var river = d3.select("#tube-map").selectAll(".river");
      clearInterval(this.timer);

    river.style("visibility", "visible");
    d3.select("#tube-map").selectAll("circle").remove();
    lines.style("opacity", 1);
    d3.timerFlush();
    var button = document.getElementById("tube-button");
      d3.select("#journey").text("");
      d3.select("#clock").text("");

    button.addEventListener("click", function() {
  startTimeAnimation();
}, false);

d3.select("#stopButton").remove();
  }

        map.unhighlightAll = function () {

            d3.select('#tube-map').select('svg').attr('height', '1024')
            d3.select('body').style('overflow', 'hidden')
            d3.select('.legendWrapper').style('display', 'none')
            d3.select('.lineMode').classed('showMe', false);
            d3.select('.barChartWrapper').classed('showMe', false);
            d3.select('.barChartDropDown').classed('showMe', false);

            var lines = d3.select("#tube-map").selectAll(".line");
            var lines = d3.select("#tube-map").selectAll(".line");
            var stations = d3.select("#tube-map").selectAll(".station");
            var labels = d3.select("#tube-map").selectAll(".labels");
            var river = d3.select("#tube-map").selectAll(".river");

            var interchanges = d3.select("#tube-map").selectAll(".interchanges");

            interchanges.style("visibility", "visible");

            lines.style("visibility", "visible");
            stations.style("visibility", "visible");
            labels.style("visibility", "visible");
            river.style("visibility", "visible");
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

	function setTimeData(csvData, timeTable, stationData){


		var stations = d3.select("#tube-map").selectAll(".station");





				var format_exit = d3.timeFormat("%S:%L");




		var time_stamp = 0;

		var time_table_initial = [];

		var station_time_structure = [];


		var stations_array = []; // This will be the resulting array
for(var key in stationData.stations) {
  var entry = stationData.stations[key]; // This will be each of the three graded things
  entry.id = key; // e.g. "id": "assessment1"
  stations_array.push(entry)
}


//for each unique station, add the data of station numbers
stations_array.forEach(function(da){






				var entry = csvData.filter(function(d,i){
					//Access
						return d.StartStn === da.title && d.AEI === "A";
					// var string = da.toString();
					// return d.EntTimeHHMM === string;
				});


				var exit = csvData.filter(function(d,i){
					//Egress or exit
					return d.StartStn === da.title && d.AEI === "E";
					// var string = da.toString();
					// return d.EXTimeHHMM === string;
				});

				var inter = csvData.filter(function(d,i){

					return d.StartStn === da.title && d.AEI === "I";
				})



          //
					// var ent_filt = entry.filter(function(d){
					// 	return d.StartStn === data.__data__.name;
					// })
          //
					// var ext_filt = exit.filter(function(d){
					// 	return d.EndStation === data.__data__.name;
					// })

					var mystring = da.title;
					mystring = mystring.split(' ').join('')
					mystring = mystring.split('\n').join('')




					station_time_structure.push({gname: da.title, txt_name: mystring,  ent: entry, ext: exit, int: inter})




			});





		return station_time_structure;
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
                        if (nextNode.dir != null) {
                            direction = nextNode.dir.toLowerCase();
                        }
                        else {
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
            var offset = lineWidth * 2;

            var numLines = 0;
            if(data.text != null){

            numLines = data.text.split('\n').length;
          }
          else{
            numLines = data.name.split('\n').length;
          }


            var sqrt2 = Math.sqrt(2);

            switch (data.labelPos.toLowerCase()) {
                case "n":
                if(numLines != 1){
                  pos = [0, lineWidth * (numLines) + offset];
                  textAnchor = "middle";
                }
                else{
                  pos = [0, lineWidth * (numLines-1) + offset];
                  textAnchor = "middle";
                }

                    break;
                case "ne":
                    pos = [offset / sqrt2, (lineWidth * (numLines -1) + offset) / sqrt2];
                    textAnchor = "start";
                    break;
                case "e":
                    pos = [lineWidth*1.8, 0];
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

    Object.defineProperty(exports, '__esModule', {value: true});

})));
