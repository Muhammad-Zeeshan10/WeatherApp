// OpenWeather API Key
const API_KEY = 'f6fcb0138ffc47eda321272b8f5a867d';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const cityName = document.getElementById('cityName');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const description = document.getElementById('description');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const uvIndex = document.getElementById('uvIndex');
// DOM elements for temperature switcher
const celsiusBtn = document.getElementById('celsiusBtn');
const fahrenheitBtn = document.getElementById('fahrenheitBtn');

// Variables to store temperature
let tempKelvin = null;
let isCelsius = true; 
let forecastData = null;

// Update the event listeners for temperature unit toggle
document.addEventListener('DOMContentLoaded', function() {
    // Remove these lines as they're redundant with the global declarations
    // const celsiusBtn = document.getElementById('celsiusBtn');
    // const fahrenheitBtn = document.getElementById('fahrenheitBtn');

    celsiusBtn.addEventListener('click', () => {
        isCelsius = true;
        updateTemperatureDisplay();
        updateForecast(forecastData, isCelsius);
    });

    fahrenheitBtn.addEventListener('click', () => {
        isCelsius = false;
        updateTemperatureDisplay();
        updateForecast(forecastData, isCelsius);
    });
});

// Function to update the temperature display based on the selected unit
function updateTemperatureDisplay() {
    if (tempKelvin === null) return;

    if (isCelsius) {
        temperature.textContent = `${kelvinToCelsius(tempKelvin)}°C`;
        celsiusBtn.classList.add('toggle-active');
        fahrenheitBtn.classList.remove('toggle-active');
    } else {
        temperature.textContent = `${kelvinToFahrenheit(tempKelvin)}°F`;
        fahrenheitBtn.classList.add('toggle-active');
        celsiusBtn.classList.remove('toggle-active');
    }
}

// ==================================================  Main functionality  =================================================

// Fetch current weather and forecast based on city coordinates
function getWeatherDetails(name, lat, lon, country, state) {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    // Fetch current weather
    fetch(WEATHER_API_URL)
        .then(res => {
            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error('City not found');
                } else if (res.status === 429) {
                    throw new Error('API limit reached');
                } else {
                    throw new Error('Failed to fetch current weather');
                }
            }
            return res.json();
        })
        .then(data => {
            updateCurrentWeather(data, name, country, state);
        })
        .catch((error) => {
            alert(error.message);
        });

    // Fetch 5-day forecast
    fetch(FORECAST_API_URL)
    .then(res => {
        if (!res.ok) {
            // Handle specific HTTP errors
            if (res.status === 404) {
                throw new Error('City not found');
            } else if (res.status === 429) {
                throw new Error('API limit reached, please try again later.');
            } else {
                throw new Error('Failed to fetch forecast data, please try again later.');
            }
        }
        return res.json();
    })
    .then(data => {
        if (!data || data.list.length === 0) {
            throw new Error('No forecast data available.');
        }
        forecastData = data; // Store the forecast data
        updateForecast(data, isCelsius);
        updateCharts(data);
    })
    .catch(error => {
        alert(error.message);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const dashboardLink = document.querySelector('a[href="#"][data-link="dashboard"]');
    const tablesLink = document.querySelector('a[href="#"][data-link="tables"]');
    
    const weatherWidget = document.getElementById('weatherWidget');
    const chartsSection = document.getElementById('chartsSection');
    const forecastTableSection = document.getElementById('forecastTableSection');
    const chatbotSection = document.getElementById('chatbotSection');

    // Hide the forecast and chatbot sections on page load
    forecastTableSection.classList.add('hidden');
    chatbotSection.classList.add('hidden');
    
    // Event listener for Dashboard link
    dashboardLink.addEventListener('click', function() {
        weatherWidget.classList.remove('hidden');
        chartsSection.classList.remove('hidden');
        forecastTableSection.classList.add('hidden');
        chatbotSection.classList.add('hidden');
    });
    
    // Event listener for Tables link
    tablesLink.addEventListener('click', function() {
        weatherWidget.classList.add('hidden');
        chartsSection.classList.add('hidden');
        forecastTableSection.classList.remove('hidden');
        chatbotSection.classList.remove('hidden');
    });
});

cityInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        getCityCoordinates();
        cityInput.value = '';
    }
});
getWeatherBtn.addEventListener('click', () => {
    getCityCoordinates();
    cityInput.value = '';
});

// Fetch city coordinates from OpenWeather Geocoding API
function getCityCoordinates() {
    const cityName = cityInput.value.trim();
    if (!cityName) return;

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to fetch city coordinates');
            }
            return res.json();
        })
        .then(data => {
            if (data.length === 0) {
                throw new Error('City not found');
            }

            const { name, lat, lon, country, state } = data[0];
            getWeatherDetails(name, lat, lon, country, state);
        })
        .catch((error) => {
            alert(error.message);
        });
}

// ================================================= Weather Widget Part =================================================

// Helper function to update widget background based on weather conditions
function updateWidgetBackground(weatherCondition) {
    const widget = document.getElementById('weatherWidget');
    
    // Use the weather condition directly from the API response to set the background
    const condition = weatherCondition.toLowerCase(); // Convert condition to lowercase for easier matching

    if (condition.includes('clear')) {
        widget.style.backgroundImage = "url('https://images.unsplash.com/photo-1609376224342-8902c39a3675?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGNsZWFyJTIwYmx1ZSUyMHNreXxlbnwwfHwwfHx8MA%3D%3D')";
    } else if (condition.includes('cloud')) {
        widget.style.backgroundImage = "url('https://images.unsplash.com/photo-1722887151458-7b7a8efb86b3?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGxpZ2h0JTIwY2xvdWRzfGVufDB8fDB8fHww')";
    } else if (condition.includes('rain')) {
        widget.style.backgroundImage = "url('https://t3.ftcdn.net/jpg/05/56/78/64/360_F_556786409_6EiHn9hDiOQ5qnkHKhSPa1HKKONe7CWL.jpg')";
    } else if (condition.includes('snow')) {
        widget.style.backgroundImage = "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBSN1T7cTpwxszLq1p89cQHJTnA-IMv2e3nA&s')";
    } else if (condition.includes('thunderstorm')) {
        widget.style.backgroundImage = "url('https://images.unsplash.com/photo-1631949626984-67fff587de92?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGlnaHRlbmluZyUyMHN0b3JtfGVufDB8fDB8fHww')";
    } else {
        widget.style.backgroundImage = "url('https://img.freepik.com/free-vector/gorgeous-clouds-background-with-blue-sky-design_1017-25501.jpg')"; 
    }

    widget.style.backgroundSize = 'cover'; // Ensure background image covers the widget
    widget.style.backgroundPosition = 'center'; // Center the background image
    widget.style.color = 'white';
}

// Update current weather details on the page
function updateCurrentWeather(data, name, country, state) {
    const { weather, main, wind } = data;
    
    cityName.textContent = `${name}, ${state ? state + ', ' : ''}${country}`;
    description.textContent = weather[0].description;
    tempKelvin = main.temp; // Store the temperature in Kelvin
    updateTemperatureDisplay(); // Update the temperature based on the current unit

    humidity.textContent = `Humidity: ${main.humidity}%`;
    windSpeed.textContent = `Wind: ${Math.round(wind.speed * 2.237)} mph`; // Convert m/s to mph
    uvIndex.textContent = `UV Index: N/A`; // OpenWeather doesn't provide UV index in the free tier

    // Update the weather icon based on the weather[0].icon value
    const weatherIconCode = weather[0].icon;
    const weatherIconUrl = `https://openweathermap.org/img/wn/${weatherIconCode}@2x.png`;
    const weatherIconImg = document.querySelector('#weatherWidget img');
    weatherIconImg.src = weatherIconUrl;  // Update the icon src with the OpenWeather icon
    weatherIconImg.alt = weather[0].description;  // Set alt text for accessibility

    // Update the background based on the current weather condition
    updateWidgetBackground(weather[0].main);

    // Set text color for city name and description
    document.getElementById('cityName').style.color = 'white';
    document.getElementById('description').style.color = 'white';
}

// ================================================= Charts Part =================================================

