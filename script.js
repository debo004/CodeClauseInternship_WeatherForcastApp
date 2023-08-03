const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".live-weather-details");
const weatherCardsDiv = document.querySelector(".forcast");

const API_KEY = "3c3f1d22cb3ae2d32c6df7e5d73f1dec"; // API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) { // HTML for the main weather
        return `<div class="live-weather-details">
                    <div class="details-today">
                        <div class="city-time">
                            <div class="city">
                                <i class='bx bxs-buildings'></i>
                                <span>${cityName}</span>
                            </div>
                                <div class="time">
                                <span>${weatherItem.dt_txt.split(" ")[0]}</span>
                            </div>
                        </div>
                        <div class="temp-details">
                            <span class="temp">${(weatherItem.main.temp - 273.15).toFixed(2)}°</span>
                            <span>${weatherItem.weather[0].description}</span>
                        </div>
                    </div>
                    <div class="other-details">
                        <div class="others">
                            <div class="box">
                                <h4>Wind Flow</h4>
                                <p>Today Wind Speed</p>
                                <span>${weatherItem.wind.speed} m/s</span>
                            </div>
                                <div class="box-icon">
                                <i class='bx bx-wind'></i>
                            </div>
                        </div>
                        <div class="others">
                            <div class="box">
                                <h4>Pressure</h4>
                                <p>Today Pressure</p>
                                <span>${weatherItem.main.pressure} hpa</span>
                            </div>
                                <div class="box-icon">
                                <i class='bx bx-compass'></i>
                            </div>
                        </div>
                        <div class="others">
                            <div class="box">
                                <h4>Humidity</h4>
                                <p>Today Humidity</p>
                                <span>${weatherItem.main.humidity} %</span>
                            </div>
                                <div class="box-icon">
                                <i class='bx bxs-droplet-half' ></i>
                            </div>
                        </div>
                        <div class="others">
                            <div class="box">
                                <h4>Visibility</h4>
                                <p>Today Visibility</p>
                                <span>${weatherItem.visibility}</span>
                            </div>
                                <div class="box-icon">
                                <i class='bx bxs-sun'></i>
                            </div>
                        </div>
                    </div>
                </div>`;
    } else { // HTML for the other five day forecast
        return `<div class="per-day">
                    <div class="date">
                        <span>${weatherItem.dt_txt.split(" ")[0]}</span>
                    </div>
                    <div class="day-temp">
                        <span>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°</span>
                        <span>Wind: ${weatherItem.wind.speed} m/s</span>
                        <span>Humidity: ${weatherItem.main.humidity} %</span>
                    </div>
                    <div class="image">
                        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="">
                    </div>
                </div>`;
    }
}

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        // Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        // Clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });        
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        error => { // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());