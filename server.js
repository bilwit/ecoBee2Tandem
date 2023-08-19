import formatData from './utils/formatData';
import { authThermoStatInit, authThermoStatRefresh } from './services/auth';

const ThermoStatTemperatureEndpoint = 'https://api.ecobee.com/1/thermostat?format=json&body={"selection":{"selectionType":"registered","selectionMatch":"","includeRuntime":true}}';

const ecoBeeTokens = {
  access: '',
  refresh: '',
}

// different APIs require different types of authentication so you might need to add special authentication header here
const thermoStatHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + ecoBeeTokens['access'],
  };
  }

const fetchThermoStat = async (config, tokens) => {
  try {
    const response = await fetch(ThermoStatTemperatureEndpoint, {
      method: 'GET',
      headers: thermoStatHeaders(),
    });
    if (response) {
      return await response.json();
    } else {
      throw true;
    }
  } catch (e) {
    console.log('Could not recieve data from thermostat:');
    console.log(e);
    if (tokens['refresh']) {
      // if the access token is expired a new set of tokens will be generated but the thermostat data for this interval will be skipped
      const refreshData = await authThermoStatRefresh(config, tokens);
      if (refreshData && refreshData['access'] && refreshData['refresh']) {
        ecoBeeTokens['access'] = ecoBeeTokens['access'];
        ecoBeeTokens['refresh'] = ecoBeeTokens['refresh'];
      }
    }
    throw(e);
  }
}

const wrapThermoStatAuthInitDispatch = async () => {
  try {
    const thermoStatAuthInitData = await authThermoStatInit({
      apiKey: process.env['ECOBEE_APIKEY'],
      authCode: process.env['ECOBEE_AUTHCODE'],
    });
    if (thermoStatAuthInitData && thermoStatAuthInitData?.access && thermoStatAuthInitData?.refresh) {
      ecoBeeTokens['authCode'] = thermoStatAuthInitData.access;
      ecoBeeTokens['authKey'] = thermoStatAuthInitData.refresh;
    }
  } catch (e) {
    console.log(e);
  }
}

// obtain initial access & refresh tokens
wrapThermoStatAuthInitDispatch();

setInterval(async () => {
  try {
    const thermoStatData = await fetchThermoStat({
      apiKey: process.env['ECOBEE_APIKEY'],
      authCode: process.env['ECOBEE_AUTHCODE'],
    }, ecoBeeTokens);

    // need to do data manipulation to get it to the format that Tandem is expecting to recieve
    const data = formatData(thermoStatData);

    if (data?.[process.env['ECOBEE_DEVICENAME']]) {
      sendToTandem(data[process.env['ECOBEE_DEVICENAME']]);
    }
    
  } catch (e) {
    console.log('failed to ferry data')
  }
}, 60000); // every 30 seconds