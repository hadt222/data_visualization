document.addEventListener('DOMContentLoaded', function () {
    // Get buttons and dashboard elements
    const btnDashboard1 = document.getElementById('btn-dashboard-1');
    const btnDashboard2 = document.getElementById('btn-dashboard-2');
    const dashboard1 = document.getElementById('dashboard-1');
    const dashboard2 = document.getElementById('dashboard-2');

    // Add event listeners to toggle dashboards
    btnDashboard1.addEventListener('click', function () {
        dashboard1.classList.remove('hidden');
        dashboard2.classList.add('hidden');
        btnDashboard1.classList.add('active');
        btnDashboard2.classList.remove('active');
    });

    btnDashboard2.addEventListener('click', function () {
        dashboard2.classList.remove('hidden');
        dashboard1.classList.add('hidden');
        btnDashboard2.classList.add('active');
        btnDashboard1.classList.remove('active');
    });

    // D3.js Visualization for Dashboard 1
    const margin = { top: 40, right: 20, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(".chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv("netflix_titles.csv").then(data => {
        const processedData = d3.rollup(
            data,
            v => v.length,
            d => d.country ? d.country.split(",")[0] : "Other Countries"
        );

        const sortedData = Array.from(processedData, ([country, count]) => ({ country, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const x = d3.scaleBand()
            .domain(sortedData.map(d => d.country))
            .range([0, width])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(sortedData, d => d.count)])
            .range([height, 0]);

        svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
        svg.append("g").call(d3.axisLeft(y));

        svg.selectAll(".bar")
            .data(sortedData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.country))
            .attr("y", d => y(d.count))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.count));

        svg.selectAll(".label")
            .data(sortedData)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => x(d.country) + x.bandwidth() / 2)
            .attr("y", d => y(d.count) - 10)
            .text(d => d.count);
    }).catch(error => console.error("Error loading CSV:", error));
});
