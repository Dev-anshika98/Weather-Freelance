class ActivityPlanner {
    constructor() {
        this.activities = {
            running: {
                idealTemp: { min: 15, max: 25 },
                maxWindSpeed: 20,
                maxPrecipitation: 0,
                idealHumidity: { min: 30, max: 60 },
                preferredHours: [6, 7, 8, 17, 18]
            },
            cycling: {
                idealTemp: { min: 15, max: 28 },
                maxWindSpeed: 15,
                maxPrecipitation: 0,
                idealHumidity: { min: 30, max: 65 },
                preferredHours: [7, 8, 9, 16, 17]
            },
            beach: {
                idealTemp: { min: 25, max: 30 },
                maxWindSpeed: 20,
                maxPrecipitation: 0,
                idealHumidity: { min: 40, max: 70 },
                preferredHours: [10, 11, 12, 13, 14]
            },
            hiking: {
                idealTemp: { min: 15, max: 25 },
                maxWindSpeed: 25,
                maxPrecipitation: 1,
                idealHumidity: { min: 30, max: 70 },
                preferredHours: [8, 9, 10, 15, 16]
            }
        };
        this.init();
    }

    async init() {
        try {
            const savedLocation = this.getSavedLocation();
            
            if (savedLocation) {
                const weatherData = await this.fetchWeatherData(
                    savedLocation.lat, 
                    savedLocation.lon
                );
                
                document.getElementById('city').textContent = savedLocation.name;
                this.updateCurrentWeather(weatherData);
                this.updateRecommendations(weatherData);
            } else {
                try {
                    const position = await this.getCurrentLocation();
                    const weatherData = await this.fetchWeatherData(
                        position.coords.latitude, 
                        position.coords.longitude
                    );
                    
                    const cityName = await this.getCityName(
                        position.coords.latitude, 
                        position.coords.longitude
                    );
                    
                    // Save the new location
                    this.saveLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        name: cityName
                    });
                    
                    document.getElementById('city').textContent = cityName;
                    this.updateCurrentWeather(weatherData);
                    this.updateRecommendations(weatherData);
                } catch (locationError) {
                    this.showError("No location selected. Please search for a location first.");
                }
            }
        } catch (error) {
            console.error('Error:', error);
            this.showError("Failed to load weather data. Please try again.");
        }
    }

    saveLocation(locationData) {
        localStorage.setItem('weatherLocation', JSON.stringify({
            ...locationData,
            timestamp: Date.now()
        }));
    }

    getSavedLocation() {
        const savedData = localStorage.getItem('weatherLocation');
        if (!savedData) return null;

        const locationData = JSON.parse(savedData);
        if (Date.now() - locationData.timestamp < 30 * 60 * 1000) {
            return locationData;
        }
        localStorage.removeItem('weatherLocation');
        return null;
    }

    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
    }

    async getCityName(lat, lon) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=1e3e8f230b6064d27976e41163a82b77`
            );
            const data = await response.json();
            return data[0].name;
        } catch (error) {
            console.error('Error fetching city name:', error);
            return 'Unknown Location';
        }
    }

    async fetchWeatherData(lat, lon) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=1e3e8f230b6064d27976e41163a82b77`
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching weather data:', error);
            throw error;
        }
    }

    calculateActivityScore(weather, criteria) {
        let score = 100;

        const tempMid = (criteria.idealTemp.max + criteria.idealTemp.min) / 2;
        const tempDiff = Math.abs(weather.temp - tempMid);
        score -= (tempDiff / criteria.idealTemp.max) * 20;

        score -= (weather.wind_speed / criteria.maxWindSpeed) * 15;

        const idealHumidityMid = (criteria.idealHumidity.max + criteria.idealHumidity.min) / 2;
        const humidityDiff = Math.abs(weather.humidity - idealHumidityMid);
        score -= (humidityDiff / criteria.idealHumidity.max) * 15;

        if (weather.precipitation > criteria.maxPrecipitation) {
            score -= 30;
        }

        return Math.max(0, Math.round(score));
    }

    getQualityLevel(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        return 'poor';
    }

    getBestTime(weatherData, activity) {
        const criteria = this.activities[activity];
        let bestTime = null;
        let bestScore = 0;

        weatherData.hourly.slice(0, 24).forEach((hourData, index) => {
            const hour = new Date(hourData.dt * 1000).getHours();
            
            if (criteria.preferredHours.includes(hour)) {
                const score = this.calculateActivityScore(hourData, criteria);
                if (score > bestScore) {
                    bestScore = score;
                    bestTime = hour;
                }
            }
        });

        return {
            time: bestTime,
            score: bestScore
        };
    }

    formatTime(hour) {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:00 ${ampm}`;
    }

    updateCurrentWeather(weatherData) {
        const currentWeather = weatherData.current;
        document.getElementById('current-temp').textContent = 
            `${Math.round(currentWeather.temp)}°C`;
        document.getElementById('weather-condition').textContent = 
            currentWeather.weather[0].main;
    }

    updateRecommendations(weatherData) {
        this.updateCurrentWeather(weatherData);

        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach(item => {
            const activityType = item.getAttribute('data-activity') || 
                               item.querySelector('span').textContent.toLowerCase();
            
            if (this.activities[activityType]) {
                const recommendation = this.getBestTime(weatherData, activityType);
                this.updateActivityUI(activityType, recommendation);
            }
        });
    }

    updateActivityUI(activity, recommendation) {
        const element = document.querySelector(`[data-activity="${activity}"]`) || 
                       document.querySelector(`.activity-item:has(span:contains('${activity}'))`);
        
        if (!element) return;
        
        const timeElement = element.querySelector('.recommendation');
        
        if (recommendation.time !== null) {
            const formattedTime = this.formatTime(recommendation.time);
            
            if (recommendation.score >= 70) {
                timeElement.textContent = `Best time: ${formattedTime}`;
                timeElement.className = 'recommendation excellent';
            } else if (recommendation.score >= 50) {
                timeElement.textContent = `Good time: ${formattedTime}`;
                timeElement.className = 'recommendation good';
            } else {
                timeElement.textContent = 'Not recommended today';
                timeElement.className = 'recommendation poor';
            }
        } else {
            timeElement.textContent = 'Not recommended today';
            timeElement.className = 'recommendation poor';
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const container = document.querySelector('.activities-grid');
        const existingError = container.querySelector('.error-message');
        
        if (existingError) {
            existingError.remove();
        }
        
        container.prepend(errorDiv);
    }

    formatWeatherData(rawData) {
        return {
            temp: rawData.temp,
            wind_speed: rawData.wind_speed,
            humidity: rawData.humidity,
            precipitation: rawData.precipitation || 0,
            uvi: rawData.uvi
        };
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    const planner = new ActivityPlanner();

    // Refresh data every 30 minutes
    setInterval(() => planner.init(), 30 * 60 * 1000);
});