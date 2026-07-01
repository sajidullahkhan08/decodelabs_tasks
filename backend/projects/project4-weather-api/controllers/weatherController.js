/**
 * PROJECT 4: Third-Party API Integration
 *
 * Roles implemented:
 *   1. The Vault    — API keys via environment variables
 *   2. The Messenger — Axios HTTP client with timeout
 *   3. The Translator — Transform/filter/map/reduce API responses
 *   4. The Shield   — Error handling, circuit breaker, graceful degradation
 */
const axios = require('axios');
const { weatherCircuitBreaker } = require('../utils/circuitBreaker');
const { weatherCache } = require('../middleware/cache');
const { validateCity } = require('../../project2-database/utils/validators');

const API_KEY = () => process.env.OPENWEATHER_API_KEY;
const BASE_URL = () => process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';
const TIMEOUT = () => parseInt(process.env.WEATHER_API_TIMEOUT, 10) || 5000;

const kelvinToCelsius = (kelvin) => Math.round((kelvin - 273.15) * 10) / 10;
const formatTimestamp = (unix) => new Date(unix * 1000).toISOString();

const buildCityQuery = (city, country) => {
  const trimmed = city.trim();
  return country ? `${trimmed},${country.trim()}` : trimmed;
};

/** Role 3: The Translator — transform raw API response */
const transformCurrentWeather = (raw) => ({
  city: raw.name,
  country: raw.sys?.country,
  coordinates: { lat: raw.coord?.lat, lon: raw.coord?.lon },
  weather: raw.weather?.[0]?.main,
  description: raw.weather?.[0]?.description,
  icon: raw.weather?.[0]?.icon,
  temperature: {
    current: kelvinToCelsius(raw.main?.temp),
    feelsLike: kelvinToCelsius(raw.main?.feels_like),
    min: kelvinToCelsius(raw.main?.temp_min),
    max: kelvinToCelsius(raw.main?.temp_max),
  },
  humidity: raw.main?.humidity,
  pressure: raw.main?.pressure,
  wind: { speed: raw.wind?.speed, direction: raw.wind?.deg },
  visibility: raw.visibility,
  sunrise: formatTimestamp(raw.sys?.sunrise),
  sunset: formatTimestamp(raw.sys?.sunset),
  timestamp: formatTimestamp(raw.dt),
});

const transformForecastItem = (item) => ({
  dateTime: formatTimestamp(item.dt),
  weather: item.weather?.[0]?.main,
  description: item.weather?.[0]?.description,
  icon: item.weather?.[0]?.icon,
  temperature: kelvinToCelsius(item.main?.temp),
  feelsLike: kelvinToCelsius(item.main?.feels_like),
  humidity: item.main?.humidity,
  windSpeed: item.wind?.speed,
});

/** Role 2: The Messenger — fetch current weather via Axios */
const fetchCurrentWeather = async (city, country) => {
  const query = buildCityQuery(city, country);
  const response = await axios.get(`${BASE_URL()}/weather`, {
    params: { q: query, appid: API_KEY() },
    timeout: TIMEOUT(),
  });
  return transformCurrentWeather(response.data);
};

const fetchForecast = async (city, country) => {
  const query = buildCityQuery(city, country);
  const response = await axios.get(`${BASE_URL()}/forecast`, {
    params: { q: query, appid: API_KEY() },
    timeout: TIMEOUT(),
  });
  return response.data;
};

/** Role 4: The Shield — map external errors to safe responses */
const handleWeatherError = (error) => {
  if (error.code === 'ECONNABORTED') {
    return { statusCode: 504, message: 'Weather service request timed out' };
  }
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return { statusCode: 503, message: 'Weather service is currently unavailable' };
  }
  if (error.response) {
    const status = error.response.status;
    const apiMessage = error.response.data?.message;
    if (status === 404) return { statusCode: 404, message: 'City not found' };
    if (status === 401) return { statusCode: 500, message: 'Weather service configuration error' };
    if (status === 429) return { statusCode: 429, message: 'Weather API rate limit exceeded' };
    return { statusCode: status, message: apiMessage || 'Weather API error' };
  }
  return { statusCode: 500, message: 'Failed to fetch weather data' };
};

