// Section 1: Top 10 Countries on Netflix
// Section 1: Top 10 Countries on Netflix
(function() {
    const margin = { top: 40, right: 20, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#chart1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

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

        // Assign unique class to each bar based on its index for coloring
        svg.selectAll(".bar")
            .data(sortedData)
            .enter()
            .append("rect")
            .attr("class", (d, i) => `bar country-bar-${i + 1}`)  // Dynamically assign class for each bar
            .attr("x", d => x(d.country))
            .attr("y", height) // Start from the bottom (for animation)
            .attr("width", x.bandwidth())
            .attr("height", 0)  // Start with no height (for animation)
            .transition()
            .duration(1000)  // Animate the bars
            .ease(d3.easeBounceOut)
            .attr("y", d => y(d.count))
            .attr("height", d => height - y(d.count));

        // Add percentage labels to the bars
        svg.selectAll(".bar-label")
            .data(sortedData)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", d => x(d.country) + x.bandwidth() / 2)
            .attr("y", d => y(d.count) - 10)
            .attr("text-anchor", "middle")
            .text(d => `${d.count}`)
            .style("fill", "#fff")
            .style("font-size", "14px");
    });
})();


// Section 2: Movie & TV Show Split
(function() {
    const svg = d3.select("#chart2");
    const margin = { top: 50, right: 150, bottom: 50, left: 150 };
    const chartWidth = 800 - margin.left - margin.right;
    const chartHeight = 600 - margin.top - margin.bottom;

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const color = d3.scaleOrdinal()
        .domain(["Movie", "TV Show"])
        .range(["#4caf50", "#2196f3"]);

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
            .call(d3.axisBottom(xScale).tickFormat(d3.format(".0%")))
            .attr("transform", `translate(0,${chartHeight})`);

        chart.append("g")
            .call(d3.axisLeft(yScale));
    });
})();


// Section 3: Netflix Movies & TV Shows Over Time
(function () {
    const svg = d3.select("#chart3");
    const margin = { top: 40, right: 100, bottom: 50, left: 50 };
    const chartWidth = 800 - margin.left - margin.right;
    const chartHeight = 500 - margin.top - margin.bottom;

    const chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define color scale
    const color = d3.scaleOrdinal()
        .domain(["Movie", "TV Show"])
        .range(["#ffa600", "#bc5090"]);

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
            .domain([0, d3.max([...movieValues, ...tvShowValues], d => d.value)]).nice()
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
            .attr("class", "legend");
    }).catch(error => console.error("Error loading the CSV file:", error));
})();


(function() {
    const svg = d3.select("#chart2");
    const margin = { top: 50, right: 150, bottom: 50, left: 150 };
    const chartWidth = 800 - margin.left - margin.right;
    const chartHeight = 600 - margin.top - margin.bottom;

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const color = d3.scaleOrdinal()
        .domain(["Movie", "TV Show"])
        .range(["#ffa600", "#bc5090"]);

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
            .attr("width", 0) // Initial width for animation
            .transition()
            .duration(800)
            .ease(d3.easeBounceOut)
            .attr("width", d => xScale(d.movie));

        // Draw bars for TV Shows
        chart.selectAll(".tvshow-bar")
            .data(processedData)
            .enter()
            .append("rect")
            .attr("class", "tvshow-bar")
            .attr("y", d => yScale(d.country))
            .attr("height", yScale.bandwidth())
            .attr("x", 0)
            .attr("width", 0) // Initial width for animation
            .transition()
            .delay(400)
            .duration(800)
            .ease(d3.easeBounceOut)
            .attr("x", d => xScale(d.movie))
            .attr("width", d => xScale(d.tvshow));

        // Add percentage text for Movies
        chart.selectAll(".movie-text")
            .data(processedData)
            .enter()
            .append("text")
            .attr("class", "text-label movie-text")
            .attr("x", d => xScale(d.movie) / 2)
            .attr("y", d => yScale(d.country) + yScale.bandwidth() / 2 + 5)
            .attr("text-anchor", "middle")
            .text(d => `${(d.movie * 100).toFixed(1)}%`);

        // Add percentage text for TV Shows
        chart.selectAll(".tvshow-text")
            .data(processedData)
            .enter()
            .append("text")
            .attr("class", "text-label tvshow-text")
            .attr("x", d => xScale(d.movie) + xScale(d.tvshow) / 2)
            .attr("y", d => yScale(d.country) + yScale.bandwidth() / 2 + 5)
            .attr("text-anchor", "middle")
            .text(d => `${(d.tvshow * 100).toFixed(1)}%`);

        // Add axes
        chart.append("g")
            .call(d3.axisBottom(xScale).tickFormat(d3.format(".0%")))
            .attr("transform", `translate(0,${chartHeight})`)
            .attr("class", "axis");

        chart.append("g")
            .call(d3.axisLeft(yScale))
            .attr("class", "axis");

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
            .attr("class", "legend");
    });
})();
