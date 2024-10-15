import { useEffect, useState } from 'react';
import './styles.css';

export const WeatherApp = ({
  // Number of hours to be shown in table
  numOfHours = 12
}) => {
  // State management to track weather data
  const [weatherData, setWeatherData] = useState([]);

  // State management to track the possible error to get image list
  const [errorMsg, setErrorMsg] = useState('');

  // State management to track the loading state to get image list
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getWeatherData = async () => {
      try {
        setIsLoading(true);

        // Get the browser's current geolocation
        navigator.geolocation.getCurrentPosition(async (position) => {
          // Make a GET request to https://api.weather.gov/points/{lat},{lon}, with the desired coordinate
          const metadata = await fetch(`https://api.weather.gov/points/${position.coords.latitude},${position.coords.longitude}`);
          const metadataContent = await metadata.json();

          // Make a GET request to retrieve the hourly forecast
          const forecast = await fetch(metadataContent.properties.forecastHourly);
          const forecastContent = await forecast.json();

          // Keep the specified rows of data
          setWeatherData(forecastContent.properties.periods.slice(0, numOfHours));
        });
      } catch (e) {
        setErrorMsg(e.message)
      } finally {
        setIsLoading(false);
      }
    }

    getWeatherData();
  }, [numOfHours]);

  // Show loading state
  if (isLoading || weatherData.length === 0) {
    return <div className="container">Loading...</div>;
  }

  // Show error state
  if (errorMsg) {
    return <div className="container">Error to fetch weather data: {errorMsg}</div>;
  }

  return (
    <div className="container">
      {/* Header information */}
      <h2 className="title">Hourly Weather</h2>
      <h3 className="title">{new Date(weatherData[0].startTime).toLocaleDateString()}</h3>

      {/* Hourly weather table */}
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Temperature</th>
            <th>Diurnal Cycle</th>
            <th>Wind Direction</th>
            <th>Wind Speed</th>
          </tr>
        </thead>
        <tbody>
          {weatherData.map((item) => {
            const time = new Date(item.startTime);
            const hour = `0${time.getHours()}`.slice(-2);
            const minute = `0${time.getMinutes()}`.slice(-2);
            return (
              <tr key={item.startTime}>
                <td>{`${hour}:${minute}`}</td>
                <td>{`${item.temperature}${item.temperatureUnit}`}</td>
                <td><img src={item.icon} width="20px" height="20px" alt="Diurnal cycle icon" /></td>
                <td>{`${item.windDirection}`}</td>
                <td>{`${item.windSpeed}`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}