// Load the dataset
fetch('netflix_titles.csv')
    .then(response => response.text())
    .then(csvText => {
        const rows = csvText.split('\n').slice(1); // Skip header row
        const data = rows.map(row => row.split(',')); // Parse rows into arrays

        // Visualization 1: Distribution of Titles by Type
        const typeCount = { Movie: 0, TVShow: 0 };
        data.forEach(row => {
            const type = row[1].trim(); // 'type' column
            if (type === 'Movie' || type === 'TV Show') {
                typeCount[type] += 1;
            }
        });

        const typeChartCtx = document.getElementById('typeChart').getContext('2d');
        new Chart(typeChartCtx, {
            type: 'pie',
            data: {
                labels: ['Movies', 'TV Shows'],
                datasets: [{
                    label: 'Type Distribution',
                    data: [typeCount.Movie, typeCount.TVShow],
                    backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)'],
                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                    borderWidth: 1
                }]
            }
        });

        // Visualization 2: Top 10 Countries by Number of Titles
        const countryCount = {};
        data.forEach(row => {
            const country = row[5].trim(); // 'country' column
            if (country) {
                countryCount[country] = (countryCount[country] || 0) + 1;
            }
        });

        const sortedCountries = Object.entries(countryCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const countryChartCtx = document.getElementById('countryChart').getContext('2d');
        new Chart(countryChartCtx, {
            type: 'bar',
            data: {
                labels: sortedCountries.map(entry => entry[0]),
                datasets: [{
                    label: 'Number of Titles',
                    data: sortedCountries.map(entry => entry[1]),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Visualization 3: Trend of Titles Added Over the Years
        const yearCount = {};
        data.forEach(row => {
            const year = row[7].trim(); // 'release_year' column
            if (year) {
                yearCount[year] = (yearCount[year] || 0) + 1;
            }
        });

        const sortedYears = Object.entries(yearCount).sort((a, b) => a[0] - b[0]);
        const trendChartCtx = document.getElementById('trendChart').getContext('2d');
        new Chart(trendChartCtx, {
            type: 'line',
            data: {
                labels: sortedYears.map(entry => entry[0]),
                datasets: [{
                    label: 'Number of Titles',
                    data: sortedYears.map(entry => entry[1]),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    fill: false
                }]
            }
        });
    })
    .catch(error => console.error('Error loading or processing CSV file:', error));
