# ip_location_logger
Simple Node.js application that logs IP address and geolocation of clients and displays locations on a map.
This application is designed to use minimal dependencies and no client or server side frameworks. Uses MySQL to store visitors' IP
addresses and locations

Setup Instructions:

1) Install dependencies:

      npm install

2) Edit settings in config.js

3) Generate tables

      node mysql-createdb

4) Run server

      node server

5) Navigate to https://server_address:port
