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
        angry: "../images/kal/kal_angry.png",
        blush: "../images/kal/kal_blush.png",
        embarrassed: "../images/kal/kal_embarrassed.png",
        happy: "../images/kal/kal_happy.png",
        idle: "../images/kal/kal_idle.png",
        laugh: "../images/kal/kal_laugh.png",
        sleep: "../images/kal/kal_sleep.png",
        surprised: "../images/kal/kal_surprised.png",
        thinking: "../images/kal/kal_thinking.png",
        wave: "../images/kal/kal_wave.png",
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
        {
            emotion: "happy",
            text: "👋 Welcome back!"
        },
        {
            emotion: "happy",
            text: "Today's featured products are worth checking out."
        },
        {
            emotion: "thinking",
            text: "Have you explored the categories yet?"
        },
        {
            emotion: "happy",
            text: "Lots of student businesses have added new products recently."
        },
        {
            emotion: "thinking",
            text: "Looking for something specific?"
        }
    ],
    stores: [
        {
            emotion: "happy",
            text: "Premium stores get featured more often."
        },
        {
            emotion: "happy",
            text: "Some stores are verified. Look for the badge!"
        },
        {
            emotion: "thinking",
            text: "Click a store to explore all its products."
        },
        {
            emotion: "thinking",
            text: "You can search for stores by university."
        }
    ],
    }
};

//command responses for the companion
const commandResponses = {
    hello: {
        triggers: ["hello", "hi", "hey"],
        emotion: "happy",
        response: "Hello! It's great to see you."
    },
    goodMorning: {
        triggers: ["good morning"],
        emotion: "happy",
        response: "Good morning! Ready to explore UniVerse?"
    },
    thanks: {
        triggers: ["thanks", "thank you"],
        emotion: "happy",
        response: "You're very welcome!"
    },
    sorry: {
        triggers: ["sorry"],
        emotion: "blush",
        response: "That's okay. No hard feelings."
    },
    bye: {
        triggers: ["bye", "goodbye"],
        emotion: "wave",
        response: "See you later! Come back soon."
    },
    stop: {
        triggers: ["stop"],
        emotion: "thinking",
        response: "Okay, I'll stop for now."
    },
    comeHere: {
        triggers: ["come here"],
        emotion: "happy",
        response: "I'm right here!"
    },
    whoAreYou: {
        triggers: ["who are you"],
        emotion: "happy",
        response: "I'm Kal, your UniVerse companion."
    },
    whatCanYouDo: {
        triggers: ["what can you do"],
        emotion: "thinking",
        response: "I can guide you around UniVerse, answer simple commands, and keep you company."
    },
    goodJob: {
        triggers: ["good job", "well done"],
        emotion: "laugh",
        response: "Haha, thank you! I appreciate that."
    }
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

function handleCommand(userInput) { //handle user input and respond with the appropriate command
    const command = findCommand(userInput);
    if (!command) {
        return false;
    }
    expressAndSpeak(
        command.emotion,
        command.response
    );
    return true;
}

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
const greeting = currentCompanion.greetings[currentPage] || "Hello!";

//expression setting function
function setExpression(expression) {
    companion.src = currentCompanion.images[expression];
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