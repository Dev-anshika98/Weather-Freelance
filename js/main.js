let apiKey = "1e3e8f230b6064d27976e41163a82b77";

navigator.geolocation.getCurrentPosition(async function (position) {
   
    try {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        //longitude and  latitude are used to get city name
        var map = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${apiKey}`)
        var userdata = await map.json();
        let loc = userdata[0].name;
        //By using City name  we can get the weather details of that particular city from OpenWeatherMap API
        let url = `https://api.openweathermap.org/data/2.5/forecast?&units=metric&`;
        let respond = await fetch(url + `q=${loc}&` + `appid=${apiKey}`);
        let data = await respond.json();

        console.log(data);
        
        // display current weather info
        let cityMain = document.getElementById("city-name");
        let cityTemp = document.getElementById("metric");
        let weatherMain = document.querySelectorAll("#weather-main");
        let mainHumidity = document.getElementById("humidity");
        let mainFeel = document.getElementById("feels-like");
        let weatherImg = document.querySelector(".weather-icon");
        let weatherImgs = document.querySelector(".weather-icons");
        let tempMinWeather = document.getElementById("temp-min-today");
        let tempMaxWeather = document.getElementById("temp-max-today");

        cityMain.innerHTML = data.city.name;
        cityTemp.innerHTML = Math.floor(data.list[0].main.temp) + "°";
        weatherMain[0].innerHTML = data.list[0].weather[0].description;
        weatherMain[1].innerHTML = data.list[0].weather[0].description;
        mainHumidity.innerHTML = Math.floor(data.list[0].main.humidity);
        mainFeel.innerHTML = Math.floor(data.list[0].main.feels_like);
        tempMinWeather.innerHTML = Math.floor(data.list[0].main.temp_min) + "°";
        tempMaxWeather.innerHTML = Math.floor(data.list[0].main.temp_max) + "°";

        let weatherCondition = data.list[0].weather[0].main.toLowerCase();

        if (weatherCondition === "rain") {
            weatherImg.src = "img/rain.png";
            weatherImgs.src = "img/rain.png";
        } else if (weatherCondition === "clear" || weatherCondition === "clear sky") {
            weatherImg.src = "img/sun.png";
            weatherImgs.src = "img/sun.png";
        } else if (weatherCondition === "snow") {
            weatherImg.src = "img/snow.png";
            weatherImgs.src = "img/snow.png";
        } else if (weatherCondition === "clouds" || weatherCondition === "smoke") {
            weatherImg.src = "img/cloud.png";
            weatherImgs.src = "img/cloud.png";
        } else if (weatherCondition === "mist" || weatherCondition === "Fog") {
            weatherImg.src = "img/mist.png";
            weatherImgs.src = "img/mist.png";
        } else if (weatherCondition === "haze") {
            weatherImg.src = "img/haze.png"  ;
            weatherImgs.src = "img/haze.png";
        }

        // Fetch and display 5-day forecast data
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${data.city.name}&appid=${apiKey}&units=metric`;

        fetch(forecastUrl)
            .then(response => response.json())
            .then(data => {
                console.log("5-Day Forecast for", data.city.name);
                displayForecast(data);
            })
            .catch(error => {
                console.error("Error fetching forecast:", error);
            });

        function displayForecast(data) {
            const dailyForecasts = {};
            let forecast = document.getElementById('forecast-box');
            let forecastbox = "";

            data.list.forEach(item => {
                const date = item.dt_txt.split(' ')[0];
                let dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                let day = new Date(date).getDay();

                if (!dailyForecasts[date]) {
                    dailyForecasts[date] = {
                        day_today: dayName[day],
                        temperature: Math.floor(item.main.temp) + "°",
                        description: item.weather[0].description,
                        weatherImg: item.weather[0].main.toLowerCase()
                    };
                }
            });

            for (const date in dailyForecasts) {
                let imgSrc = "";

                switch (dailyForecasts[date].weatherImg) {
                    case "rain":
                        imgSrc = "img/rain.png";
                        break;
                    case "clear":
                    case "clear sky":
                        imgSrc = "img/sun.png";9
                        break;
                    case "snow":
                        imgSrc = "img/snow.png";
                        break;
                    case "clouds":
                    case "smoke":
                        imgSrc = "img/cloud.png";
                        break;
                    case "mist":
                        imgSrc = "img/mist.png";
                        break;
                    case "haze":
                        imgSrc = "img/haze.png";
                        break;
                    default:
                        imgSrc = "img/sun.png";
                }

                forecastbox += `
                <div class="weather-forecast-box">
                <div class="day-weather">
                <span>${dailyForecasts[date].day_today}</span>
                 </div>
                    <div class="weather-icon-forecast">
                        <img src="${imgSrc}" />
                    </div>
                    <div class="temp-weather">
                        <span>${dailyForecasts[date].temperature}</span>
                    </div>
                    <div class="weather-main-forecast">${dailyForecasts[date].description}</div>
                </div>`;
            }

            forecast.innerHTML = forecastbox;

            console.log(data);
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
},
() => {
    // Handle location retrieval error
    alert("Please turn on your location and refresh the page");
  });


  // In your existing weather.js/main.js where you handle location search
async function searchLocation(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
        );
        const data = await response.json();
        
        if (data.length > 0) {
            const { lat, lon, name } = data[0];
            
            // Save location data to localStorage
            const locationData = {
                lat,
                lon,
                name,
                timestamp: Date.now(),
                isSearched: true
            };
            localStorage.setItem('weatherLocation', JSON.stringify(locationData));
            
            // Update weather for current page
            updateWeather(lat, lon);
        }
    } catch (error) {
        console.error('Error searching location:', error);
    }
}

// Function to handle search and weather update
async function handleSearch(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
        );
        const data = await response.json();
        
        if (data.length > 0) {
            const { lat, lon, name } = data[0];
            
            // Save location data to localStorage
            const locationData = {
                lat,
                lon,
                name,
                timestamp: Date.now()
            };
            localStorage.setItem('weatherLocation', JSON.stringify(locationData));
            
            // Fetch and update weather data
            const weatherResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
            );
            const weatherData = await weatherResponse.json();
            
            // Update UI with weather data
            updateWeatherUI(weatherData);
            
            // Show the activities button
            document.getElementById('activities-btn').style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to update weather UI
function updateWeatherUI(weatherData) {
    document.getElementById('city-name').textContent = weatherData.name;
    document.getElementById('metric').textContent = `${Math.round(weatherData.main.temp)}°`;
    document.getElementById('weather-main').textContent = weatherData.weather[0].main;
    document.getElementById('humidity').textContent = weatherData.main.humidity;
    document.getElementById('feels-like').textContent = Math.round(weatherData.main.feels_like);
    
    // Update weather icon based on weather condition
    updateWeatherIcon(weatherData.weather[0].main);
}

// Add this to your existing HTML where you want the activities button to appear
const activitiesButton = `
    <div id="activities-btn" class="activities-button" style="display: none;">
        <a href="activities.html">
            <i class="fa-solid fa-person-running"></i>
            Check Activities
        </a>
    </div>
`;

// Insert the button after the weather description div
document.querySelector('.weather-description').insertAdjacentHTML('afterend', activitiesButton);


document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("searchButton").addEventListener("click", function () {
        let city = document.getElementById("searchInput").value.trim();  // Trim spaces

        if (city) {
            fetchWeather(city);  // Fetch weather for searched city
            localStorage.setItem("selectedCity", city);  // Store city in localStorage
        }
    });

    // Load last searched city when the page loads
    let savedCity = localStorage.getItem("selectedCity");
    if (savedCity) {
        fetchWeather(savedCity);  // Show last searched city's weather
    }
});