/** GET /api/weather/current */
const getWeatherByCity = async (req, res) => {
  try {
    const { city, country } = req.query;

    if (!validateCity(city)) {
      return res.status(400).json({
        success: false,
        message: 'A valid city parameter is required',
      });
    }

    if (!API_KEY() || API_KEY() === 'your_openweather_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'Weather API key is not configured',
      });
    }

    const cacheKey = req.cacheKey || weatherCache.generateKey('current', { city, country });
    const cached = weatherCache.get(cacheKey);

    const data = await weatherCircuitBreaker.execute(
      () => fetchCurrentWeather(city, country),
      () => {
        if (cached) return cached;
        throw new Error('Service temporarily unavailable and no cached data');
      }
    );

    weatherCache.set(cacheKey, data);

    res.status(200).json({ success: true, cached: false, data });
  } catch (error) {
    const cached = weatherCache.get(
      req.cacheKey || weatherCache.generateKey('current', req.query)
    );
    if (cached && weatherCircuitBreaker.getState() === 'OPEN') {
      return res.status(200).json({
        success: true,
        cached: true,
        degraded: true,
        data: cached,
      });
    }
    const { statusCode, message } = handleWeatherError(error);
    res.status(statusCode).json({ success: false, message });
  }
};

/** GET /api/weather/forecast */
const getWeatherWithForecast = async (req, res) => {
  try {
    const { city, country } = req.query;

    if (!validateCity(city)) {
      return res.status(400).json({
        success: false,
        message: 'A valid city parameter is required',
      });
    }

    const cacheKey = req.cacheKey || weatherCache.generateKey('forecast', { city, country });
    const cached = weatherCache.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, cached: true, data: cached });
    }

    const raw = await weatherCircuitBreaker.execute(() => fetchForecast(city, country));

    const now = Date.now();
    const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;

    const filtered = raw.list
      .filter((item) => item.dt * 1000 <= now + fiveDaysMs)
      .map(transformForecastItem);

    const grouped = filtered.reduce((acc, item) => {
      const day = item.dateTime.split('T')[0];
      if (!acc[day]) acc[day] = { readings: [], temperatures: [], humidities: [] };
      acc[day].readings.push(item);
      acc[day].temperatures.push(item.temperature);
      acc[day].humidities.push(item.humidity);
      return acc;
    }, {});

    const forecast = Object.entries(grouped)
      .slice(0, 5)
      .map(([date, dayData]) => ({
        date,
        avgTemperature:
          Math.round(
            (dayData.temperatures.reduce((a, b) => a + b, 0) / dayData.temperatures.length) * 10
          ) / 10,
        avgHumidity: Math.round(
          dayData.humidities.reduce((a, b) => a + b, 0) / dayData.humidities.length
        ),
        readings: dayData.readings,
      }));

    const result = { city: raw.city?.name, country: raw.city?.country, forecast };
    weatherCache.set(cacheKey, result);

    res.status(200).json({ success: true, cached: false, data: result });
  } catch (error) {
    const { statusCode, message } = handleWeatherError(error);
    res.status(statusCode).json({ success: false, message });
  }
};

/** POST /api/weather/multiple */
const getWeatherMultipleCities = async (req, res, next) => {
  try {
    const { cities } = req.body;

    if (!Array.isArray(cities) || cities.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of cities',
      });
    }

    if (cities.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 cities allowed per request',
      });
    }

    const results = await Promise.all(
      cities.map(async (entry) => {
        const city = typeof entry === 'string' ? entry : entry.city;
        const country = typeof entry === 'object' ? entry.country : undefined;

        if (!validateCity(city)) {
          return { city, success: false, message: 'Invalid city name' };
        }

        try {
          const data = await weatherCircuitBreaker.execute(() =>
            fetchCurrentWeather(city, country)
          );
          return { city, success: true, data };
        } catch (error) {
          const { message } = handleWeatherError(error);
          return { city, success: false, message };
        }
      })
    );

    res.status(200).json({
      success: true,
      count: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/weather/cache/clear */
const clearWeatherCache = (req, res) => {
  const size = weatherCache.size();
  weatherCache.clear();
  weatherCircuitBreaker.reset();
  res.status(200).json({
    success: true,
    message: `Cleared ${size} cached weather entries`,
  });
};

module.exports = {
  getWeatherByCity,
  getWeatherWithForecast,
  getWeatherMultipleCities,
  clearWeatherCache,
  transformCurrentWeather,
  kelvinToCelsius,
};
