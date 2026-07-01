const container = document.getElementById("companion-container");
const companion = document.getElementById("companion");
const bubble = document.getElementById("speech-bubble");

const currentCompanion = {
    name: "Kal",
    images: {
        idle: "../images/kal/kal_idle.png",
        wave: "../images/kal/kal_wave.png"
    },
    greeting: "Hi! I'm Kal 👋"
};
let currentRight = -200; //starting position
const targetRight = 20; //final destination

//waving image preloading
const waveImage = new Image();
waveImage.src = currentCompanion.images.wave;
let hasWaved = false;

function moveCompanion() {  //moving function
    companion.src = currentCompanion.images.idle;
    if (currentRight < targetRight) {
        currentRight += 2;
        container.style.right = currentRight + "px";
        requestAnimationFrame(moveCompanion);
    }
    else if (!hasWaved) {
        hasWaved = true;
        wave();
    }
}

function wave(){ //waving function
    companion.src = currentCompanion.images.wave;
    console.log("Wave started");
    speak(currentCompanion.greeting);
    setTimeout(() => {
        console.log("Back to idle");
        companion.src = currentCompanion.images.idle;
    }, 2000);
}

function speak(message){  //speech bubble function
    bubble.textContent = message;
    bubble.style.opacity = "1";
    bubble.style.transform = "translateY(0)";
    setTimeout(()=>{
        bubble.style.opacity = "0";
        bubble.style.transform = "translateY(10px)"; 
    },4000);
}

moveCompanion();