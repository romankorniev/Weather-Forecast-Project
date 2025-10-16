window.addEventListener('keypress', e => e.key === 'Enter' && generateURL())
document.getElementById('search').addEventListener('click', generateURL)
const weatherBlock = document.getElementById('weather-block')

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
    let weekday = day.date.toLocaleDateString('uk-UA', { weekday: 'long'})
    const dayNum = day.date.getDate();
    let month = day.date.toLocaleDateString('uk-UA', { month: 'long' });
    const icon = day.icons[Math.floor(day.icons.length / 2)];
    weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
    month = month.charAt(0).toUpperCase() + month.slice(1)
    return { weekday, dayNum, month, minTemp, maxTemp, icon }    
    })

    console.log(forecastday)

    const main = document.createElement('main')

    const div2 = document.createElement('div')
    div2.classList.add('flex', 'flex-row', 'justify-evenly')
    main.appendChild(div2)

    forecastday.forEach(day => {
        const div3 = document.createElement('div')
        div3.classList.add('flex-col', 'flex', 'items-center', 'text-white', 'text-xl', 'font-semibold', 'rounded-xl', 'bg-blue-200/50', 'w-65', 'gap-10', 'p-3', 'cursor-pointer')

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

        div3.addEventListener('click', (e) => {
        console.log(e.target)
    })
    })

    weatherBlock.appendChild(main)
}
