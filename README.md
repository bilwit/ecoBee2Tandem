# ecoBee2Tandem
Send smart home ecobee data to Tandem API

## Description
Request temperature data from a single ecobee device and send it to a Tandem stream sensor at regular intervals.

## Required Environment Variables
- ECOBEE_APIKEY
  - API key from ecobee
- ECOBEE_AUTHCODE
  - Authentication code from registered ecobee app
- ECOBEE_DEVICENAME
  - Configured device name of the ecobee sensor
- TANDEM_ENDPOINT
  - Base URL of Tandem ingestion URL (without embedded username:password)
- TANDEM_INGESTION_PASSWORD
  - Password of Tandem ingestion URL (ie. https://:\<password\>@tandem.autodesk.com)
- UPDATEINTERVAL
  - Frequency of requesting from ecobee and updating Tandem in milliseconds
- INIT_REFRESH
  - (Optional) This is not required if you have *never* used your ecobee authcode to generate tokens. Once the ecobee authcode is first used to generate a set of access and refresh tokens, the refresh token cannot be overwriten unless it has expired (one year) or you delete your ecobee app and re-configure a new authcode. If you have followed the example test in the ecobee documentation, you may have already generated a refresh token which can be used here to get access tokens. If you have already generated a refresh token and have lost its value, you must re-configure as new authcode, as you will no longer be able to request access tokens.
