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

companion.addEventListener("click", () => {
    openCompanionMenu(currentCompanion);
});

const companions = {
    kal,
    rei
};

function findCommand(userInput) { //finds the command based on user input
    const input = userInput.trim().toLowerCase();
    for (const command of Object.values(commandResponses)) {
        //limitation: only checks if the input includes the trigger, not exact match and some commands may be triggered by unrelated inputs. For example, "hello there" will trigger the hello command.
        if (
            command.triggers.some(trigger => {
            const escapedTrigger = trigger.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`\\b${escapedTrigger}\\b`, "i");
            return regex.test(input);
        })
        ) {
            return command;
        }
    }
    return null;
}

function handleCommand(userInput) {
    const command = findCommand(userInput);
    if (!command) {
        return false;
    }

    rememberInteraction(command.responseKey);

    // Get the current companion's personality
    const personality = personalities[currentCompanion.name.toLowerCase()];
    let response;
    // If this command has been migrated to the personality system
    if (command.responseKey && personality[command.responseKey]) {
        const responses = personality[command.responseKey];
        // Is this a staged response?
        if (isStagedResponse(responses)) {
            const stage = getInteractionStage(command.responseKey);
            const stageResponses = responses[stage];
            const randomIndex = Math.floor(Math.random() * stageResponses.length);
            response = stageResponses[randomIndex];
        }
        // Normal array response
        else {
            const randomIndex = Math.floor(Math.random() * responses.length);
            response = responses[randomIndex];
        }
    }
    else {
        response = command.response;
    }
    expressAndSpeak(
        command.emotion,
        response
    );
    return true;
}

let currentCompanion = companions.kal;
let currentState = "idle";
let currentRight = -200; //starting position
const targetRight = 20; //final destination
let lastIdleMessage = ""; //to avoid repeating the same idle message
let idleTimer = null; //timer for idle messages
let speechBubbleTimer = null; //timer for speech bubble
let expressionTimer = null; //timer for expression changes

//detects the current page based on the data-page attribute in the body tag
function detectCurrentPage() {
    return document.body.dataset.page || "home";
}

const currentPage = detectCurrentPage();
//const greeting = currentCompanion.greetings[currentPage] || "Hello!";

//expression setting function
function setExpression(expression) {
    if (currentCompanion.images[expression]) {
        companion.src = currentCompanion.images[expression];
    } else {
        console.warn(
            `Expression "${expression}" not found for ${currentCompanion.name}. Using idle instead.`
        );
        companion.src = currentCompanion.images.idle;
    }
}

//function to express an emotion for a certain duration
function express(expression, duration = 3000) {
    clearTimeout(expressionTimer);
    setExpression(expression);
    expressionTimer = setTimeout(() => {
        setExpression("idle");
    }, duration);
}

//function to express an emotion and speak a message simultaneously
function expressAndSpeak(expression, message, duration = 3000) {
    express(expression, duration);
    speak(message);
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

function wave() { //waving function

    if (currentState === "waving") {
        return;
    }
    setState("waving");
    setExpression("wave");
    const greeting =
        currentCompanion.greetings[currentPage] || `Hi! I'm ${currentCompanion.name}!`;
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
            const message = getRandomIdleMessage();
            expressAndSpeak(
                message.emotion,
                message.text
            );
        }
        // Schedule the next conversation
        startIdleConversation();
    }, getRandomIdleDelay());

}

//function to switch between companions
function switchCompanion(companionName) {
    if (!companions[companionName]) {
        console.error("Companion not found:", companionName);
        return;
    }
    if (currentCompanion === companions[companionName]) {
        return;
    }
    clearTimeout(idleTimer);
    clearTimeout(expressionTimer);
    clearTimeout(speechBubbleTimer);
    
    currentCompanion = companions[companionName];
    rememberCompanion(currentCompanion.name); //from companion/memory.js, this function stores the last companion in session memory
    incrementCompanionSwitches(); //from companion/memory.js, this function increments the companion switch count in session memory
    companion.src = currentCompanion.images.idle;
    currentState = "idle";

    speak(
        currentCompanion.greetings[currentPage] ||
        `Hi! I'm ${currentCompanion.name}!`
    );
    wave();
    startIdleConversation();
}

//more like the brain function
function initializeCompanion() {
    setState('moving')
    moveCompanion();
    setExpression("idle");
    startIdleConversation();
}

initializeCompanion();
*/