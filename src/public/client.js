let store = {
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    date: ''
}

const head = document.getElementById('head')
// const rover = document.getElementById('rover')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
}

const render = async (dom, component) => {
    dom.innerHTML = App(component)
}


// create content
const App = (component) => {
    return component(store)
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    const today = new Date().toLocaleDateString().split('/')
    store.date = `${today[2]}-${today[1]}-${today[0]}`
    render(head, ImageOfTheDay)
})

// ------------------------------------------------------  COMPONENTS
// const roverMenu = (rovers) => {
//     let elem = '';
//     for(const r of rovers){
//         elem += `<button class="">${r}</button>`
//     }
//     return elem
// }


// Example of a pure function
const ImageOfTheDay = (state) => {
    const {apod} = state
    !apod && getImageOfTheDay(state);
    
    if (apod.image.code === 404 || apod.image.code === 400) {
        const now = Date.now();
        let yesterday = new Date(now - 24 * 3600 * 1000)
        yesterday = `${yesterday.getFullYear()}-${yesterday.getMonth()+1}-${yesterday.getDate()}`
        getImageOfTheDay(state, yesterday);
    }

    let apodSection = ''
    if (apod.media_type === "video") {
        apodSection =
        `
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `
    } else {
        apodSection = 
        `
            <h3>${apod.image.title}</h3>
            <img src="${apod.image.url}" height="350px" width="100%" />
        `
    }
    return `
        <section>
            <h2>Astronomy Picture of the Day</h2>
            ${apodSection}
        </section>
    `
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state, yesterday) => {
    const date = yesterday ? yesterday : state.date;

    fetch(`http://localhost:3000/apod/${date}`)
        .then(res => res.json())
        .then(apod => {
            updateStore(store, { apod });
            render(head, ImageOfTheDay)
        })
}
