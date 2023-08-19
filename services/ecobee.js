require('dotenv').config();
const { authThermoStatRefresh } = require('./auth');
const AccessToken = require('../models/AccessToken');
const RefreshToken = require('../models/RefreshToken');

const ThermoStatTemperatureEndpoint = 'https://api.ecobee.com/1/thermostat?format=json&body={"selection":{"selectionType":"registered","selectionMatch":"","includeRuntime":true}}';

// different APIs require different types of authentication so you might need to add special authentication header here
const thermoStatHeaders = async () => {
  try {
    const accessToken = await AccessToken.findOne({}).select('token').lean();

    if (accessToken?.token) {
      return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken.token,
      };
    }
  } catch (e) {
    console.log(e);
  }
}

const fetchThermoStat = async () => {
  try {
    const response = await fetch(ThermoStatTemperatureEndpoint, {
      method: 'GET',
      headers: await thermoStatHeaders(),
    });
    if (response) {
      const res = await response.json();
      if (res?.error) {
        throw res;
      } else {
        console.log(res)
        return await res;
      }
    } else {
      throw true;
    }
  } catch (e) {
    console.log('Could not recieve data from thermostat:');
    console.log(e);

    const refreshToken = await RefreshToken.findOne({}).select('token').lean();
    
    await authThermoStatRefresh({
      apiKey: process.env['ECOBEE_APIKEY'],
      authCode: process.env['ECOBEE_AUTHCODE'],
    }, refreshToken?.token || process.env['INIT_REFRESH']);

    throw(e);
  }
}

exports.fetchThermoStat = fetchThermoStat;