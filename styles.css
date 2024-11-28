// Load data from CSV and create charts
fetch('netflix_titles.csv')
    .then(response => response.text())
    .then(csvText => {
        const rows = csvText.split('\n').slice(1); // Skip header row
        const data = rows.map(row => row.split(',')); // Convert rows into arrays

        // Extract data for analysis
        const types = data.map(row => row[1].trim()); // Type column
        const releaseYears = data.map(row => parseInt(row[7].trim())); // Release year column
        const ratings = data.map(row => row[8].trim()); // Rating column
        const durations = data.map(row => row[9].trim()); // Duration column

        // Compute metrics
        const totalShows = data.length;
        const movieCount = types.filter(type => type === 'Movie').length;
        const seriesCount = types.filter(type => type === 'TV Show').length;

        // Update metrics
        document.getElementById('total-shows').innerText = `Total Shows: ${totalShows}`;
        document.getElementById('total-movies').innerText = `Movies: ${movieCount}`;
        document.getElementById('total-series').innerText = `Series: ${seriesCount}`;

        // Type Distribution Chart
        const typeCounts = {
            Movie: movieCount,
            Series: seriesCount
        };
        const typeCtx = document.getElementById('typeChart').getContext('2d');
        new Chart(typeCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(typeCounts),
                datasets: [{
                    data: Object.values(typeCounts),
                    backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)'],
                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                    borderWidth: 1
                }]
            }
        });

        // Yearly Release Chart
        const yearCounts = releaseYears.reduce((acc, year) => {
            if (!isNaN(year)) acc[year] = (acc[year] || 0) + 1;
            return acc;
        }, {});
        const yearlyCtx = document.getElementById('yearlyChart').getContext('2d');
        new Chart(yearlyCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(yearCounts),
                datasets: [{
                    label: 'Number of Titles',
                    data: Object.values(yearCounts),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Ratings Distribution Chart
        const ratingCounts = ratings.reduce((acc, rating) => {
            acc[rating] = (acc[rating] || 0) + 1;
            return acc;
        }, {});
        const ratingCtx = document.getElementById('ratingChart').getContext('2d');
        new Chart(ratingCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(ratingCounts),
                datasets: [{
                    data: Object.values(ratingCounts),
                    backgroundColor: Object.keys(ratingCounts).map((_, i) => `rgba(${i * 30}, 99, 132, 0.5)`),
                    borderColor: Object.keys(ratingCounts).map((_, i) => `rgba(${i * 30}, 99, 132, 1)`),
                    borderWidth: 1
                }]
            }
        });

        // Duration Distribution Chart
        const durationCounts = durations.reduce((acc, duration) => {
            acc[duration] = (acc[duration] || 0) + 1;
            return acc;
        }, {});
        const durationCtx = document.getElementById('durationChart').getContext('2d');
        new Chart(durationCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(durationCounts),
                datasets: [{
                    data: Object.values(durationCounts),
                    backgroundColor: Object.keys(durationCounts).map((_, i) => `rgba(${i * 50}, 162, 235, 0.5)`),
                    borderColor: Object.keys(durationCounts).map((_, i) => `rgba(${i * 50}, 162, 235, 1)`),
                    borderWidth: 1
                }]
            }
        });
    })
    .catch(error => console.error('Error loading CSV:', error));