// Chart objects
let temperatureBarChart, conditionChart, temperatureTrendChart;
// Update charts based on the 5-day forecast
function updateCharts(data) {
    const forecastData = data.list.filter(item => item.dt_txt.includes('12:00:00'));

    // Destroy the temperature chart if it already exists
    if (temperatureBarChart) {
        temperatureBarChart.destroy();
    }

    // Vertical Bar Chart: Temperatures for the next 5 days
    const barCtx = document.getElementById('temperatureChart').getContext('2d');
    if (barCtx) {
        temperatureBarChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: forecastData.map(day => new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })),
                datasets: [{
                    label: 'Temperature (°F)',
                    data: forecastData.map(day => kelvinToFahrenheit(day.main.temp)),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 1000, // Animation duration for each bar
                    delay: (context) => context.dataIndex * 200, // Delay based on bar index
                    easing: 'easeOutQuad', // Smooth easing for the animation
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: '5-Day Temperature Forecast'
                    }
                }
            }
        });
    }

    // Destroy the weather condition chart if it already exists
    if (conditionChart) {
        conditionChart.destroy();
    }

    // Doughnut Chart: Weather conditions distribution
    const doughnutCtx = document.getElementById('conditionChart').getContext('2d');
    if (doughnutCtx) {
        const conditions = forecastData.map(day => day.weather[0].main);
        const conditionCounts = conditions.reduce((acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
        }, {});

        conditionChart = new Chart(doughnutCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(conditionCounts),
                datasets: [{
                    data: Object.values(conditionCounts),
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 205, 86)',
                        'rgb(75, 192, 192)',
                        'rgb(153, 102, 255)'
                    ]
                }]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 1000, // Animation duration
                    delay: (context) => context.dataIndex * 300, // Delay for each segment based on index
                    easing: 'easeOutBounce', // Smooth bounce easing for animation
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Weather Conditions Distribution (5 Days)'
                    }
                }
            }
        });
    }

    // Destroy the temperature trend chart if it already exists
    if (temperatureTrendChart) {
        temperatureTrendChart.destroy();
    }

    // Line Chart: Temperature Trend for the next 5 days
    const lineCtx = document.getElementById('temperatureTrendChart').getContext('2d');
    if (lineCtx) {
        temperatureTrendChart = new Chart(lineCtx, {
            type:  'line',
            data: {
                labels: forecastData.map(day => new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })),
                datasets: [{
                    label: 'Temperature (°F)',
                    data: forecastData.map(day => kelvinToFahrenheit(day.main.temp)),
                    borderColor: 'rgb(255, 99, 132)',
                    fill: false,
                    tension: 0.1,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                animation: {
                    // Drop effect for data points
                    easing: 'easeOutBounce', // Points bounce into place
                    duration: 1500, // Duration of the drop effect
                    delay: (context) => context.dataIndex * 200, // Delay for each point
                    // Animate the line connecting the points
                    onComplete: (animation) => {
                        const chart = animation.chart;
                        chart.options.animation = { // Reset animation after the initial load
                            easing: 'linear',
                            duration: 500,
                        };
                        chart.update();
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Temperature Trend (5 Days)'
                    }
                }
            }
        });
    }
}

// ================================================= Forecast Table Part =================================================

