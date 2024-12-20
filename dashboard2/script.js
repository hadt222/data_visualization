
// Chart 1 Code: Top 5 Countries
(function() {
const margin = { top: 40, right: 20, bottom: 50, left: 70 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create an SVG canvas and center the chart
const svg = d3.select("#chart1")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

// Load and process data
d3.csv("disney_plus_titles.csv").then(data => {
data.forEach(d => d.country = d.country ? d.country.split(",")[0] : "Unknown");
const processedData = d3.rollup(data, v => v.length, d => d.country);
const sortedData = Array.from(processedData, ([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

// Scales
const x = d3.scaleBand()
    .domain(sortedData.map(d => d.country))
    .range([0, width])
    .padding(0.2);
const y = d3.scaleLinear()
    .domain([0, d3.max(sortedData, d => d.count) + 10])
    .range([height, 0]);

// X and Y axes
svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));
svg.append("g")
    .call(d3.axisLeft(y));

// Bars with animation
svg.selectAll(".bar")
    .data(sortedData)
    .enter()
    .append("rect")
    .attr("x", d => x(d.country))
    .attr("y", height)
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("fill", d => d3.interpolateCool(Math.random()))
    .transition()
    .duration(1000)
    .attr("y", d => y(d.count))
    .attr("height", d => height - y(d.count));

// Labels with animation
svg.selectAll(".label")
    .data(sortedData)
    .enter()
    .append("text")
    .attr("x", d => x(d.country) + x.bandwidth() / 2)
    .attr("y", height)
    .attr("text-anchor", "middle")
    .attr("fill", "#333")
    .transition()
    .duration(1000)
    .attr("y", d => y(d.count) - 10)
    .text(d => d.count);
});
})();


// Chart 2 Code: Top 10 Directors
(function() {
const margin = { top: 40, right: 20, bottom: 50, left: 150 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create an SVG canvas and center the chart
const svg = d3.select("#chart2")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

// Load and process data
d3.csv("disney_plus_titles.csv").then(data => {
data.forEach(d => d.director = d.director || "Unknown");
const movies = data.filter(d => d.type === "Movie");
const directorCounts = d3.rollup(movies, v => v.length, d => d.director);
const sortedData = Array.from(directorCounts, ([director, count]) => ({ director, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

// Scales
const x = d3.scaleLinear()
    .domain([0, d3.max(sortedData, d => d.count) + 5])
    .range([0, width]);
const y = d3.scaleBand()
    .domain(sortedData.map(d => d.director))
    .range([0, height])
    .padding(0.2);

// X and Y axes
svg.append("g").call(d3.axisLeft(y));
svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

// Bars and Labels (hidden initially)
const bars = svg.selectAll(".bar")
    .data(sortedData)
    .enter()
    .append("rect")
    .attr("y", d => y(d.director))
    .attr("x", 0)
    .attr("width", 0)
    .attr("height", y.bandwidth())
    .attr("fill", d => d3.interpolateWarm(Math.random()));

const labels = svg.selectAll(".label")
    .data(sortedData)
    .enter()
    .append("text")
    .attr("x", 0)
    .attr("y", d => y(d.director) + y.bandwidth() / 2)
    .attr("dy", ".35em")
    .attr("fill", "#333");

// Intersection Observer for scroll-triggered animation
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animate bars
            bars.transition()
                .duration(1000)
                .attr("width", d => x(d.count));

            // Animate labels
            labels.transition()
                .duration(1000)
                .attr("x", d => x(d.count) + 5)
                .text(d => d.count);

            // Disconnect observer after animation
            observer.disconnect();
        }
    });
});

// Observe the chart container
const chartContainer = document.querySelector("#chart2");
observer.observe(chartContainer);
});
})();


// Chart 3 Code: Content by Year and Type
(function() {
const margin = { top: 20, right: 30, bottom: 50, left: 60 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create an SVG canvas and center the chart
const svg = d3.select("#chart3")
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

// Load and process the data
d3.csv("disney_plus_titles.csv").then(data => {
data.forEach(d => {
    d.year_added = d.date_added ? +d.date_added.split(',').pop().trim() : 2020;
    d.Type = d.type || "Unknown";
});

const yearCounts = d3.rollups(
    data,
    v => ({
        total: v.length,
        movies: v.filter(d => d.Type === "Movie").length,
        tvShows: v.filter(d => d.Type === "TV Show").length
    }),
    d => d.year_added
);

const sortedYears = yearCounts.sort((a, b) => a[0] - b[0]);
const years = sortedYears.map(d => d[0]);
const totals = sortedYears.map(d => d[1].total);
const movies = sortedYears.map(d => d[1].movies);
const tvShows = sortedYears.map(d => d[1].tvShows);

// Scales
const x = d3.scaleLinear().domain([d3.min(years), d3.max(years)]).range([0, width]);
const y = d3.scaleLinear().domain([0, d3.max(totals)]).range([height, 0]);

// X and Y axes
svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));
svg.append("g").call(d3.axisLeft(y));

// Line generator
const lineGenerator = d3.line().x((d, i) => x(years[i])).y(d => y(d));

// Create paths for each line
const totalPath = svg.append("path")
    .datum(totals)
    .attr("fill", "none")
    .attr("stroke", "#1abc9c")
    .attr("stroke-width", 3)
    .attr("d", lineGenerator)
    .attr("stroke-dasharray", function() { return this.getTotalLength(); })
    .attr("stroke-dashoffset", function() { return this.getTotalLength(); });

const moviePath = svg.append("path")
    .datum(movies)
    .attr("fill", "none")
    .attr("stroke", "#e74c3c")
    .attr("stroke-width", 3)
    .attr("d", lineGenerator)
    .attr("stroke-dasharray", function() { return this.getTotalLength(); })
    .attr("stroke-dashoffset", function() { return this.getTotalLength(); });

const tvPath = svg.append("path")
    .datum(tvShows)
    .attr("fill", "none")
    .attr("stroke", "#9b59b6")
    .attr("stroke-width", 3)
    .attr("d", lineGenerator)
    .attr("stroke-dasharray", function() { return this.getTotalLength(); })
    .attr("stroke-dashoffset", function() { return this.getTotalLength(); });

// Intersection Observer for scroll-triggered animation
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animate the Total line
            totalPath.transition()
                .duration(2000)
                .attr("stroke-dashoffset", 0);

            // Animate the Movies line
            moviePath.transition()
                .duration(2000)
                .delay(500)
                .attr("stroke-dashoffset", 0);

            // Animate the TV Shows line
            tvPath.transition()
                .duration(2000)
                .delay(1000)
                .attr("stroke-dashoffset", 0);

            // Disconnect observer after animation
            observer.disconnect();
        }
    });
});

// Observe the chart container
const chartContainer = document.querySelector("#chart3");
observer.observe(chartContainer);

// Add legend
const legend = svg.append("g")
    .attr("transform", `translate(${width - 150}, 20)`);

legend.append("circle")
    .attr("cx", 10)
    .attr("cy", 0)
    .attr("r", 5)
    .style("fill", "#1abc9c");
legend.append("text")
    .attr("x", 20)
    .attr("y", 5)
    .text("Total")
    .style("font-size", "12px");

legend.append("circle")
    .attr("cx", 10)
    .attr("cy", 20)
    .attr("r", 5)
    .style("fill", "#e74c3c");
legend.append("text")
    .attr("x", 20)
    .attr("y", 25)
    .text("Movies")
    .style("font-size", "12px");

legend.append("circle")
    .attr("cx", 10)
    .attr("cy", 40)
    .attr("r", 5)
    .style("fill", "#9b59b6");
legend.append("text")
    .attr("x", 20)
    .attr("y", 45)
    .text("TV Shows")
    .style("font-size", "12px");
});
})();




