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

//kal companion object with images, greetings, and idle messages
const kal = {
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

//rei companion object with images, greetings, and idle messages
const rei = {
    name: "Rei",
    images: {
        angry: "../images/rei/rei_angry.png", //redo
        blush: "../images/rei/rei_blush.png",
        embarrassed: "../images/rei/rei_embarrassed.png",
        happy: "../images/rei/rei_happy.png",
        idle: "../images/rei/rei_idle.png",
       // laugh: "../images/rei/rei_laugh.png",
       // sleep: "../images/rei/rei_sleep.png",
        surprised: "../images/rei/rei_surprised.png",
        thinking: "../images/rei/rei_thinking.png",
        wave: "../images/rei/rei_wave.png"
    },
    greetings: {
        home: "Hi! I'm Rei! 😊",
        stores: "Let's go shopping together!"
    },
    idleMessages: {
        default: [
            "Hi there! 😊",
            "Need anything?",
            "I'm always happy to help!"
        ],
        home: [
            {
                emotion: "happy",
                text: "Yay! Welcome back! 😊"
            },
            {
                emotion: "happy",
                text: "Let's discover something amazing today!"
            },
            {
                emotion: "thinking",
                text: "What are you looking for today?"
            },
            {
                emotion: "happy",
                text: "There are lots of new student products to explore!"
            },
            {
                emotion: "thinking",
                text: "Need help finding something?"
            }
        ],
        stores: [
            {
                emotion: "happy",
                text: "Ooo! Let's browse some stores!"
            },
            {
                emotion: "happy",
                text: "Verified stores are always fun to explore!"
            },
            {
                emotion: "thinking",
                text: "Which university are you interested in?"
            },
            {
                emotion: "happy",
                text: "You might discover something really cool today!"
            }
        ]
    }
};

const companions = {
    kal,
    rei
};

//command responses for the companion
const commandResponses = {
    hello: {
        triggers: ["hello", "hi", "hey"],
        emotion: "happy",
        responseKey: "hello"
    },
    goodMorning: {
        triggers: ["good morning"],
        emotion: "happy",
        responseKey: "goodMorning"
    },
    thanks: {
        triggers: ["thanks", "thank you"],
        emotion: "happy",
        responseKey: "thanks"
    },
    sorry: {
        triggers: ["sorry"],
        emotion: "blush",
        responseKey: "sorry"
    },
    bye: {
        triggers: ["bye", "goodbye"],
        emotion: "wave",
        responseKey: "bye"
    },
    stop: {
        triggers: ["stop"],
        emotion: "thinking",
        responseKey: "stop"
    },
    comeHere: {
        triggers: ["come here"],
        emotion: "happy",
        responseKey: "comeHere"
    },
    whoAreYou: {
        triggers: ["who are you"],
        emotion: "happy",
        responseKey: "whoAreYou"
    },
    whatCanYouDo: {
        triggers: ["what can you do"],
        emotion: "thinking",
        responseKey: "whatCanYouDo"
    },
    goodJob: {
        triggers: ["good job", "well done"],
        emotion: "laugh",
        responseKey: "goodJob"
    }
};

const personalities = {
    kal: {
        hello: [
            "Hello! It's great to see you.",
            "Welcome back.",
            "Good to see you again."
        ],
        thanks: [
            "You're very welcome.",
            "Happy to help.",
            "Anytime."
        ],
        sorry: [
            "No worries.",
            "That's alright.",
            "Don't worry about it."
        ],
        goodMorning: [
            "Good morning! Hope you have a great day.",
            "Morning! Ready to explore UniVerse?",
            "Good morning! Let's make today awesome."
        ],
        bye: [
            "See you later!",
            "Take care!",
            "Come back anytime."
        ],
        stop: [
            "Okay, I'll stop for now.",
            "No problem, I'll wait here.",
            "Alright, I'll be quiet."
        ],
        comeHere: [
            "I'm right here!",
            "Coming over!",
            "Here I am."
        ],

        whoAreYou: {
            1: [

                "I'm Kal, your UniVerse companion.",
                "I'm Kal! I'm here to help you around UniVerse."
            ],
            2: [

                "Still me. 😄 I'm Kal.",
                "We've already met! I'm Kal."

            ],
            3: [

                "Haha... you really like asking who I am.",
                "I'm still Kal. I haven't changed. 😄"

            ]
        },
    
        whatCanYouDo: [
            "I can guide you around UniVerse and answer simple commands.",
            "I'm here to help you explore the platform.",
            "Think of me as your UniVerse companion."
        ],
        goodJob: [
            "Haha, thank you!",
            "I appreciate that!",
            "That means a lot!"
        ]
    },

    rei: {
        hello: [
            "Hii!! 😊",
            "Yay! You're back!",
            "Hey there!"
        ],
        thanks: [
            "Aww, you're welcome! 💕",
            "Hehe, anytime!",
            "Glad I could help!"
        ],
        sorry: [
            "It's okayyy 😊",
            "Don't be sad!",
            "No hard feelings!"
        ],
        goodMorning: [
            "Good morning! 🌞",
            "Morning! Let's have a fun day! 💕",
            "Rise and shine! ☀️"
        ],
        bye: [
            "Byeee! Come back soon! 👋",
            "See you later! I'll be waiting! 😊",
            "Take care! Don't forget to visit me again!"
        ],
        stop: [
            "Okay! I'll be right here if you need me. 😊",
            "No problem! Just call me whenever you want!",
            "Alrighty! I'll wait patiently!"
        ],
        comeHere: [
            "I'm hereee! 😄",
            "Coming right over! ✨",
            "You called? I'm here!"
        ],
        whoAreYou: [
            "I'm Rei! Your cheerful UniVerse companion! 🌸",
            "Hi! I'm Rei, and I'm always happy to help!",
            "I'm Rei! Think of me as your friendly UniVerse guide!"
        ],
        whatCanYouDo: [
            "I can help you explore UniVerse, discover stores, and answer your questions! 😊",
            "I'm here to guide you around UniVerse and keep you company!",
            "I love helping people find their way around UniVerse!"
        ],
        goodJob: [
            "Hehe! Thank youuu! 😊",
            "Yay! That made me smile! ✨",
            "Aww, you're the best! 💕"
        ]
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

function handleCommand(userInput) {
    const command = findCommand(userInput);
    if (!command) {
        return false;
    }

    rememberCommand(command.responseKey); //found in companion/memory.js, this function stores the last command in session memory
    if (command.responseKey === "whoAreYou") {
        incrementIdentityQuestions();
    }

    // Get the current companion's personality
    const personality = personalities[currentCompanion.name.toLowerCase()];
    let response;
    // If this command has been migrated to the personality system
    if (command.responseKey && personality[command.responseKey]) {
        // Special case: "Who are you?"
        if (command.responseKey === "whoAreYou") {
            const stage = getIdentityStage();
            const responses = personality.whoAreYou[stage];
            const randomIndex = Math.floor(Math.random() * responses.length);
            response = responses[randomIndex];
        }
        // All other commands
        else {
            const responses = personality[command.responseKey];
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