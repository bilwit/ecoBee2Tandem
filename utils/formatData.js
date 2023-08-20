const formatData = (thermoStatData) => {
  // thermostatList is an array with all devices associated with the ecobee account
  if (thermoStatData?.thermostatList && thermoStatData.thermostatList.length > 0) {
    const devices = {};
    for (const item of thermoStatData.thermostatList) {
      devices[item.name] = {
        date: (new Date(item.thermostatTime)).getTime(),
        temperature: item.runtime.actualTemperature * 0.1, // temperature is reported in 0.1 per Fahrenheit
      }
    }
    return devices;
  }
  return thermoStatData;
}

exports.formatData = formatData;