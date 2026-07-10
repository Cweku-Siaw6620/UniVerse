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
let lastIdleMessage = ""; //to avoid repeating the same idle message
let idleTimer = null; //timer for idle messages
let speechBubbleTimer = null; //timer for speech bubble

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
    const messages =
        currentCompanion.idleMessages[currentPage] || currentCompanion.idleMessages.default;
    let message;
    do {
        const randomIndex = Math.floor(Math.random() * messages.length);
        message = messages[randomIndex];
    } while (messages.length > 1 && message === lastIdleMessage);
    lastIdleMessage = message;
    return message;
}

function getRandomIdleDelay() {
    // Between 20 and 60 seconds
    return Math.floor(Math.random() * 40000) + 20000;

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

function speak(message) { //speech bubble function
    clearTimeout(speechBubbleTimer);
    bubble.textContent = message;
    bubble.style.opacity = "1";
    bubble.style.visibility = "visible";
    bubble.style.transform = "translateY(0)";
    speechBubbleTimer = setTimeout(() => {
        bubble.style.opacity = "0";
        bubble.style.transform = "translateY(10px)";
        bubble.style.visibility = "hidden";
    }, 4000);
}

function startIdleConversation() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        // Don't interrupt animations
        if (currentState === "idle") {
            speak(getRandomIdleMessage());
        }
        // Schedule the next conversation
        startIdleConversation();
    }, getRandomIdleDelay());

}

//more like the brain function
function initializeCompanion() {
    setState('moving')
    moveCompanion();
    setExpression("idle");
    startIdleConversation();
}

initializeCompanion();

//console.log(getRandomIdleMessage());
//console.log(getRandomIdleDelay());