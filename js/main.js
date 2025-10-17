window.addEventListener('load', getLocation)
window.addEventListener('keypress', e => e.key === 'Enter' && generateURL())
document.getElementById('search').addEventListener('click', generateURL)
const weatherBlock = document.getElementById('weather-block')

function getLocation() {
    if (!navigator.geolocation) {
        alert('Ваш браузер не підтримує геолокацію')
        return
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            const { latitude, longitude } = pos.coords
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=ua&appid=ade310982514026925929cc901575642`
            fetchWeatherByCityName(url)
        },
        err => {
            console.warn(`Помилка геолокації (${err.code}): ${err.message}`)
            const defaultCity = 'Kyiv'
            const url = `https://api.openweathermap.org/data/2.5/forecast?q=${defaultCity}&units=metric&lang=ua&appid=ade310982514026925929cc901575642`
            fetchWeatherByCityName(url)
        }
    )
}

function generateURL(){
    const cityName = document.getElementById('cityName')
    
    if (cityName.value.trim().length === 0){
        cityName.classList.add('input-error')

        setTimeout(() => cityName.classList.remove('input-error'), 300)
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
    h1.classList.add('text-white', 'text-3xl', 'font-bold', 'text-center', 'm-10')

    const h1_p = document.createElement('p')
    h1_p.textContent = ` Схід сонця о ${new Date(data.city.sunrise * 1000).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}. Захід сонця о ${new Date(data.city.sunset * 1000).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}.`
    h1.appendChild(h1_p)

    headerDiv.appendChild(h1)
    weatherBlock.appendChild(headerDiv);

    const days = {}

    data.list.forEach(item => {
        const date = new Date(item.dt_txt)
        const dayKey = date.toLocaleDateString('uk-UA', { day: '2-digit', month: 'long'}) 
        const hour = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })

        if(!days[dayKey]){
            days[dayKey] = {
                date,
                sunrise: new Date(data.city.sunrise * 1000),
                sunset: new Date(data.city.sunset * 1000),
                temps: [],
                icons: [],
                details: []
            }
        }

        days[dayKey].temps.push(item.main.temp)
        days[dayKey].icons.push(item.weather[0].icon)
        days[dayKey].details.push({
            time: hour,
            humidity: item.main.humidity,
            pressure: item.main.pressure,
            tempFeels: item.main.feels_like.toFixed(1),
            temp: item.main.temp.toFixed(1),
            description: item.weather[0].description,
            icon: item.weather[0].icon
        })
    });

    console.log(days);
    

    const forecastday = Object.values(days).map(day =>{
        const minTemp = Math.min (...day.temps).toFixed(1)
        const maxTemp = Math.max (...day.temps).toFixed(1)
        let weekday = day.date.toLocaleDateString('uk-UA', { weekday: 'long'})
        const dayNum = day.date.getDate();
        let month = day.date.toLocaleDateString('uk-UA', { month: 'long' });
        const icon = day.icons[Math.floor(day.icons.length / 2)];
        weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
        month = month.charAt(0).toUpperCase() + month.slice(1)
        const sunrise = day.sunrise
        const sunset = day.sunset
        return { weekday, dayNum, month, minTemp, maxTemp, icon, details: day.details, sunrise, sunset }    
    })

    console.log(forecastday)

    const main = document.createElement('main')

    const div2 = document.createElement('div')
    div2.classList.add('flex', 'flex-row', 'justify-evenly')
    main.appendChild(div2)

    forecastday.forEach(day => {
        const div3 = document.createElement('div')
        div3.classList.add('flex-col', 'flex', 'items-center', 'text-white', 'text-xl', 'font-semibold', 'rounded-xl', 'bg-blue-200/50', 'w-65', 'gap-2', 'p-3', 'cursor-pointer', 'mx-3')

        const p1 = document.createElement('p')
        p1.textContent = `${day.weekday}`
        div3.appendChild(p1)

        const p2 = document.createElement('p')
        p2.textContent = `${day.dayNum}`
        div3.appendChild(p2)

        const p3 = document.createElement('p')
        p3.textContent = `${day.month}`
        div3.appendChild(p3)

        div3.addEventListener('click', () => showDetails(day))

        const img = document.createElement('img')
        img.src = `https://openweathermap.org/img/wn/${day.icon}@2x.png`
        div3.appendChild(img)

        const div4 = document.createElement('div')
        div4.classList.add('flex-col', 'flex', 'items-center')

        const div_temp1 = document.createElement('div')
        div_temp1.textContent = `Мін: ${day.minTemp}°C`
        const div_temp2 = document.createElement('div')
        div_temp2.textContent = `Макс: ${day.maxTemp}°C`

        div4.appendChild(div_temp2)
        div4.appendChild(div_temp1)

        div3.appendChild(div4)

        div2.appendChild(div3)
    })
    weatherBlock.appendChild(main)
}

function showDetails(day){
    const oldDetails = document.getElementById('details-block');
    if (oldDetails) oldDetails.remove()

    const detailsBlock = document.createElement('div')
    detailsBlock.id = 'details-block'
    detailsBlock.classList.add('bg-blue-300/50', 'mx-3', 'rounded-xl', 'm-5', 'mx-9')

    const title = document.createElement('h2')
    title.textContent = `Огляд на ${day.weekday}, ${day.dayNum} ${day.month}`
    title.classList.add('text-2xl', 'font-bold', 'text-white', 'p-3', 'text-xl')
    detailsBlock.appendChild(title)

    const renderDetails = document.createElement('div')
    renderDetails.classList.add('flex', 'flex-row', 'justify-evenly', 'mb-5', 'text-white', 'font-medium', 'rounded-xl', 'bg-blue-200/50', 'flex-wrap', 'items-center')
    detailsBlock.appendChild(renderDetails)
    day.details.forEach(detail => {

        const detailDiv = document.createElement('div')
        detailDiv.classList.add('flex', 'flex-col', 'items-center', 'rounded-lg', 'cursor-pointer', 'hover:shadow-xl/20', 'transition-all', 'duration-200', 'text-lg', 'm-3', 'p-2')

        const time = document.createElement('p')
        time.textContent = `${detail.time}`
        detailDiv.appendChild(time)

        const temp = document.createElement('p')
        temp.textContent = `Температура: ${detail.temp}°C`
        detailDiv.appendChild(temp)

        const tempFeels = document.createElement('p')
        tempFeels.textContent = `Відчувається як: ${detail.tempFeels}°C`
        detailDiv.appendChild(tempFeels)        

        const pressure = document.createElement('p')
        pressure.textContent = `Тиск: ${detail.pressure} hPa`
        detailDiv.appendChild(pressure)

        const humidity = document.createElement('p')
        humidity.textContent = `Вологість: ${detail.humidity}%`
        detailDiv.appendChild(humidity)

        const icon = document.createElement('img')
        icon.src = `https://openweathermap.org/img/wn/${detail.icon}@2x.png`
        detailDiv.appendChild(icon)

        const description = document.createElement('p')
        description.textContent = `${detail.description.charAt(0).toUpperCase() + detail.description.slice(1)}`
        detailDiv.appendChild(description)
    
        renderDetails.appendChild(detailDiv)
    })

    weatherBlock.appendChild(detailsBlock)
}