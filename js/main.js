window.addEventListener('keypress', e => e.key === 'Enter' && generateURL())
document.getElementById('search').addEventListener('click', generateURL)
const weatherBlock = document.getElementById('weather-block')

function generateURL(){
    const cityName = document.getElementById('cityName')
    if (cityName.value.length === 0){
        cityName.style.borderColor = 'red'
    } else {
        const city = cityName.value
        const url = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=ua&appid=ade310982514026925929cc901575642`
        fetchWeatherByCityName(url)
    }
}

async function fetchWeatherByCityName(city){
    try{ 
        const response = await fetch(city)
        const data = await response.json()
        console.log(data);

        showWeather(data)

    } catch(error) {
        console.error(error);
    }
}

function showWeather(data){
    weatherBlock.innerHTML = '';

    const headerDiv = document.createElement('div');
    const h1 = document.createElement('h1')
    h1.textContent = `Погода у місті ${data.city.name} на ${new Date().toLocaleDateString()}`
    headerDiv.appendChild(h1)
    weatherBlock.appendChild(headerDiv);

    const days = {}

    data.list.forEach(item => {
        const date = new Date(item.dt_txt)
        const dayKey = date.toLocaleDateString('uk-UA', { day: '2-digit', month: 'long'}) 

        if(!days[dayKey]){
            days[dayKey] = {
                date,
                temps: [],
                icons: []
            }
        }

        days[dayKey].temps.push(item.main.temp)
        days[dayKey].icons.push(item.weather[0].icon)
    });

    const forecastday = Object.values(days).map(day =>{
        const minTemp = Math.min (...day.temps).toFixed(1)
        const maxTemp = Math.max (...day.temps).toFixed(1)
        const weekday = day.date.toLocaleDateString('uk-UA', { weekday: 'long'})
        const dayNum = day.date.getDate();
        const month = day.date.toLocaleDateString('uk-UA', { month: 'long' });
        const icon = day.icons[Math.floor(day.icons.length / 2)];
        return { weekday, dayNum, month, minTemp, maxTemp, icon }
    })

    console.log(forecastday)

    const main = document.createElement('main')

    const div2 = document.createElement('div')
    main.appendChild(div2)

    forecastday.forEach(day => {
        const div3 = document.createElement('div')

        const p1 = document.createElement('p')
        p1.textContent = `${day.weekday}`
        div3.appendChild(p1)

        const p2 = document.createElement('p')
        p2.textContent = `${day.dayNum}`
        div3.appendChild(p2)

        const p3 = document.createElement('p')
        p3.textContent = `${day.month}`
        div3.appendChild(p3)

        const img = document.createElement('img')
        img.src = `${day.icon}`
        div3.appendChild(img)

        const div4 = document.createElement('div')

        const div_temp1 = document.createElement('div')
        div_temp1.textContent = `Мін: ${day.minTemp}°C`
        const div_temp2 = document.createElement('div')
        div_temp2.textContent = `Макс: ${day.maxTemp}°C`

        div4.appendChild(div_temp1)
        div4.appendChild(div_temp2)

        div3.appendChild(div4)

        div2.appendChild(div3)
    })
    weatherBlock.appendChild(main)
}
