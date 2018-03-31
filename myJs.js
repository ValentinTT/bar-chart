const extractValues = (data, index = 0) => data
    .reduce((acc, curr) => [...acc, curr[index]], []);

axios.get("https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json")
    .then((response) => drawBarChart(response.data.data));

const drawBarChart = (data) => {
    let margin = {left: 70, right: 50, top: 50, bottom: 50},
        barWidth = 3,
        width = data.length * barWidth + (margin.left + margin.right),
        height = 500,
        xAxisLength = width - (margin.left + margin.right),
        yAxisLength = height - (margin.top + margin.bottom),
        tooltipWidth = 180,
        tooltipHeight = 50;

    let parseTime = d3.timeParse("%Y-%m-%d"),
        formatTime = d3.timeFormat("%B %d, %Y"),
        productDates = extractValues(data, 0).map(v => parseTime(v)),
        productNumber = extractValues(data, 1);

    let svgContainer = d3.select("body")
        .append("div")
            .classed("chart-container", true)
        .append("svg")
            .attr("width", width)
            .attr("height", height);
    svgContainer.append("text")
        .classed("chart-title", true)
        .text("US Gross Domestic Product");
    let dim = d3.select(".chart-title").node().getBoundingClientRect();
    d3.select(".chart-title")
        .attr("x", (width/2) - (dim.width/2))
        .attr("y", (margin.top / 2) + (dim.height/2));

    let xScale = d3.scaleTime()
        .domain(d3.extent(productDates))
        .range([0, xAxisLength]);
    let xAxis = d3.axisBottom(xScale);
    
    svgContainer.append("g")
        .classed("x-axis", true)
        .attr("transform", "translate(" + margin.left + ", " + (height - margin.bottom) + ")")
        .call(xAxis);

    let yScale = d3.scaleLinear()
        .domain(d3.extent(productNumber).reverse())
        .range([0, yAxisLength]);
    let yAxis = d3.axisLeft(yScale);
    svgContainer.append("g")
        .classed("y-axis", true)
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
        .call(yAxis);

    let tooltip = d3.select('body')
        .append("div")
        .classed("tooltip", true)
            .style("width", tooltipWidth + "px")
            .style("height", tooltipHeight + "px")
            .style("top", "0px")
            .style("visibility", "hidden");
    tooltip.append("p").classed("tooltip-date", true);
    tooltip.append("p").classed("tooltip-data", true);
    
    svgContainer.append("g")
    .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
            .classed("bar", true)
            .attr("x", d => margin.left + xScale(parseTime(d[0])))
            .attr("y", d => margin.top + yScale(d[1]))
            .attr("width", barWidth)
            .attr("height", d => yAxisLength - yScale(d[1]))
        .on("mouseover", d => {
            tooltip.transition();
            tooltip
                .style("left", d3.event.pageX - (tooltipWidth / 2)+ "px")
                .style("top", d3.event.pageY - (tooltipHeight + 25) + "px")
                .style("visibility", "visible")
                .transition()
                .duration(100)
                    .style("opacity", .7);
            tooltip.select(".tooltip-date")
                .text("Date: " + formatTime(parseTime(d[0])));
            tooltip.select(".tooltip-data")
                .text("$" + d[1] + " billion");
            
        })
        .on("mouseout", d => {
            tooltip.transition();
            tooltip.transition().duration(300)
                .style("opacity", 0)
                .style("left", d3.event.pageX - (tooltipWidth / 2)+ "px")
                .style("top", d3.event.pageY - (tooltipHeight + 25) + "px")    
        });
}