let store = {
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
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
        <header>${roverMenu(rovers)}</header>
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
    const now = Date.now();

    let yesterday = new Date(now - 24 * 3600 * 1000)
    yesterday = `${yesterday.getFullYear()}-${yesterday.getMonth()+1}-${yesterday.getDate()}`

    if (!apod || apod.image.code === 404) {
        getImageOfTheDay(store, yesterday)
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
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state, date='today') => {
    let { apod } = state

    fetch(`http://localhost:3000/apod/${date}`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))
}
