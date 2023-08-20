require('dotenv').config();

const tandemHeaders = {
  'Content-Type': 'application/json',
  'Authorization': 'Basic ' + btoa(':' + process.env['TANDEM_INGESTION_PASSWORD']),
};

const sendToTandem = async (thermoStatData) => {
  try {
    const response = await fetch(process.env['TANDEM_ENDPOINT'], {
      method: 'POST',
      headers: tandemHeaders,
      body: JSON.stringify(thermoStatData),
    });
    if (response) {
      if (response.status === 200) {
        console.log((new Date(thermoStatData)).toDateString() + ': ' + thermoStatData.temperature);
        return true;
      } else {
        throw response;
      }
    } else {
      throw true;
    }
  } catch (e) {
    console.log('Could not send data to Tandem:');
    console.log(e);
    throw(e);
  }
}

exports.sendToTandem = sendToTandem;