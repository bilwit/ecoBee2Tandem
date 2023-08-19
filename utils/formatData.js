const formatData = (thermoStatData) => {
  // thermostatList is an array with all devices associated with the ecobee account
  if (thermoStatData?.thermostatList && thermoStatData.thermostatList.length > 0) {
    const devices = {};
    for (const item of thermoStatData.thermostatList) {
      devices[item.name] = {
        date: item.thermostatTime,
        temperature: item.runtime.actualTemperature,
      }
    }
    return devices;
  }
  return thermoStatData;
}

exports.formatData = formatData;