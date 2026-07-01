/**
 * Project 4: Third-Party API Integration — Weather endpoint tests
 */
const request = require('supertest');
const axios = require('axios');
const app = require('../../server');
const User = require('../../projects/project2-database/models/User');
const {
  transformCurrentWeather,
  kelvinToCelsius,
} = require('../../projects/project4-weather-api/controllers/weatherController');

jest.mock('axios');

describe('Project 4: Weather API Integration', () => {
  let token;

  const mockWeatherResponse = {
    name: 'London',
    sys: { country: 'GB', sunrise: 1700000000, sunset: 1700030000 },
    coord: { lat: 51.5, lon: -0.12 },
    weather: [{ main: 'Clouds', description: 'overcast clouds', icon: '04d' }],
    main: { temp: 293.15, feels_like: 292, temp_min: 290, temp_max: 295, humidity: 80, pressure: 1013 },
    wind: { speed: 3.5, deg: 180 },
    visibility: 10000,
    dt: 1700010000,
  };

  beforeEach(async () => {
    const user = await User.create({
      name: 'Weather User',
      email: 'weather@test.com',
      password: 'password1',
    });
    const jwt = require('jsonwebtoken');
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  });

  describe('The Translator — transformCurrentWeather', () => {
    it('should transform raw API response to clean format', () => {
      const result = transformCurrentWeather(mockWeatherResponse);
      expect(result.city).toBe('London');
      expect(result.temperature.current).toBe(kelvinToCelsius(293.15));
    });
  });

  describe('GET /api/weather/current (public)', () => {
    it('should return weather for valid city', async () => {
      axios.get.mockResolvedValue({ data: mockWeatherResponse });
      const res = await request(app).get('/api/weather/current').query({ city: 'London' });
      expect(res.status).toBe(200);
      expect(res.body.data.city).toBe('London');
    });

    it('should reject missing city', async () => {
      const res = await request(app).get('/api/weather/current');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/weather/forecast (Project 3 auth required)', () => {
    it('should require authentication', async () => {
      const res = await request(app).get('/api/weather/forecast').query({ city: 'London' });
      expect(res.status).toBe(401);
    });

    it('should return forecast for authenticated user', async () => {
      axios.get.mockResolvedValue({
        data: {
          city: { name: 'London', country: 'GB' },
          list: [{
            dt: Math.floor(Date.now() / 1000),
            weather: [{ main: 'Rain', description: 'light rain', icon: '10d' }],
            main: { temp: 290, feels_like: 288, humidity: 90 },
            wind: { speed: 2 },
          }],
        },
      });

      const res = await request(app)
        .get('/api/weather/forecast')
        .query({ city: 'London' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.forecast).toBeDefined();
    });
  });
});
