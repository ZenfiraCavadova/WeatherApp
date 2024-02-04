const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("searchBtn");
const currentWeatherDiv = document.querySelector(".weather-container");
const weatherCardsDiv = document.querySelector(".day-container");
const locationContainer = document.querySelector(".location-container");

const API_KEY = "f809cf2243072809b04dd88f7165cb92";

const createWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) {
    locationContainer.innerHTML = ` 
    <img src="./assets/current location icon.png" alt="" />
    <h3>${cityName.toUpperCase()}</h3>`;

    return `<div class="weather">
    <div class="main-temp">
      <h2>${(weatherItem.main.temp - 273.15).toFixed(0)}°C</h2>
      <div class="feel-like">
        <p>Feels like:</p>
        <h4>${(weatherItem.main.feels_like - 273.15).toFixed(0)}°C</h4>
      </div>
     
    </div>
    <div class="main-weather">
      <img src="./assets/${weatherItem.weather[0].main.toLowerCase()}.png" alt="" width="270px" height="270px" />
      <p id="weather-header">${weatherItem.weather[0].main}</p>
    </div>
    <div class="characteristics">
      <div class="character-container">
        <div class="sign">
          <img src="./assets/humidity.png" alt="" />
          <h4>${weatherItem.main.humidity} %</h4>
          <p>Humidity</p>
        </div>
        <div class="sign">
          <img src="./assets/wind.png" alt="" />
          <h4>${weatherItem.wind.speed} M/S</h4>
          <p>Wind Speed</p>
        </div>
      </div>
      <div class="character-container">
        <div class="sign">
          <img src="./assets/pressure.png" alt="" />
          <h4>${weatherItem.main.pressure} hPa</h4>
          <p>Pressure</p>
        </div>
        <div class="sign">
          <img src="./assets/sea-level.png" alt="" width="60px" height="51px" />
          <h4>${weatherItem.main.sea_level} m</h4>
          <p>Sea Level</p>
        </div>
      </div>
    </div>
  </div>`;
  } else {
    return `
    <div class="days">
            <img src="./assets/${weatherItem.weather[0].main.toLowerCase()}.png" alt="" width="60px" height="60px"/>
            <p>${(weatherItem.main.temp - 273.15).toFixed()}°C</p>
            <p>${weatherItem.dt_txt.split(" ")[0]}</p>
          </div>`;
  }
};

const getWeatherDetails = async function (cityName, latitude, longitude) {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
  const response = await fetch(WEATHER_API_URL);
  const responseData = await response.json();

  const uniqueForecastDays = [];
  const fiveDaysForecast = responseData.list.filter((forecast) => {
    const forecastDate = new Date(forecast.dt_txt).getDate();
    if (!uniqueForecastDays.includes(forecastDate)) {
      return uniqueForecastDays.push(forecastDate);
    }
  });

  cityInput.value = "";
  currentWeatherDiv.innerHTML = "";
  weatherCardsDiv.innerHTML = "";

  fiveDaysForecast.forEach((weatherItem, index) => {
    const html = createWeatherCard(cityName, weatherItem, index);
    console.log(weatherItem);
    if (index === 0) {
      currentWeatherDiv.insertAdjacentHTML("beforeend", html);
    } else {
      weatherCardsDiv.insertAdjacentHTML("beforeend", html);
    }
  });
};

const getCityCoordinates = async () => {
  try {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;

    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    const response = await fetch(API_URL);
    const responseData = await response.json();

    if (!responseData.length) {
      return console.log(`No coordinates found for ${cityName}`);
    }
    const { lat, lon, name } = responseData[0];
    getWeatherDetails(name, lat, lon);
  } catch (error) {
    console.error("An error occurred while fetching the coordinates!");
  }
};

const getUserCoordinates = async () => {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const { latitude, longitude } = position.coords;
    const API_URL = `api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

    const response = await fetch(API_URL);
    const responseData = await response.json();
    const { name } = responseData[0];

    getWeatherDetails(name, latitude, longitude);
    console.log(response);
  } catch (error) {
    if (error.code === error.PERMISSION_DENIED) {
      alert(
        "Geolocation request denied. Please reset location permission to grant access again."
      );
    } else {
      alert("Geolocation request error. Please reset location permission.");
    }
  }
};

searchBtn.addEventListener("click", getCityCoordinates);
cityInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && getCityCoordinates()
);

document.addEventListener("DOMContentLoaded", () => {
  const defaultCityName = "London";
  const defaultLatitude = 51.509865;
  const defaultLongitude = -0.118092;
  getWeatherDetails(defaultCityName, defaultLatitude, defaultLongitude);
});
