if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js ')
    .then( (reg) => console.log('service worker registered', reg))
    .catch( (err) => console.log('service worker not registered', err))
}



//webcam
window.addEventListener('load', () => {
    if( 'mediaDevices' in navigator ) {
        cameraSettings();  
    }
    removeImg()
})

function removeImg() {
    const removethis = document.querySelectorAll(".remove");  
    removethis.forEach((btn) => {
       btn.addEventListener("click", () => {
        btn.parentElement.remove();
       })
})
}

function cameraSettings() {
    const cameraOnButton = document.querySelector('.camera-on');
    const cameraOffButton = document.querySelector('.camera-off')
    const takePictureButton = document.querySelector('#take-picture');
    const toGallery = document.querySelector('#addGallery');
    const download = document.querySelector('#download-photo');
    const deletePic = document.querySelector('#deletePic');
    const errorMessage = document.querySelector('.error-message');
    const newPic = document.querySelector('.newPic');
    const video = document.querySelector('video');

    let stream;
    let facingMode = 'facingMode';

    cameraOnButton.addEventListener('click', async () => {
        errorMessage.innerHTML = '';

        try {
            const md = navigator.mediaDevices;
            stream = await md.getUserMedia({
                video: { width: 320, height: 320, facingMode: facingMode }
            })
            video.srcObject = stream;
            takePictureButton.disabled = false;
            cameraOnButton.classList.add('hidden');
            const videoClass = document.querySelector('#video')
            videoClass.classList.remove('hidden');
            cameraOffButton.classList.remove('hidden');
        } catch (e) {
            errorMessage.innerHTML = 'Please allow the app to access camera'
        }
    })

    takePictureButton.addEventListener('click', async () => {
        errorMessage.innerHTML = '';
        const videoClass = document.querySelector('#video')
            videoClass.classList.add('hidden');
        if( !stream ) {
            errorMessage.innerHTML = 'No video to take photo from.';
            return;
        }

        let tracks = stream.getTracks();
        let videoTrack = tracks[0];
        let capture = new ImageCapture(videoTrack);
        let blob = await capture.takePhoto();

        let imgUrl = URL.createObjectURL(blob);
        newPic.src = imgUrl;
        newPic.classList.remove('hidden');
        toGallery.classList.remove('hidden');
        download.classList.remove('hidden')
        deletePic.classList.remove('hidden');
        document.querySelector('#download-photo').href = imgUrl;
    })
    let date = new Date().toISOString().slice(0,10);
    
    let city = localStorage.getItem('city');
    let country = localStorage.getItem('country');
    const saveButt = document.querySelector('#addGallery')
    const message = document.querySelector('.position');
    saveButt.addEventListener('click', () => {
    const videoClass = document.querySelector('#video')
    videoClass.classList.remove('hidden');
    const gal = document.querySelector('.newGal');
    gal.innerHTML += `
                        <div class="gallery">
                            <img src="${newPic.src}" alt="" />
                            <p class="cityY">City:${city} </p>
                            <p class="countryY">Country: ${country}</p>
                            <p class="timeStamp">Date: ${date}</p>
                            <button class="remove">Delete</button>
                            <a href="${newPic.src}" download class="downloadImg ">Download</a>
                        </div>
 `

 //Download img
    downloadImg = document.querySelector(".downloadImg");
    downloadImg.download = "instablam.jpeg";


//Remove img
    let buttons = document.querySelectorAll(".remove");

      buttons.forEach((btn) =>
        btn.addEventListener("click", async () => {
          btn.parentElement.remove();
        }))
    newPic.src = "";
    toGallery.classList.add('hidden');
    download.classList.add('hidden')
    deletePic.classList.add('hidden');
    message.innerHTML = "";
})

    cameraOffButton.addEventListener('click', async () => {
        errorMessage.innerHTML = '';
        const videoClass = document.querySelector('#video') 
        videoClass.classList.add('hidden');
        if (!stream) {
            errorMessage.innerHTML = 'No video to stop.';
            return;
        }
        let tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        takePictureButton.disabled = true;
        cameraOnButton.classList.remove('hidden');
        cameraOffButton.classList.add('hidden');
    })
}

//Don´t add in gallery
const deletePic = document.querySelector('#deletePic')
deletePic.addEventListener('click', () => {
    const videoClass = document.querySelector('#video')
    videoClass.classList.remove('hidden');
    const newPic = document.querySelector('.newPic');
    const toGallery = document.querySelector('#addGallery');
    const download = document.querySelector('#download-photo');
    const deletePic = document.querySelector('#deletePic');
    const message = document.querySelector('.position');
    imgUrl = "";
    newPic.classList.add('hidden');
    toGallery.classList.add('hidden');
    download.classList.add('hidden')
    deletePic.classList.add('hidden');
    message.innerHTML = "";


})


//geolocation
const takePictureButton = document.querySelector('#take-picture');
takePictureButton.addEventListener('click', () => {
    const message = document.querySelector('.position');
    message.innerHTML = "";

    if( 'geolocation' in navigator ) {
        const geo = navigator.geolocation;
        geo.getCurrentPosition(
            pos => {
                let lat = pos.coords.latitude;
                let lng = pos.coords.longitude;
                getAddressFromPosition(lat, lng, message)
            },
            error => {
                message.innerHTML = 'Please <em>allow</em> position so you can see where picture is taken.';
            }
        )

    } else {
        message.innerHTML = 'This device does not have access to the Geolocation API.';
    }
})

// Reverse geocoding
async function getAddressFromPosition(lat, lng, message) {
    try {
        const response = await fetch(`https://geocode.xyz/${lat},${lng}?json=1`);
        const data = await response.json();

        if( data.error ) {
            message.innerHTML += `<br> Could not get location information at this time. Try again later!`;

        } else {
            message.classList.remove('hidden');
            const city = data.city
            const country = data.country;
            message.innerHTML += `Pic from ${city}, ${country}.`;
            saveAdressInLocalStorage(city, country);
        }

    } catch (e) {
        message.innerHTML += `<br> Could not find your city.`
    }
}

function saveAdressInLocalStorage(city, country) {
    localStorage.setItem('city', city);
    localStorage.setItem('country', country);
}