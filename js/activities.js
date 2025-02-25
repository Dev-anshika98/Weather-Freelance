// class ActivityPlanner {
//     constructor(apiKey) {
//         this.apiKey = apiKey;
//         this.defaultLocation = { lat: 40.7128, lon: -74.0060 }; // Default to New York City
//         this.activityPreferences = {
//             running: { minTemp: 10, maxTemp: 25, maxWind: 15, maxPrecip: 0.1, maxHumidity: 80, preferredHours: [6, 18] },
//             cycling: { minTemp: 12, maxTemp: 30, maxWind: 20, maxPrecip: 0.2, maxHumidity: 75, preferredHours: [7, 20] },
//             beach: { minTemp: 22, maxTemp: 35, maxWind: 10, maxPrecip: 0.05, maxHumidity: 70, preferredHours: [10, 17] },
//             hiking: { minTemp: 5, maxTemp: 25, maxWind: 20, maxPrecip: 0.3, maxHumidity: 85, preferredHours: [5, 18] }
//         };
//         this.init();
//     }

//     async init() {
//         try {
//             // Get the saved location from localStorage
//             let location = this.getSavedLocation() || await this.getUserLocation();
//             let weatherData = await this.fetchWeatherData(location.lat, location.lon);
//             this.updateWeatherUI(weatherData);
//             this.updateActivityRecommendations(weatherData);
//             this.saveLocation(location);
//         } catch (error) {
//             console.error("Error initializing ActivityPlanner:", error);
//         }
//     }

//     getSavedLocation() {
//         // Check for searched location in localStorage
//         const weatherLocation = localStorage.getItem("weatherLocation");
//         if (weatherLocation) {
//             const location = JSON.parse(weatherLocation);
//             // Check if the location data is recent (within last hour)
//             if (location.timestamp && (Date.now() - location.timestamp) < 3600000) {
//                 return {
//                     lat: location.lat,
//                     lon: location.lon,
//                     name: location.name
//                 };
//             }
//         }
//         // If no searched location, check for saved current location
//         const savedLocation = localStorage.getItem("userLocation");
//         return savedLocation ? JSON.parse(savedLocation) : null;
//     }

//     async updateWeatherUI(weatherData) {
//         if (!weatherData) return;

//         // Get the location name
//         const location = this.getSavedLocation();
//         const locationName = location?.name || "Current Location";

//         // Update the UI with location name and weather data
//         document.getElementById("city").textContent = locationName;
//         document.getElementById("current-temp").textContent = `${Math.round(weatherData.current.temp)}°C`;
//         document.getElementById("weather-condition").textContent = weatherData.current.weather[0].main;
//     }

//     async getUserLocation() {
//         return new Promise((resolve, reject) => {
//             if (navigator.geolocation) {
//                 navigator.geolocation.getCurrentPosition(
//                     async position => {
//                         resolve({ lat: position.coords.latitude, lon: position.coords.longitude });
//                     },
//                     error => {
//                         console.warn("Geolocation error, using default location.");
//                         resolve(this.defaultLocation);
//                     }
//                 );
//             } else {
//                 console.warn("Geolocation not supported, using default location.");
//                 resolve(this.defaultLocation);
//             }
//         });
//     }

//     async fetchWeatherData(lat, lon) {
//         try {
//             let response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&units=metric&appid=${this.apiKey}`);
//             return response.ok ? response.json() : Promise.reject("Failed to fetch weather data");
//         } catch (error) {
//             console.error("Weather API error:", error);
//             return null;
//         }
//     }

//     updateActivityRecommendations(weatherData) {
//         if (!weatherData) return;
//         let bestTimes = this.findBestActivityTimes(weatherData);
//         this.displayActivityRecommendations(bestTimes);
//     }

