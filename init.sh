
[ -d "node_modules/" ] || time npm install --verbose

cd cola

../node_modules/cordova/bin/cordova platform add android

../node_modules/cordova/bin/cordova plugin add cordova-plugin-geolocation

cd ..
