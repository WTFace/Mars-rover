let store = {
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    date: ''
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    let { rovers, apod } = state

    return `
        <header><h1>Astronomy Picture of the Day</h1></header>
        <main>
            <section>                
                ${ImageOfTheDay(apod)}
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    const today = new Date().toLocaleDateString().split('/')
    store.date = `${today[2]}-${today[1]}-${today[0]}`

    render(root, store)
})

// ------------------------------------------------------  COMPONENTS
const roverMenu = (rovers) => {
    let elem = '';
    for(const r of rovers){
        elem += `<button class="">${r}</button>`
    }
    return elem
}


// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
    // If image does not already exist, or it is not from today -- request it again
    !apod && getImageOfTheDay(store);
    
    if (apod.image.code === 404 || apod.image.code === 400) {
        const now = Date.now();
        let yesterday = new Date(now - 24 * 3600 * 1000)
        yesterday = `${yesterday.getFullYear()}-${yesterday.getMonth()+1}-${yesterday.getDate()}`
        getImageOfTheDay(store, yesterday);
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <h3>${apod.image.title}</h3>
            <img src="${apod.image.url}" height="350px" width="100%" />
        `)
    }
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state, yesterday) => {
    const date = yesterday ? yesterday : state.date;

    fetch(`http://localhost:3000/apod/${date}`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))
}
