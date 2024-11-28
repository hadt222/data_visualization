// Load the CSV file and visualize data
fetch('data.csv')
    .then(response => response.text())
    .then(csvText => {
        // Parse CSV data
        const rows = csvText.split('\n').slice(1); // Skip header row
        const labels = [];
        const data = [];

        rows.forEach(row => {
            const [category, value] = row.split(',');
            labels.push(category);
            data.push(parseFloat(value));
        });

        // Create the chart
        const ctx = document.getElementById('myChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Values',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    })
    .catch(error => console.error('Error loading CSV file:', error));
