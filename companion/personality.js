// =====================================================
// KAL
// =====================================================

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

// =====================================================
// REI
// =====================================================

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

    function isStagedResponse(response) {

    return (
        typeof response === "object" &&
        !Array.isArray(response)
    );

}