const ThermoStatAuthEndpoint = 'https://api.ecobee.com/token';

// get initial auth & refresh tokens from EcoBee, auth token expires in 60min
const authThermoStatInit = async (config) => {
  try {
    const response = await fetch(ThermoStatAuthEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        grant_type: 'ecobeePin',
        code: config['authCode'],
        client_id: config['apiKey'],
      }),
    });
    if (response) {
      return await response.json();
    } else {
      throw true;
    }
  } catch (e) {
    console.log('Could not authenticate with thermostat:');
    console.log(e);
    throw(e);
  }
}

// refresh tokens using refresh_token
const authThermoStatRefresh = async (config, tokens) => {
  try {
    const response = await fetch(ThermoStatAuthEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        grant_type: 'refresh_token',
        code: tokens['refresh'],
        client_id: config['apiKey'],
      }),
    });
    if (response) {
      return await response.json();
    } else {
      throw true;
    }
  } catch (e) {
    console.log('Could not obtain refresh tokens from thermostat:');
    console.log(e);
    throw(e);
  }
}

modules.export = {
  authThermoStatInit,
  authThermoStatRefresh,
}
