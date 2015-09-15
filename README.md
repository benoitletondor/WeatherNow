# WeatherNow - Android ReactNative experiment

### Concept

This is a little experiment with ReactNative for Android. The app is really simple: 

- It fetches the current location (but not really since Geolocation is not available on Android yet)
- Georeverses it to get a place name via Google APIs
- Get the weather for that place via Yahoo! Weather API
- Fetches Flickr images about this place to display a background.

![Screenshot](https://dl.dropboxusercontent.com/u/14316834/screenshotWeatherNow.png)

### How to build

This is a classic ReactNative Android project, so simply follow Facebook's intructions: [ReactNative getting started](https://facebook.github.io/react-native/docs/getting-started.html)