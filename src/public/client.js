let store = {
    apod: '',
    date: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    selectedRover: 'Curiosity',
    manifest: {},
    roverPhotos: {}
}

const head = document.getElementById('head')
const info = document.getElementById('info')
const photos = document.getElementById('photos')

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

const RoverInfo = (state) =>{
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
const RecentPhotos = (state) => {
    const {roverPhotos, selectedRover} = state;
    !roverPhotos.hasOwnProperty(selectedRover) && getRecentPhotos(state, selectedRover);

    const _roverPhotos = roverPhotos[selectedRover];

    let elem = '<div class="mission-manifest">';
    for(const photo of _roverPhotos){
        elem += `<div><h3>camera: ${photo.camera.full_name}</h3><img src="${photo.img_src}" alt="mars photo"></div>`;
    }
    return elem + '</div>';
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

const selectRover = (rover) => {
    const selectedRover = rover;
    updateStore(store, {selectedRover});
    render(info, roverMenu)
    getManifest(store, rover);
}

const getManifest = (state, rover) => {
    let { manifest } = state;
    if (!manifest.hasOwnProperty(rover)) {
        fetch(`http://localhost:3000/manifest/${rover.toLowerCase()}`)
        .then(res => res.json())
        .then(res => {
            manifest[rover] = res;
            updateStore(store, {manifest});
            render(info, RoverInfo);
            getRecentPhotos(store, rover);
        })
    }else{
        render(info, RoverInfo);
        getRecentPhotos(store, rover);
    }
}
const getRecentPhotos = (state, rover) => {
    let { roverPhotos, manifest } = state;
    const max_sol = manifest[rover].max_sol;

    if (!roverPhotos.hasOwnProperty(rover)) {
        fetch(`http://localhost:3000/photos/${rover.toLowerCase()}/${max_sol}`)
        .then(res => res.json())
        .then(res => {
            roverPhotos[rover] = res;
            updateStore(store, {roverPhotos});
            render(photos, RecentPhotos);
        })
    }else{
        render(photos, RecentPhotos);
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
