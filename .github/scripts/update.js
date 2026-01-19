const fs = require("fs")

const city = "Lalitpur"
const apiKey = process.env.WEATHER_API_KEY

async function getWeather() {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
  const res = await fetch(url)
  const data = await res.json()

  const desc = data.weather[0].description
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return { desc, temp: Math.round(data.main.temp) }
}

function getClockEmoji(hour) {
  if (hour >= 5 && hour < 10) return "🌅"
  if (hour >= 10 && hour < 17) return "🌞"
  if (hour >= 17 && hour < 20) return "🌆"
  return "🌑"
}

function getWeatherEmoji(desc) {
  desc = desc.toLowerCase()
  if (desc.includes("cloud")) return "☁️"
  if (desc.includes("rain")) return "🌧️"
  if (desc.includes("clear")) return "☀️"
  if (desc.includes("snow")) return "❄️"
  if (desc.includes("thunder")) return "⛈️"
  return "🌍"
}

function getBars(hour) {
  if (hour >= 6 && hour < 10) return { coffee: "☕: ██░░░░░░░ 20%", code: "💻: █░░░░░░░░ 10%" }
  if (hour >= 10 && hour < 14) return { coffee: "☕: █████░░░░ 60%", code: "💻: ███████░░ 80%" }
  if (hour >= 14 && hour < 20) return { coffee: "☕: █████████ 100%", code: "💻: ████████░ 90%" }
  return { coffee: "☕: ████░░░░░░ 40%", code: "💻: █████░░░░░ 50%" }
}

const moods = {
  morning: ["sleepy", "energetic", "relaxed", "focused", "lazy"],
  afternoon: ["productive", "caffeinated", "tired", "creative", "coding"],
  evening: ["relaxing", "refactoring", "binge-coding", "chilling", "planning"],
  night: ["sleepy", "hacking", "reading", "debugging", "thinking", "gaming"]
}

const weatherMood = {
  cloudy: ["cozy", "motivated", "lazy", "chilled", "inspired"],
  rain: ["deep coding", "listening to music", "lazy but inspired", "writing ideas", "slow coding"],
  clear: ["motivated", "productive", "focused", "energetic", "adventurous"],
  snow: ["cozy coding", "chilled", "relaxed", "happy", "thinking"],
  hot: ["sweating but productive", "taking breaks", "slow but thinking", "caffeinated and alert", "relaxing"],
  cold: ["cozy coding", "slow and careful", "warm and focused", "sleepy", "inspired"]
}

const coffeeEffect = ["hyper-focused", "relaxed", "jittery", "slow", "motivated"]

const codeStyle = ["hacking", "debugging", "refactoring", "brainstorming", "experimenting"]

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getTimeOfDay(hour) {
  if (hour < 10) return "morning"
  if (hour < 17) return "afternoon"
  if (hour < 22) return "evening"
  return "night"
}

function getWeatherCategory(desc, temp) {
  desc = desc.toLowerCase()
  if (desc.includes("cloud")) return "cloudy"
  if (desc.includes("rain")) return "rain"
  if (desc.includes("snow")) return "snow"
  if (desc.includes("clear")) return "clear"
  if (temp >= 30) return "hot"
  if (temp <= 10) return "cold"
  return "clear"
}

function getDynamicMood(hour, desc, temp) {
  const timeOfDay = getTimeOfDay(hour)
  const weatherCat = getWeatherCategory(desc, temp)

  const options = {
    timeMood: moods[timeOfDay],
    weatherMood: weatherMood[weatherCat],
    coffee: coffeeEffect,
    code: codeStyle
  }

  const keys = Object.keys(options)
  const shuffledKeys = keys.sort(() => 0.5 - Math.random())
  const selectedKeys = shuffledKeys.slice(0, 2)

  const chosen = selectedKeys.map((key) => getRandom(options[key]))

  return `🤔 Hmm, I am probably ${chosen.join(", ")}`
}

function getTip(hour, weather, temp) {
  if (hour < 10) return "💡 Morning tip: Start light, code heavy ☕"
  if (hour >= 10 && hour < 17) {
    if (temp > 30) return "💡 It's hot! Stay hydrated while coding 💧"
    if (weather.includes("rain")) return "💡 Rainy mood = perfect time for deep coding 🌧️"
    return "💡 Afternoon grind: keep pushing commits 🚀"
  }
  if (hour >= 17 && hour < 22) return "💡 Evening tip: Refactor before you relax 🌆"
  return "💡 Night owl mode: Comment your code for tomorrow’s you 🌙"
}

const replace = (readme, startMarker, endMarker, val) => {
  return readme.replace(new RegExp(`(<!--${startMarker}-->)([\\s\\S]*?)(<!--${endMarker}-->)`), `<!--${startMarker}-->${val}<!--${endMarker}-->`)
}

;(async () => {
  let readme = fs.readFileSync("README.md", "utf-8")

  const now = new Date()
  const hour = now.getHours()
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kathmandu" })
  const clockEmoji = getClockEmoji(hour)

  const { desc, temp } = await getWeather()
  const { coffee, code } = getBars(hour)

  const tip = getTip(hour, desc.toLowerCase(), temp)
  const mood = getDynamicMood(hour, desc.toLowerCase(), temp)
  const weatherEmoji = getWeatherEmoji(desc)

  const header = `${clockEmoji} ${time}, ${weatherEmoji} ${desc}, 🌡 ${temp}°C`

  readme = replace(readme, "START_CODE", "END_CODE", code)
  readme = replace(readme, "START_HEADER", "END_START_HEADER", header)
  readme = replace(readme, "START_MOOD", "END_MOOD", mood)
  readme = replace(readme, "START_COFFEE", "END_COFFEE", coffee)
  readme = replace(readme, "START_TIP", "END_TIP", tip)

  fs.writeFileSync("README.md", readme)
})()
