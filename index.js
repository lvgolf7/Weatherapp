const apiKey = "";
const apiUrl = (cityId) =>
  `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${apiKey}&units=imperial`;

const searchBox = document.querySelector(".search input");
const searchButton = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const weatherCondition = document.querySelector(".weather-condition");
const timeDay = document.querySelector(".time-day");

function capitalizeWords(string) {
  const words = string.toLowerCase().split(" ");
  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  return capitalizedWords.join(" ");
}

function degreesToCompass(degrees) {
  const compass = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
    "N",
  ];
  const index = Math.round((degrees % 360) / 22.5);
  return compass[index];
}

let cities = [];
let cityIdMap = {};

// Load city list JSON
fetch("data/city.list.json")
  .then((response) => {
    if (!response.ok) throw new Error("city.list.json not found");
    return response.json();
  })
  .then((data) => {
    cities = data;
    data.forEach((city) => {
      cityIdMap[`${city.name},${city.state},${city.country}`] = city.id;
    });
  })
  .catch((err) => alert(err.message));

const searchInput = document.getElementById("searchInput");
const dataList = document.getElementById("dataListOptions");

searchInput.addEventListener("input", function () {
  const value = this.value.trim().toLowerCase();
  dataList.innerHTML = "";
  if (value.length < 2) return;
  const matches = cities
    .filter((city) => city.name.toLowerCase().startsWith(value))
    .slice(0, 10);
  matches.forEach((city) => {
    const option = document.createElement("option");
    option.value = `${city.name},${city.state},${city.country}`;
    dataList.appendChild(option);
  });
});

async function getWeather(cityId) {
  const response = await fetch(apiUrl(cityId));
  var data = await response.json();

  document.querySelector(".city").innerHTML = data.name;
  document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°F";
  document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
  document.querySelector(".wind").innerHTML =
    data.wind.speed + " mph" + " (" + degreesToCompass(data.wind.deg) + ")";

  weatherIcon.src =
    "https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";
  weatherCondition.innerHTML = capitalizeWords(data.weather[0].description);
  const nowUTC = new Date(Date.now() + new Date().getTimezoneOffset() * 60000);
  const localTime = new Date(nowUTC.getTime() + data.timezone * 1000);
  const date_time = localTime.toLocaleString();
  const iconCode = data.weather[0].icon;
  const weatherCard = document.querySelector(".card");
  if (weatherCard) {
    if (iconCode.endsWith("d")) {
      weatherCard.style.background =
        "linear-gradient(135deg, #c7fe00 0%, #17058d 100%)";
      weatherCard.style.color = "#fff";
      document.querySelector(".time-day").innerHTML = date_time;
    } else {
      weatherCard.style.background =
        "linear-gradient(135deg, #3f27c5ff 0%, #414345 100%)";
      weatherCard.style.color = "#fff";
      document.querySelector(".time-day").innerHTML = date_time;
    }
  }
}

// Only search by cityId from suggestions
searchInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    const value = searchInput.value.trim();
    const cityId = cityIdMap[value];
    if (cityId) {
      getWeather(cityId);
    }
  }
});
searchButton.addEventListener("click", () => {
  const value = searchInput.value.trim();
  const cityId = cityIdMap[value];
  if (cityId) {
    getWeather(cityId);
  }
});