//     findBestActivityTimes(weatherData) {
//         let bestTimes = [];
//         Object.keys(this.activityPreferences).forEach(activity => {
//             let bestHour = this.getBestHourForActivity(activity, weatherData.hourly);
//             if (bestHour !== null) {
//                 bestTimes.push({ name: activity, time: `${bestHour}:00` });
//             }
//         });
//         return bestTimes.length ? bestTimes : [{ name: "No ideal activities available", time: "N/A" }];
//     }

//     getBestHourForActivity(activity, hourlyData) {
//         let { minTemp, maxTemp, maxWind, maxPrecip, maxHumidity, preferredHours } = this.activityPreferences[activity];
//         return hourlyData.find(hour =>
//             hour.temp >= minTemp && hour.temp <= maxTemp &&
//             hour.wind_speed <= maxWind &&
//             hour.pop <= maxPrecip &&
//             hour.humidity <= maxHumidity &&
//             preferredHours.includes(new Date(hour.dt * 1000).getHours())
//         )?.dt ? new Date(hourlyData[0].dt * 1000).getHours() : null;
//     }

//     displayActivityRecommendations(bestTimes) {
//         const activityGrid = document.querySelector(".activities-grid");

//         // Clear existing activity items
//         activityGrid.innerHTML = "";

//         // Group activities by category
//         const categories = {
//             "Outdoor Sports": ["running", "cycling"],
//             "Leisure": ["beach", "outdoor-dining"],
//             "Nature": ["hiking", "gardening"]
//         };

//         // Create activity items for each category
//         for (const [category, activities] of Object.entries(categories)) {
//             const categoryDiv = document.createElement("div");
//             categoryDiv.className = "activity-category";
//             categoryDiv.innerHTML = `<h3>${category}</h3><div class="activity-items"></div>`;

//             activities.forEach(activity => {
//                 const activityData = bestTimes.find(a => a.name === activity);
//                 if (activityData) {
//                     const activityItem = document.createElement("div");
//                     activityItem.className = "activity-item";
//                     activityItem.innerHTML = `
//                         <i class="fas fa-${activity === "outdoor-dining" ? "utensils" : activity}"></i>
//                         <span>${activity.replace("-", " ")}</span>
//                         <div class="recommendation excellent">Best time: ${activityData.time}</div>
//                     `;
//                     categoryDiv.querySelector(".activity-items").appendChild(activityItem);
//                 }
//             });

//             activityGrid.appendChild(categoryDiv);
//         }
//     }
// }

// // Usage
// const apiKey = "1e3e8f230b6064d27976e41163a82b77";
// new ActivityPlanner(apiKey);





// document.addEventListener("DOMContentLoaded", () => {
//     const apiKey = "1e3e8f230b6064d27976e41163a82b77";
//     const cityElement = document.getElementById("city");
//     const tempElement = document.getElementById("current-temp");
//     const conditionElement = document.getElementById("weather-condition");
//     const activitiesGrid = document.querySelector(".activities-grid");

//     // Function to fetch weather based on coordinates
//     function fetchWeather(lat, lon) {
//         const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
//         fetch(url)
//             .then(response => response.json())
//             .then(data => {
//                 const cityName = data.name;
//                 const temp = Math.round(data.main.temp) + "°C";
//                 const condition = data.weather[0].main;

//                 cityElement.innerHTML = `<i class="fa-solid fa-location-dot"></i> <h2>${cityName}</h2>`;
//                 tempElement.textContent = temp;
//                 conditionElement.textContent = condition;

//                 updateActivities(condition, temp);
//             })
//             .catch(error => {
//                 console.error("Error fetching weather:", error);
//             });
//     }

//     // Function to suggest activities based on weather
//     function updateActivities(condition, temp) {
//         let activities = [];

