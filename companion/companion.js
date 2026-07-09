/*
const companionHTML = `
    <div id="companion-container">
        <div id="speech-bubble"></div>
        <img id="companion" alt="UniVerse Companion">
    </div>
`;
document.body.insertAdjacentHTML( "beforeend" , companionHTML);


const container = document.getElementById("companion-container");
const companion = document.getElementById("companion");
const bubble = document.getElementById("speech-bubble");

const currentCompanion = {
    name: "Kal",
    images: {
        idle: "../images/kal/kal_idle.png",
        wave: "../images/kal/kal_wave.png"
    },
    greetings: {
        home: "Hi! I'm Kal 👋",
        stores: "Let's explore some stores!",
        //products: "Looking for something today?",
        //profile: "Welcome back to your profile."
    },
    idleMessages: {
        default: [
            "Hello!",
            "Need any help?",
            "I'm here if you need me."
        ],
        home: [
            "👋 Welcome back!",
            "Today's featured products are worth checking out.",
            "Have you explored the categories yet?",
            "Lots of student businesses have added new products recently.",
            "Looking for something specific?"
        ],
        stores: [
            "Premium stores get featured more often.",
            "Some stores are verified. Look for the badge!",
            "Click a store to explore all its products.",
            "You can search for stores by university."
        ],
    }
};

let currentState = "idle";
let currentRight = -200; //starting position
const targetRight = 20; //final destination

function detectCurrentPage() {
    return document.body.dataset.page || "home";
}
const currentPage = detectCurrentPage();
const greeting = currentCompanion.greetings[currentPage] || "Hello!";

//expression setting function
function setExpression(expression) {
    companion.src = currentCompanion.images[expression];
}

//sets the state of what the agent is at the moment
function setState(state){
    currentState = state;
}

//generate random idle message from the list of messages
function getRandomIdleMessage() {
    const messages = currentCompanion.idleMessages[currentPage] || currentCompanion.idleMessages.default;
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
}

//waving image preloading
const waveImage = new Image();
waveImage.src = currentCompanion.images.wave;
let hasWaved = false;

function moveCompanion() {  //moving function
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
    if (currentState === "waving") {
        return;
    }
    setState("waving");
    setExpression("wave");
    speak(greeting);
    setTimeout(() => {
        setState("idle");
        setExpression("idle");
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

//more like the brain function
function initializeCompanion() {
    setState('moving')
    moveCompanion();
    setExpression("idle");
}

initializeCompanion();

console.log(getRandomIdleMessage());

*/