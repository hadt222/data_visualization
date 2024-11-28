document.addEventListener('DOMContentLoaded', function () {
    // Dashboard toggling logic
    const btnDashboard1 = document.getElementById('btn-dashboard-1');
    const btnDashboard2 = document.getElementById('btn-dashboard-2');
    const dashboard1 = document.getElementById('dashboard-1');
    const dashboard2 = document.getElementById('dashboard-2');

    btnDashboard1.addEventListener('click', () => toggleDashboard(dashboard1, dashboard2, btnDashboard1, btnDashboard2));
    btnDashboard2.addEventListener('click', () => toggleDashboard(dashboard2, dashboard1, btnDashboard2, btnDashboard1));

    function toggleDashboard(show, hide, activeBtn, inactiveBtn) {
        show.classList.remove('hidden');
        hide.classList.add('hidden');
        activeBtn.classList.add('active');
        inactiveBtn.classList.remove('active');
    }

    // Reusable function for setting up legends
    function addLegend(svg, labels, colors, x, y) {
        const legend = svg.append("g").attr("transform", `translate(${x},${y})`);
        labels.forEach((label, i) => {
            legend.append("circle")
                .attr("cx", 10)
                .attr("cy", i * 20)
                .attr("r", 6)
                .style("fill", colors[i]);
            legend.append("text")
                .attr("x", 20)
                .attr("y", i * 20 + 5)
                .text(label)
                .attr("font-size", "12px");
        });
    }

    function createNetflixChart() {
        const margin = { top: 40, right: 20, bottom: 50, left: 50 };
        const width = 800 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;
    
        const svg = d3.select("#chart1")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    
        // Define new color palette
        const colorScale = d3.scaleOrdinal()
            .domain(["Top 1", "Top 2", "Top 3", "Top 4", "Top 5", "Top 6", "Top 7", "Top 8", "Top 9", "Top 10"])
            .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]);
    
        d3.csv("netflix_titles.csv").then(data => {
            const processedData = d3.rollup(
                data,
                v => v.length,
                d => d.country?.split(",")[0] || "Other Countries"
            );
            const sortedData = Array.from(processedData, ([country, count]) => ({ country, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
    
            const x = d3.scaleBand()
                .domain(sortedData.map(d => d.country))
                .range([0, width])
                .padding(0.2);
    
            const y = d3.scaleLinear()
                .domain([0, d3.max(sortedData, d => d.count) + 500])
                .range([height, 0]);
    
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x));
    
            svg.append("g")
                .call(d3.axisLeft(y));
    
            // Draw bars with the new color palette
            svg.selectAll(".bar")
                .data(sortedData)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.country))
                .attr("y", d => y(d.count))
                .attr("width", x.bandwidth())
                .attr("height", d => height - y(d.count))
                .attr("fill", (d, i) => colorScale(`Top ${i + 1}`)); // Apply color from the palette
    
            svg.selectAll(".bar-label")
                .data(sortedData)
                .enter()
                .append("text")
                .attr("class", "bar-label")
                .attr("x", d => x(d.country) + x.bandwidth() / 2)
                .attr("y", d => y(d.count) - 10)
                .attr("text-anchor", "middle")
                .text(d => d.count);
        });
    }
    
    
    createNetflixChart();

    // Section 2: Movie & TV Show Split
