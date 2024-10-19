import { GoogleGenerativeAI } from "google-generative-ai";
    
      const GEMINI_API_KEY = "AIzaSyDlraluj15r_hugur6iXK5WruXwgz8oD18"; 
      const OPENWEATHER_API_KEY = "f6fcb0138ffc47eda321272b8f5a867d"; 

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
      const chatMessages = document.getElementById('chatMessages');
      const userInput = document.getElementById('userInput');
      const sendButton = document.getElementById('sendButton');
      const typing = document.getElementById('typing');
    
      const weatherIntents = [
        'weather', 'temperature', 'forecast', 'rain', 'snow', 'sunny', 'cloudy',
        'windy', 'humidity', 'precipitation', 'storm', 'climate'
      ];
    
      function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `mb-2 ${isUser ? 'text-right' : 'text-left'}`;
        messageDiv.innerHTML = `<span class="inline-block px-4 py-2 rounded-lg ${isUser ? 'bg-indigo-500 text-white' : 'bg-gray-300'}">${message}</span>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    
      function isWeatherRelated(message) {
        return weatherIntents.some(intent => message.toLowerCase().includes(intent));
      }
    
      async function getCityCoordinates(cityName = 'Islamabad') { 
        const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    
        const response = await fetch(GEOCODING_API_URL);
        if (!response.ok) throw new Error('Failed to fetch city coordinates');
        const data = await response.json();
        if (data.length === 0) throw new Error('City not found');
    
        return data[0];
      }
    
      async function getWeatherData(lat, lon) {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`);
        if (!response.ok) throw new Error('Weather data not available');
        return await response.json();
      }
    
      async function handleUserInput() {
        const userMessage = userInput.value.trim();
        if (userMessage === '') return;
    
        addMessage(userMessage, true);
        userInput.value = '';
        typing.classList.remove('hidden');
    
        let city;
    
        if (isWeatherRelated(userMessage)) {
          // Extract city name or use default
          city = extractCityName(userMessage) || 'Islamabad'; 
    
          try {
            const cityData = await getCityCoordinates(city); // Fetch coordinates for the extracted city or default
            const weatherData = await getWeatherData(cityData.lat, cityData.lon);
    
            const prompt = `
              Based on the following weather data:
              City: ${weatherData.name}, ${cityData.state ? cityData.state + ', ' : ''}${cityData.country}
              Temperature: ${weatherData.main.temp}°C
              Weather: ${weatherData.weather[0].description}
              Humidity: ${weatherData.main.humidity}%
              Wind Speed: ${weatherData.wind.speed} m/s
    
              Provide a concise and friendly response to the user's query: "${userMessage}"
            `;
    
            const result = await model.generateContent(prompt);
            const botResponse = result.response.text();
            addMessage(botResponse);
          } catch (error) {
            addMessage(error.message);
          }
        } else {
          addMessage("I am currently able to answer weather-related queries only.");
        }
    
        typing.classList.add('hidden');
      }
    
      function extractCityName(message) {
        const cityMatch = message.match(/in\s+([a-zA-Z\s]+)/i);
        return cityMatch ? cityMatch[1].trim() : null;
      }
    
      sendButton.addEventListener('click', handleUserInput);
      userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserInput();
      });