function updateForecast(data, isCelsius) {
    const forecastContainer = document.getElementById('forecastTableSection');
    
    // Get weather data for the midday of each day (12:00:00)
    let forecastData = data.list.filter(item => item.dt_txt.includes('12:00:00'));

    // Convert temperatures to the selected unit (Celsius or Fahrenheit)
    forecastData = forecastData.map(day => ({
        ...day,
        temp: isCelsius ? kelvinToCelsius(day.main.temp) : kelvinToFahrenheit(day.main.temp),
        temp_max: isCelsius ? kelvinToCelsius(day.main.temp_max) : kelvinToFahrenheit(day.main.temp_max),
        temp_min: isCelsius ? kelvinToCelsius(day.main.temp_min) : kelvinToFahrenheit(day.main.temp_min)
    }));

    // Function to render the forecast cards
    const renderForecast = (data) => {
        let forecastHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        `;

        data.forEach((day) => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const maxTemp = `${Math.round(day.temp_max)}°`;
            const minTemp = `${Math.round(day.temp_min)}°`;

            const weatherDescription = day.weather[0].description;
            const weatherIcon = day.weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`;

            forecastHTML += `
                <div class="bg-white rounded-lg shadow-md p-4 transition duration-300 ease-in-out transform hover:scale-105">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-lg font-semibold">${dayName}</h3>
                        <p class="text-sm text-gray-600">${monthDay}</p>
                    </div>
                    <div class="flex items-center justify-center mb-2">
                        <img src="${iconUrl}" alt="${weatherDescription}" class="w-16 h-16">
                    </div>
                    <p class="text-center text-2xl font-bold mb-2">${Math.round(day.temp)}°${isCelsius ? 'C' : 'F'}</p>
                    <p class="text-center text-sm text-gray-600">${minTemp} - ${maxTemp}</p>
                    <p class="text-center text-sm mt-2 capitalize">${weatherDescription}</p>
                </div>
            `;
        });

        forecastHTML += `</div>`;
        return forecastHTML;
    };

    // Function to create filter buttons
    const createFilterButtons = () => {
        return `
            <div class="flex flex-wrap justify-center gap-4 mb-8">
                <button id="sortAsc" class="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    <i class="fas fa-sort-amount-up-alt mr-2"></i>Sort Ascending
                </button>
                <button id="sortDesc" class="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    <i class="fas fa-sort-amount-down mr-2"></i>Sort Descending
                </button>
                <button id="filterRain" class="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    <i class="fas fa-cloud-rain mr-2"></i>Show Rainy Days
                </button>
                <button id="showHighest" class="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    <i class="fas fa-temperature-high mr-2"></i>Highest Temp Day
                </button>
                <button id="showAll" class="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    <i class="fas fa-calendar-alt mr-2"></i>Show All
                </button>
            </div>
        `;
    };

    // Render initial forecast and buttons
    forecastContainer.innerHTML = `
        <div class="max-w-6xl mx-auto px-4 py-8">
            <h2 class="text-3xl font-bold text-indigo-800 mb-6 flex items-center">
                    <svg class="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-4 9v-4m-6 4v6h12v-6"></path>
                    </svg>
                    5-Day Weather Forecast
                  </h2>
           
            <div id="forecastGrid">${renderForecast(forecastData)}</div>
             ${createFilterButtons()}
        </div>
    `;

    // Function to update the grid content
    const updateGrid = (newData) => {
        const forecastGrid = document.getElementById('forecastGrid');
        forecastGrid.innerHTML = renderForecast(newData);
    };

    const sortAscending = () => {
        const sorted = [...forecastData].sort((a, b) => a.temp - b.temp);
        updateGrid(sorted);
    };

    const sortDescending = () => {
        const sorted = [...forecastData].sort((a, b) => b.temp - a.temp);
        updateGrid(sorted);
    };

    const filterRainyDays = () => {
        const rainyDays = forecastData.filter(day => 
            day.weather[0].description.toLowerCase().includes('rain')
        );
        updateGrid(rainyDays);
    };

    const showHighestTemperatureDay = () => {
        const highestTempDay = forecastData.reduce((prev, current) => 
            (prev.temp > current.temp) ? prev : current
        );
        updateGrid([highestTempDay]);
    };

    const showAll = () => {
        updateGrid(forecastData);
    };

    // Add event listeners to buttons
    document.getElementById('sortAsc').addEventListener('click', sortAscending);
    document.getElementById('sortDesc').addEventListener('click', sortDescending);
    document.getElementById('filterRain').addEventListener('click', filterRainyDays);
    document.getElementById('showHighest').addEventListener('click', showHighestTemperatureDay);
    document.getElementById('showAll').addEventListener('click', showAll);
}

// Helper functions 
function kelvinToFahrenheit(kelvin) {
    return Math.round((kelvin - 273.15) * 9 / 5 + 32);
}
function kelvinToCelsius(kelvin) {
    return Math.round(kelvin - 273.15);
}


