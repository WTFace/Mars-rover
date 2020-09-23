let store = {
    apod: '',
    date: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    selectedRover: 'Curiosity',
    manifest: {},
}

const head = document.getElementById('head')
const info = document.getElementById('info')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
}
const render = async (dom, component) => {
    dom.innerHTML = App(component)
}
const App = (component) => {
    return component(store)
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    const today = new Date().toLocaleDateString().split('/')
    store.date = `${today[2]}-${today[1]}-${today[0]}`
    render(head, ImageOfTheDay);
    render(info, roverMenu);
})

// ------------------------------------------------------  COMPONENTS
const roverMenu = (state) => {
    let elem = '';
    const {selectedRover, rovers} = state;

    for(const r of rovers){
        let cls = '';
        if (selectedRover === r) cls = 'active';
        elem += `<button class="${cls}" onclick="selectRover('${r}')">${r}</button>`
    }
    return elem
}

const selectRover = (rover) => {
    const selectedRover = rover;
    updateStore(store, {selectedRover});
    render(info, roverMenu)
    getManifest(store, rover);
}
const roverInfo = (state) =>{
    const {manifest, selectedRover} = state;
    !manifest.hasOwnProperty(selectedRover) && getManifest(state, selectedRover);
    const _manifest = manifest[selectedRover];

    let elem = roverMenu(state);
    elem += `<div class="mission-manifest">
        <div>name: ${_manifest.name}</div>
        <div>launch date: ${_manifest.launch_date}</div>
        <div>landing date: ${_manifest.landing_date}</div>
        <div>last Earth date: ${_manifest.max_date}</div>
        <div>last Martian sol: ${_manifest.max_sol}</div>
        <div>mission status: ${_manifest.status}</div>
    </div>`;
    return elem;
}

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
    return `<h2>Astronomy Picture of the Day</h2>
            ${apodSection}`
}

// ------------------------------------------------------  API CALLS
const getManifest = (state, rover) => {
    let { manifest } = state;
    if (!manifest.hasOwnProperty(rover)) {
        fetch(`http://localhost:3000/manifest/${rover.toLowerCase()}`)
        .then(res => res.json())
        .then(res => {
            manifest[rover] = res;
            updateStore(store, {manifest});
            render(info, roverInfo);
        })
    }else{
        render(info, roverInfo);
    }
}

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
