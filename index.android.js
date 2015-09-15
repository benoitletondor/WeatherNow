'use strict';

// A mapping of Yahoo's Weather API code to icons
var WEATHER_ICONS = [
  "clouds_with_2lighting", // tornado
  "clouds_with_lighting_littlerain", // tropical storm
  "clouds_with_2lighting", // hurricane
  "clouds_with_2lighting", // severe thunderstorms
  "clouds_with_2lighting", // thunderstorms
  "clouds_with_littlesnow", // mixed rain and snow
  "clouds_with_littlesnow", // mixed rain and sleet
  "clouds_with_littlesnow", // mixed snow and sleet
  "clouds_with_littlerain", // freezing drizzle
  "clouds_with_littlerain", // drizzle
  "clouds_with_littlerain", // freezing rain
  "clouds_with_rain", // showers
  "clouds_with_rain", // showers
  "clouds_with_littlesnow", // snow flurries
  "clouds_with_littlesnow", // light snow showers
  "clouds_with_snow", // blowing snow
  "clouds_with_snow", // snow
  "clouds_with_snow", // hail
  "clouds_with_snow", // sleet
  "sun_haze", // dust
  "sun_haze", // foggy
  "sun_haze", // haze
  "sun_haze", // smoky
  "sun_windy", // blustery
  "sun_windy", // windy
  "sun_windy", // cold
  "sun_with_1cloud", // cloudy
  "moon_with_clouds", // mostly cloudy (night)
  "sun_with_3clouds", // mostly cloudy (day)
  "moon_with_clouds", // partly cloudy (night)
  "clouds", // partly cloudy (day)
  "moon", // clear (night)
  "sun", // sunny
  "moon", // fair (night)
  "sun", // fair (day)
  "sun_rain_snow", // mixed rain and hail
  "sun", // hot
  "sun_with_2cloud_littlerain", // isolated thunderstorms
  "sun_with_2cloud_rain", // scattered thunderstorms
  "sun_with_2cloud_rain", // scattered thunderstorms
  "sun_with_2cloud_rain", // scattered showers
  "clouds_with_snow", // heavy snow
  "sun_with_clouds_littlesnow", // scattered snow showers
  "sun_with_clouds_snow", // heavy snow
  "sun_with_1cloud", // partly cloudy
  "clouds_with_lighting_rain", // thundershowers
  "sun_with_clouds_snow", // snow showers
  "clouds_with_lighting", // isolated thundershowers
];
var GOOGLE_REVERSE_GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=[LAT],[LONG]&result_type=locality&key=AIzaSyDBgtbuu44jLdWyxP4BLecHg-LQKTe_MO0";
var YAHOO_WEATHER_API_URL = "https://query.yahooapis.com/v1/public/yql?q=select%20item.condition%20from%20weather.forecast%20where%20woeid%20IN%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22[PLACE]%22)&format=json";
var FLICKR_API_URL = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=62b0d3557b84973209eb5c77c679b916&lat=[LAT]&lon=[LONG]&tags=[PLACE]&format=json";

var React = require('react-native');
var TimerMixin = require('react-timer-mixin');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ToastAndroid,
} = React;

var WeatherNow = React.createClass({
  mixins: [TimerMixin],

  render: function() {
    if (!this.state.geoloc) {
      return (
        <View style={styles.container}>
          <Text style={styles.welcome}>Fetching location...</Text>
        </View>
      );
    }

    if (!this.state.condition) {
      return (
        <View style={styles.container}>
          <Text style={styles.welcome}>Fetching weather for {this.state.locality}...</Text>
        </View>
      );
    }

    if (!this.state.images) {
      return (
        <View style={styles.container}>
          <View style={styles.weatherContainer}>
            <Image style={styles.icon} source={{ uri: WEATHER_ICONS[parseInt(this.state.condition.code)] }} />
            <Text style={styles.welcome}>{this.state.locality}</Text>
            <Text style={styles.instructions}>{this.state.condition.text}</Text>
          </View>
        </View>
      );
    }

    return (
      <Image style={styles.background} source={{uri : this.state.images[Math.floor(Math.random() * this.state.images.length)]}}>
        <View style={styles.weatherContainer}>
          <Image style={styles.icon} source={{ uri: WEATHER_ICONS[parseInt(this.state.condition.code)] }} />
          <Text style={styles.welcome}>{this.state.locality}</Text>
          <Text style={styles.instructions}>{this.state.condition.text}</Text>
        </View>
      </Image>
    );
  },

  getInitialState: function() {
    return {
      geoloc: null,
      locality: null,
      condition: null,
      images: null,
    };
  },

  componentDidMount: function() {
    this.fetchLocation();
  },

  fetchLocation: function() {
    // Geolocation on Android is coming in the future.. Forcing to Lyon, France.
    this.setTimeout(() => {
      this.setState({
        geoloc: {latitude: 45.767, longitude: 4.833},
        locality: null,
        condition: null,
        images: null,
      });

      this.reverseGeocode();
    }, 1000);

    /*navigator.geolocation.getCurrentPosition(
      (initialPosition) => {
        this.setState({
          geoloc: initialPosition,
          locality: null,
          condition: null,
          images: null,
        });
      }),
      (error) => alert(error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );*/
  },

  reverseGeocode : function() {
    fetch(GOOGLE_REVERSE_GEOCODING_URL.replace("[LAT]", this.state.geoloc.latitude).replace("[LONG]", this.state.geoloc.longitude))
      .then((response) => response.json())
      .then((responseData) => this.setState({
        geoloc: this.state.geoloc,
        locality: responseData.results[0].formatted_address,
        condition: null,
        images: null,
      }))
      .then(() => this.fetchWeather())
      .done();
  },

  fetchWeather: function() {
    fetch(YAHOO_WEATHER_API_URL.replace("[PLACE]", encodeURIComponent(this.state.locality)))
      .then((response) => response.json())
      .then((responseData) => this.setState({
        geoloc: this.state.geoloc,
        locality: this.state.locality,
        condition: responseData.query.results.channel.item.condition,
        images: null,
      }))
      .then(() => this.fetchImages())
      .done();
  },

  fetchImages: function() {
    fetch(FLICKR_API_URL.replace("[LAT]", this.state.geoloc.latitude).replace("[LONG]", this.state.geoloc.longitude).replace("[PLACE]", encodeURIComponent(this.state.locality)))
      .then((response) => response.text())
      .then((responseText) => {return responseText.substring(14,responseText.length-1)}) // Remove the "jsonFlickrApi()" around the real JSON
      .then((responseSubstr) => {return JSON.parse(responseSubstr)})
      .then((responseJson) => {
        var photos = [];
        for (var i = 0; i < responseJson.photos.photo.length; i++) {
          var photoObj = responseJson.photos.photo[i];

          photos[i] = "https://farm"+photoObj.farm+".staticflickr.com/"+photoObj.server+"/"+photoObj.id+"_"+photoObj.secret+".jpg"
        }
        return photos
      })
      .then((photos) => this.setState({
        geoloc: this.state.geoloc,
        locality: this.state.locality,
        condition: this.state.condition,
        images: photos,
      }))
      .done();
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  icon : {
    width: 50,
    height: 50,
  },
  background : {
    flex: 1,
    resizeMode: 'cover', // or 'stretch'
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  weatherContainer : {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding : 20,
  },
});

AppRegistry.registerComponent('WeatherNow', () => WeatherNow);