//         if (condition.includes("Clear") || condition.includes("Cloud")) {
//             activities = [
//                 { icon: "fa-running", name: "Running", time: "7:00 AM", level: "excellent" },
//                 { icon: "fa-bicycle", name: "Cycling", time: "8:00 AM", level: "good" },
//             ];
//         } else if (condition.includes("Rain") || condition.includes("Thunderstorm")) {
//             activities = [
//                 { icon: "fa-book", name: "Reading", time: "Anytime", level: "good" },
//                 { icon: "fa-video", name: "Watching Movies", time: "Evening", level: "excellent" },
//             ];
//         } else {
//             activities = [
//                 { icon: "fa-tree", name: "Gardening", time: "4:00 PM", level: "fair" },
//                 { icon: "fa-hiking", name: "Hiking", time: "9:00 AM", level: "good" },
//             ];
//         }

//         activitiesGrid.innerHTML = ""; // Clear previous activities

//         activities.forEach(activity => {
//             const activityHTML = `
//                 <div class="activity-item">
//                     <i class="fas ${activity.icon}"></i>
//                     <span>${activity.name}</span>
//                     <div class="recommendation ${activity.level}">
//                         Best time: ${activity.time}
//                     </div>
//                 </div>`;
//             activitiesGrid.innerHTML += activityHTML;
//         });
//     }

//     // Get user's location
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//             position => {
//                 const { latitude, longitude } = position.coords;
//                 fetchWeather(latitude, longitude);
//             },
//             () => {
//                 alert("Location access denied. Please enter a city manually.");
//             }
//         );
//     } else {
//         alert("Geolocation is not supported by your browser.");
//     }
// });



document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "1e3e8f230b6064d27976e41163a82b77";
    const cityElement = document.getElementById("city");
    const tempElement = document.getElementById("current-temp");
    const conditionElement = document.getElementById("weather-condition");
    const activitiesGrid = document.querySelector(".activities-grid");

    function fetchWeather(lat, lon, cityName = null) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const name = cityName || data.name;
                const temp = Math.round(data.main.temp) + "°C";
                const condition = data.weather[0].main;

                cityElement.innerHTML = `<i class="fa-solid fa-location-dot"></i> <h2>${name}</h2>`;
                tempElement.textContent = temp;
                conditionElement.textContent = condition;

                updateActivities(condition, temp);
            })
            .catch(error => {
                console.error("Error fetching weather:", error);
            });
    }

    function updateActivities(condition, temp) {
        let activities = [];

        if (condition.includes("Clear") || condition.includes("Cloud")) {
            activities = [
                { icon: "fa-running", name: "Running", time: "7:00 AM", level: "excellent" },
                { icon: "fa-bicycle", name: "Cycling", time: "8:00 AM", level: "good" },
            ];
        } else if (condition.includes("Rain") || condition.includes("Thunderstorm")) {
            activities = [
                { icon: "fa-book", name: "Reading", time: "Anytime", level: "good" },
                { icon: "fa-video", name: "Watching Movies", time: "Evening", level: "excellent" },
            ];
        } else {
            activities = [
                { icon: "fa-tree", name: "Gardening", time: "4:00 PM", level: "fair" },
                { icon: "fa-hiking", name: "Hiking", time: "9:00 AM", level: "good" },
            ];
        }

        activitiesGrid.innerHTML = ""; // Clear previous activities

        activities.forEach(activity => {
            const activityHTML = `
                <div class="activity-item">
                    <i class="fas ${activity.icon}"></i>
                    <span>${activity.name}</span>
                    <div class="recommendation ${activity.level}">
                        Best time: ${activity.time}
                    </div>
                </div>`;
            activitiesGrid.innerHTML += activityHTML;
        });
    }

    function checkStoredLocation() {
        const storedLocation = localStorage.getItem("weatherLocation");
        if (storedLocation) {
            const { lat, lon, name } = JSON.parse(storedLocation);
            fetchWeather(lat, lon, name);
            return true;
        }
        return false;
    }

    if (!checkStoredLocation()) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    fetchWeather(latitude, longitude);
                },
                () => {
                    alert("Location access denied. Please enter a city manually.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    }
});

