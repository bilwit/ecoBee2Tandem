const formatData = (thermoStatData) => {
  // thermostatList is an array with all devices associated with the ecobee account
  if (thermoStatData?.thermostatList && thermoStatData.thermostatList.length > 0) {
    const devices = {};
    for (const item of thermoStatData.thermostatList) {
      // time returned in YYYY-MM-DD HH:MM:SS format
      const split = item.thermostatTime.trim().split(' ');
      const yearMonthDay = split[0].split('-');
      const hourMinuteSeconds = split[1].split(':');

      const newDate = new Date();
      newDate.setFullYear(yearMonthDay[0]);
      newDate.setMonth(yearMonthDay[1]);
      newDate.setDate(yearMonthDay[2]);
      newDate.setHours(hourMinuteSeconds[0]);
      newDate.setMinutes(hourMinuteSeconds[1]);
      newDate.setSeconds(hourMinuteSeconds[2]);

      devices[item.name] = {
        date: (newDate.getTime() - newDate.getMilliseconds()) / 1000, // convert to epoch
        temperature: (item.runtime.actualTemperature * 0.1).toFixed(2), // temperature is reported in 0.1 per Fahrenheit
      }
    }
    return devices;
  }
  return thermoStatData;
}

exports.formatData = formatData;