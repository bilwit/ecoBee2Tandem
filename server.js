require('dotenv').config();
const { formatData } = require('./utils/formatData');
const { authThermoStatInit, authThermoStatRefresh } = require('./services/auth');
const { sendToTandem } = require('./services/tandem');
const mongoose = require('mongoose');

const AccessToken = require('./models/AccessToken');
const RefreshToken = require('./models/RefreshToken');

const ThermoStatTemperatureEndpoint = 'https://api.ecobee.com/1/thermostat?format=json&body={"selection":{"selectionType":"registered","selectionMatch":"","includeRuntime":true}}';

mongoose
  .connect('mongodb://ecobee2tandem-database:27017/ecobee2tandem', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log(err));

// different APIs require different types of authentication so you might need to add special authentication header here
const thermoStatHeaders = async () => {
  try {
    const accessToken = await AccessToken.findOne({}).select('token').lean();
    console.log(accessToken)
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

const fetchThermoStat = async (config) => {
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
    
    await authThermoStatRefresh(config, refreshToken?.token || process.env['INIT_REFRESH']);

    throw(e);
  }
}

const wrapThermoStatAuthInitDispatch = async () => {
  try {
    const thermoStatAuthInitData = await authThermoStatInit({
      apiKey: process.env['ECOBEE_APIKEY'],
      authCode: process.env['ECOBEE_AUTHCODE'],
    });
    if (thermoStatAuthInitData) {
      console.log(thermoStatAuthInitData)
    }
    if (thermoStatAuthInitData && thermoStatAuthInitData?.access && thermoStatAuthInitData?.refresh) {
      const newAccessToken = new AccessToken({
        token: thermoStatAuthInitData.access,
      });
      newAccessToken.save();
      const newRefreshToken = new RefreshToken({
        token: thermoStatAuthInitData.refresh,
      })
      newRefreshToken.save();
    }
  } catch (_e) {
    // console.log(e);
  }
}

// obtain initial access & refresh tokens
wrapThermoStatAuthInitDispatch();

setInterval(async () => {
  try {
    const thermoStatData = await fetchThermoStat({
      apiKey: process.env['ECOBEE_APIKEY'],
      authCode: process.env['ECOBEE_AUTHCODE'],
    });

    // need to do data manipulation to get it to the format that Tandem is expecting to recieve
    const data = formatData(thermoStatData);

    if (data?.[process.env['ECOBEE_DEVICENAME']]) {
      console.log(data?.[process.env['ECOBEE_DEVICENAME']]);
      // sendToTandem(data[process.env['ECOBEE_DEVICENAME']]);
    }
    
  } catch (e) {
    console.log('failed to ferry data')
  }
}, process.env['UPDATEINTERVAL']); // every 30 seconds