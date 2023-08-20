require('dotenv').config();
const { formatData } = require('./utils/formatData');
const { authThermoStatInit } = require('./services/auth');
const { sendToTandem } = require('./services/tandem');
const { fetchThermoStat } = require('./services/ecobee');
const mongoose = require('mongoose');

mongoose
  .connect('mongodb://ecobee2tandem-database:27017/ecobee2tandem', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log(err));

  // obtain initial access & refresh tokens
const wrapInit = async () => {
  try {
    return await authThermoStatInit();
  } catch (_e) {
    // console.log(e);
  }
}


const wrapDispatch = async () => {
  try {
    const thermoStatData = await fetchThermoStat();

    // need to do data manipulation to get it to the format that Tandem is expecting to recieve
    const data = formatData(thermoStatData);

    if (data?.[process.env['ECOBEE_DEVICENAME']]) {
      console.log(data?.[process.env['ECOBEE_DEVICENAME']]);
      sendToTandem(data[process.env['ECOBEE_DEVICENAME']]);
    }
  } catch (e) {
    console.log(e);
  }
}

wrapInit().then(async () => {
  await wrapDispatch();

  setInterval(async () => {
    try {
      wrapDispatch();
    } catch (e) {
      console.log('failed to ferry data')
    }
  }, process.env['UPDATEINTERVAL']); // every 30 seconds
});