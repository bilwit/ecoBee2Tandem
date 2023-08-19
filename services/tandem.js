const TandemEndpoint = 'https://wherever2';

const tandemHeaders = {
  'Content-Type': 'application/json',
};

const sendToTandem = async (thermoStatData) => {
  try {
    const response = await fetch(TandemEndpoint, {
      method: 'POST',
      headers: tandemHeaders,
      body: JSON.stringify(thermoStatData),
    });
    if (response) {
      return response.json();
    } else {
      throw true;
    }
  } catch (e) {
    console.log('Could not send data to Tandem:');
    console.log(e);
    throw(e);
  }
}