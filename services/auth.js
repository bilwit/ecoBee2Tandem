const RefreshToken = require("../models/RefreshToken");
const AccessToken = require("../models/AccessToken");

const ThermoStatAuthEndpoint = 'https://api.ecobee.com/token';

// get initial auth & refresh tokens from EcoBee, auth token expires in 60min
const authThermoStatInit = async () => {
  try {
    const response = await fetch(ThermoStatAuthEndpoint +
      '?grant_type=ecobeePin' +
      '&code=' + process.env['ECOBEE_AUTHCODE'] +
      '&client_id=' + process.env['ECOBEE_APIKEY']
    , {
      method: 'POST',
    });
    if (response) {
      const res = await response.json();
      if (res?.error) {
        throw res;
      } else if (res && res?.access && res?.refresh) {
        const newAccessToken = new AccessToken({
          token: res.access,
        });
        newAccessToken.save();
        const newRefreshToken = new RefreshToken({
          token: res.refresh,
        })
        newRefreshToken.save();
        return true;
      }
    } else {
      throw true;
    }
  } catch (e) {
    console.log('Could not authenticate with thermostat:');
    console.log(e);

    const refreshToken = await RefreshToken.findOne({}).select('token').lean();

    if (refreshToken?.token || process.env['INIT_REFRESH']) {
      const refreshData = await authThermoStatRefresh(config, refreshToken?.token || process.env['INIT_REFRESH']);
  
      if (refreshData && refreshData['access_token'] && (refreshData['refresh_token'])) {
        await AccessToken.deleteMany({});
        const newAccessToken = new AccessToken({
          token: refreshData['access_token'],
        });
        newAccessToken.save();

        const dupeRefresh = await RefreshToken.find({
          token: refreshData['refresh_token'],
        }).select('token').lean();

        if (dupeRefresh && dupeRefresh.length < 1) {
          const newRefreshToken = new RefreshToken({
            token: refreshData['refresh_token'],
          })
          newRefreshToken.save();
        }
      }
    }

    throw(e);
  }
}

// refresh tokens using refresh_token
const authThermoStatRefresh = async (config, refresh) => {
  try {
    const response = await fetch(ThermoStatAuthEndpoint +
      '?grant_type=refresh_token' +
      '&code=' + refresh +
      '&client_id=' + config['apiKey']
    , {
      method: 'POST',
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

exports.authThermoStatInit = authThermoStatInit;
exports.authThermoStatRefresh = authThermoStatRefresh;
