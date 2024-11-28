document.addEventListener('DOMContentLoaded', function () {
    // Get buttons and iframe element
    const btnDashboard1 = document.getElementById('btn-dashboard-1');
    const btnDashboard2 = document.getElementById('btn-dashboard-2');
    const iframe = document.getElementById('dashboard-frame');

    // URLs for the dashboards
    const netflixDashboardURL = "https://app.powerbi.com/view?r=eyJrIjoiOTg0YTg3YTUtMzViNC00YmFiLWFmMzgtOGM4N2MyMjIyZjU0IiwidCI6IjcwZGUxOTkyLTA3YzYtNDgwZi1hMzE4LWExYWZjYmEwMzk4MyIsImMiOjN9";
    const disneyDashboardURL = "https://app.powerbi.com/view?r=eyJrIjoiMjE0MTIwYWEtNmMzMi00MGM1LThiZGUtZDhlYTg3OTUwYmYxIiwidCI6IjcwZGUxOTkyLTA3YzYtNDgwZi1hMzE4LWExYWZjYmEwMzk4MyIsImMiOjN9";

    // Add event listeners to the buttons
    btnDashboard1.addEventListener('click', function () {
        iframe.src = netflixDashboardURL; // Change iframe source
        btnDashboard1.classList.add('active'); // Add active class to button 1
        btnDashboard2.classList.remove('active'); // Remove active class from button 2
    });

    btnDashboard2.addEventListener('click', function () {
        iframe.src = disneyDashboardURL; // Change iframe source
        btnDashboard2.classList.add('active'); // Add active class to button 2
        btnDashboard1.classList.remove('active'); // Remove active class from button 1
    });
});