(function() {
const svg = d3.select("#chart2");
const margin = { top: 50, right: 150, bottom: 50, left: 150 };
const chartWidth = 800 - margin.left - margin.right;
const chartHeight = 600 - margin.top - margin.bottom;

const chart = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Define color scale
const color = d3.scaleOrdinal()
    .domain(["Movie", "TV Show"])
    .range(["#4caf50", "#2196f3"]); // Updated color palette (green for Movie, blue for TV Show)

d3.csv("netflix_titles.csv").then(data => {
    const countryData = d3.rollup(data, v => {
        return {
            movie: v.filter(d => d.type === "Movie").length,
            tvshow: v.filter(d => d.type === "TV Show").length
        };
    }, d => d.country?.split(",")[0]);

    const processedData = Array.from(countryData)
        .sort((a, b) => b[1].movie + b[1].tvshow - (a[1].movie + a[1].tvshow))
        .slice(0, 10)
        .map(([country, counts]) => ({
            country,
            movie: counts.movie / (counts.movie + counts.tvshow),
            tvshow: counts.tvshow / (counts.movie + counts.tvshow)
        }));

    const xScale = d3.scaleLinear().domain([0, 1]).range([0, chartWidth]);
    const yScale = d3.scaleBand()
        .domain(processedData.map(d => d.country))
        .range([0, chartHeight])
        .padding(0.2);

    // Draw bars for Movies
    chart.selectAll(".movie-bar")
        .data(processedData)
        .enter()
        .append("rect")
        .attr("class", "movie-bar")
        .attr("y", d => yScale(d.country))
        .attr("height", yScale.bandwidth())
        .attr("x", 0)
        .attr("width", d => xScale(d.movie))
        .attr("fill", color("Movie"));

    // Draw bars for TV Shows
    chart.selectAll(".tvshow-bar")
        .data(processedData)
        .enter()
        .append("rect")
        .attr("class", "tvshow-bar")
        .attr("y", d => yScale(d.country))
        .attr("height", yScale.bandwidth())
        .attr("x", d => xScale(d.movie))
        .attr("width", d => xScale(d.tvshow))
        .attr("fill", color("TV Show"));

    // Add percentage text for Movies
    chart.selectAll(".movie-text")
        .data(processedData)
        .enter()
        .append("text")
        .attr("class", "movie-text")
        .attr("x", d => xScale(d.movie) / 2)
        .attr("y", d => yScale(d.country) + yScale.bandwidth() / 2 + 4)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-size", "12px")
        .text(d => `${(d.movie * 100).toFixed(1)}%`);

    // Add percentage text for TV Shows
    chart.selectAll(".tvshow-text")
        .data(processedData)
        .enter()
        .append("text")
        .attr("class", "tvshow-text")
        .attr("x", d => xScale(d.movie) + xScale(d.tvshow) / 2)
        .attr("y", d => yScale(d.country) + yScale.bandwidth() / 2 + 4)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-size", "12px")
        .text(d => `${(d.tvshow * 100).toFixed(1)}%`);

    // Add axes
    chart.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format(".0%")));

    chart.append("g")
        .call(d3.axisLeft(yScale));

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${chartWidth + margin.left + 20},${margin.top})`);

    legend.selectAll("rect")
        .data(["Movie", "TV Show"])
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d => color(d));

    legend.selectAll("text")
        .data(["Movie", "TV Show"])
        .enter()
        .append("text")
        .attr("x", 18)
        .attr("y", (d, i) => i * 20 + 10)
        .text(d => d)
        .attr("font-size", "12px");
}).catch(error => console.error("Error loading the CSV file:", error));
})();



    // Section 3 remains the same.
    // Section 3: Netflix Movies & TV Shows Over Time
(function() {
const svg = d3.select("#chart3");
const margin = { top: 40, right: 100, bottom: 50, left: 50 };
const chartWidth = 800 - margin.left - margin.right;
const chartHeight = 500 - margin.top - margin.bottom;

const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Define color scale
const color = d3.scaleOrdinal()
    .domain(["Movie", "TV Show"])
    .range(["#b20710", "#221f1f"]);

// Load and process data
d3.csv("netflix_titles.csv").then(data => {
    const filteredData = data.filter(d => d.release_year >= 2008 && d.release_year <= 2020);

    const groupedData = d3.rollups(
        filteredData,
        v => v.length,
        d => d.type,
        d => +d.release_year
    );

    const movieData = groupedData.find(d => d[0] === "Movie")?.[1] || [];
    const tvShowData = groupedData.find(d => d[0] === "TV Show")?.[1] || [];

    const movieCounts = new Map(movieData);
    const tvShowCounts = new Map(tvShowData);

    const years = d3.range(2008, 2021);
    const movieValues = years.map(year => ({ year, value: movieCounts.get(year) || 0 }));
    const tvShowValues = years.map(year => ({ year, value: tvShowCounts.get(year) || 0 }));

    const xScale = d3.scaleLinear()
        .domain([2008, 2020])
        .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max([...movieValues, ...tvShowValues], d => d.value)])
        .nice()
        .range([chartHeight, 0]);

    // Create area generator
    const area = d3.area()
        .x(d => xScale(d.year))
        .y0(chartHeight)
        .y1(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

    // Add area for movies
    chartGroup.append("path")
        .datum(movieValues)
        .attr("fill", color("Movie"))
        .attr("opacity", 0.8)
        .attr("class", "movie-area")
        .attr("d", area)
        .on("mouseover", () => d3.select(".movie-area").attr("opacity", 1))
        .on("mouseout", () => d3.select(".movie-area").attr("opacity", 0.8));

    // Add area for TV shows
    chartGroup.append("path")
        .datum(tvShowValues)
        .attr("fill", color("TV Show"))
        .attr("opacity", 0.8)
        .attr("class", "tvshow-area")
        .attr("d", area)
        .on("mouseover", () => d3.select(".tvshow-area").attr("opacity", 1))
        .on("mouseout", () => d3.select(".tvshow-area").attr("opacity", 0.8));

    // Add axes
    chartGroup.append("g")
        .call(d3.axisBottom(xScale).ticks(13).tickFormat(d3.format("d")))
        .attr("transform", `translate(0,${chartHeight})`)
        .attr("class", "axis");

    chartGroup.append("g")
        .call(d3.axisLeft(yScale))
        .attr("class", "axis");

    // Add grid lines
    chartGroup.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale).tickSize(-chartWidth).tickFormat(''));

    chartGroup.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale).tickSize(-chartHeight).tickFormat(''));

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${chartWidth + margin.left + 20},${margin.top})`);

    legend.selectAll("rect")
        .data(["Movie", "TV Show"])
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d => color(d));

    legend.selectAll("text")
        .data(["Movie", "TV Show"])
        .enter()
        .append("text")
        .attr("x", 18)
        .attr("y", (d, i) => i * 20 + 10)
        .text(d => d)
        .attr("font-size", "12px");

    // Add interactivity with hover effects
    chartGroup.selectAll(".hover-line")
        .data(years)
        .enter()
        .append("line")
        .attr("class", "hover-line")
        .attr("x1", d => xScale(d))
        .attr("x2", d => xScale(d))
        .attr("y1", 0)
        .attr("y2", chartHeight)
        .attr("stroke", "gray")
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0);

    chartGroup.selectAll(".hover-label")
        .data(years)
        .enter()
        .append("text")
        .attr("class", "hover-label")
        .attr("x", d => xScale(d))
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("opacity", 0);

    svg.on("mousemove", (event) => {
        const [mouseX] = d3.pointer(event);
        const year = Math.round(xScale.invert(mouseX - margin.left));

        if (year >= 2008 && year <= 2020) {
            d3.selectAll(".hover-line").attr("opacity", 1).attr("x1", xScale(year)).attr("x2", xScale(year));
            d3.selectAll(".hover-label").attr("opacity", 1).text(year).attr("x", xScale(year));
        } else {
            d3.selectAll(".hover-line, .hover-label").attr("opacity", 0);
        }
    });
}).catch(error => console.error("Error loading the CSV file:", error));
})();


// Disney+ Data
(function() {
    const margin = { top: 40, right: 20, bottom: 50, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create an SVG canvas and center the chart
    const svg = d3.select("#chart21")
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
    const svg = d3.select("#chart22")
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
        const chartContainer = document.querySelector("#chart22");
        observer.observe(chartContainer);
    });
})();


        // Chart 3 Code: Content by Year and Type
        (function() {
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create an SVG canvas and center the chart
    const svg = d3.select("#chart23")
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
        const chartContainer = document.querySelector("#chart23");
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


});
