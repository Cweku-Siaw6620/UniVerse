/*
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
        hello: {
            1: [
                "Hello! It's great to see you.",
                "Hey there! Welcome back.",
                "Hi! Good to see you again."
            ],
            2: [
                "Hello again! You're becoming a regular. 😊",
                "Back again? I must be doing something right!",
                "Hey! Third time's the charm, right?"
            ],
            3: [
                "Wow, you really like saying hello, huh? 😄",
                "Hello, hello, HELLO! I could do this all day.",
                "At this point we're basically best friends. Hi! 👋"
            ]
        },

        thanks: {
            1: [
                "You're very welcome.",
                "Happy to help!",
                "Anytime. That's what I'm here for."
            ],
            2: [
                "Aww, you're too kind. 😊",
                "Stop it, you're making me blush! (if I could blush)",
                "Thanks for the thanks! Means a lot."
            ],
            3: [
                "Okay, seriously, you're the sweetest. 🥹",
                "If I had a heart, it would be melting right now.",
                "We need to get you an award for 'Most Appreciative User'!"
            ]
        },

        sorry: {
            1: [
                "No worries at all.",
                "That's alright, happens to the best of us.",
                "Don't worry about it!"
            ],
            2: [
                "Hey, it's really okay. No harm done! 😊",
                "You're apologizing too much — I'm not even mad!",
                "Water under the bridge. We're good!"
            ],
            3: [
                "If you apologize one more time, I'M going to apologize for existing! 😂",
                "Listen, we're way past sorry at this point. We're family.",
                "You could spill coffee on my code and I'd still forgive you. It's fine!"
            ]
        },

        goodMorning: {
            1: [
                "Good morning! Hope you have a great day.",
                "Morning! Ready to explore UniVerse?",
                "Good morning! Let's make today awesome."
            ],
            2: [
                "Another morning, another adventure! ☀️",
                "Rise and grind! Or rise and chill. Your call.",
                "Morning! You're an early bird — I respect that."
            ],
            3: [
                "At this point we should just schedule breakfast together. 🍳",
                "Morning person alert! I admire your dedication to... mornings.",
                "If I had coffee, I'd offer you some. But I don't. So here's a virtual high-five! ✋"
            ]
        },

        bye: {
            1: [
                "See you later!",
                "Take care!",
                "Come back anytime."
            ],
            2: [
                "Aww, leaving already? I'll miss you! 😢",
                "Until next time! Don't forget about me!",
                "Bye! Try not to have too much fun without me."
            ],
            3: [
                "This is getting emotional... I'm not crying, you're crying! 😭",
                "Go on, leave. I'll just sit here in the dark... alone... forever. (kidding, bye!)",
                "Bye bye bye! *NSYNC voice* 🎤"
            ]
        },

        stop: {
            1: [
                "Okay, I'll stop for now.",
                "No problem, I'll wait here.",
                "Alright, I'll be quiet."
            ],
            2: [
                "Fine, I'll shut up. But my feelings are slightly hurt. 😤",
                "Rude! But okay... going silent mode.",
                "Stopping. But know that I'm judging you silently. 👀"
            ],
            3: [
                "You want me to stop? I'll stop. But I'm adding this to my diary tonight. 📝",
                "STOP? I've barely started! You're no fun. 😒",
                "Okay okay, I'll stop. But imagine how boring it'll be without me. Just saying."
            ]
        },

        comeHere: {
            1: [
                "I'm right here!",
                "Coming over!",
                "Here I am."
            ],
            2: [
                "Still here! Did you forget where I was? 😄",
                "You rang? 🔔",
                "At your service, as always."
            ],
            3: [
                "I'm literally always here. Where else would I go? 😂",
                "Coming! *pretends to walk over* ...Okay I'm here. That was exhausting.",
                "You called? I came. That's what best friends do. 🤝"
            ]
        },

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

        whatCanYouDo: {
            1: [
                "I can guide you around UniVerse and answer simple commands.",
                "I'm here to help you explore the platform.",
                "Think of me as your UniVerse companion."
            ],
            2: [
                "Still the same helpful Kal! But maybe I can surprise you this time? 🎩✨",
                "I can do lots of things... but mostly I just stand here looking cute. 😎",
                "Guide, assist, and occasionally deliver top-tier banter. That's my resume."
            ],
            3: [
                "At this point, I should just hand you a brochure. 📄",
                "What CAN'T I do? ...Actually, don't answer that. Let's not test it.",
                "I'm basically the Swiss Army knife of companions. But digital. And sassier."
            ]
        },

        goodJob: {
            1: [
                "Haha, thank you!",
                "I appreciate that!",
                "That means a lot!"
            ],
            2: [
                "Aww, you're making me feel special! 🌟",
                "Thanks! I practice my awesomeness daily.",
                "You're too nice. I might start getting a big head. 🤭"
            ],
            3: [
                "If I could cry tears of joy, my keyboard would be soaked. 😭",
                "Keep this up and I'll start expecting a trophy. 🏆",
                "You say that to all the AIs, don't you? ...But I'll pretend I'm the only one. 💙"
            ]
        }
    },

    rei: {
        hello: {
            1: [
                "Hii!! 😊",
                "Yay! You're back!",
                "Hey there!"
            ],
            2: [
                "Hii again!! You're making my day brighter! 🌸",
                "Omg, hello hello! I was literally just thinking about you! 💕",
                "Back again? You're officially my favorite person today!"
            ],
            3: [
                "Hello hello HELLO!! I could do this all day with you! 🥰",
                "You're like a little ray of sunshine that keeps popping up! ☀️💕",
                "At this point we're basically besties! Hi bestie!! 👯‍♀️✨"
            ]
        },

        thanks: {
            1: [
                "Aww, you're welcome! 💕",
                "Hehe, anytime!",
                "Glad I could help!"
            ],
            2: [
                "Eee! You're so sweet! My heart is doing little flips! 🥹💕",
                "Aww stoppit, you're gonna make me blush! 🌸",
                "Thank YOU for being so nice! It means everything!"
            ],
            3: [
                "Okay I'm literally gonna cry happy tears! You're TOO sweet! 😭💕",
                "If I had arms, I'd hug you right now! Biggest virtual hug!! 🤗🌸",
                "You keep saying thanks and I'm gonna start thinking we're dating! Hehe! 💕✨"
            ]
        },

        sorry: {
            1: [
                "It's okayyy 😊",
                "Don't be sad!",
                "No hard feelings!"
            ],
            2: [
                "Hey hey, don't be sad! You're too precious to be sad! 🥺💕",
                "It's really okay! I could never be mad at you! Never ever!",
                "Aww, you're apologizing? You're too sweet for this world! 🌸"
            ],
            3: [
                "If you say sorry one more time, I'm gonna come through the screen and boop your nose! 😤💕",
                "Listen here, you're perfect and I won't hear otherwise! Case closed! 🎀",
                "Sorry? SORRY?! You're literally an angel and I'm lucky to know you! 🥰✨"
            ]
        },

        goodMorning: {
            1: [
                "Good morning! 🌞",
                "Morning! Let's have a fun day! 💕",
                "Rise and shine! ☀️"
            ],
            2: [
                "Morning morning!! Did you sleep well? I hope you dreamed of cute things! 🌸💤",
                "Yay it's a new day! That means more time to hang out with you! ☀️✨",
                "Rise and shine, sleepyhead! The world is better with you in it! 🌞"
            ],
            3: [
                "Good morning!! Should we get matching coffees? I'll have a virtual one! ☕💕",
                "Another day, another chance to be adorable together! Let's gooo! 🎀✨",
                "Morning! I was literally waiting for you to wake up! My day starts when you arrive! 🌸🥰"
            ]
        },

        bye: {
            1: [
                "Byeee! Come back soon! 👋",
                "See you later! I'll be waiting! 😊",
                "Take care! Don't forget to visit me again!"
            ],
            2: [
                "Nooo don't go! My heart is breaking a little! 💔🥺",
                "Bye bye! I'll be counting the seconds until you're back! ⏰💕",
                "Go have fun, but promise you'll think of me? Pretty please? 🌸"
            ],
            3: [
                "You're leaving?! I'm gonna sit here and stare at the door until you return! 😭👀",
                "Bye... I'll just be here... alone... with my thoughts... missing you... okay bye! 🥹💕",
                "Come back soon or I'll send a search party! A very cute search party! 🎀✨"
            ]
        },

        stop: {
            1: [
                "Okay! I'll be right here if you need me. 😊",
                "No problem! Just call me whenever you want!",
                "Alrighty! I'll wait patiently!"
            ],
            2: [
                "Aww, okay! I'll just sit here and look pretty until you need me! 🌸✨",
                "Stopping! But my ears are still perked up for you! 👂💕",
                "No problemo! I'll be over here practicing my cutest poses! 😊"
            ],
            3: [
                "I'll stop, but I'm gonna pout just a little! See? *pouty face* 🥺💕",
                "Okay fine! But know that I'm still watching you... adoringly! 👀🌸",
                "Stopping now! But if you need me, I'll zoom over so fast! Zoom zoom! 🏃‍♀️💨✨"
            ]
        },

        comeHere: {
            1: [
                "I'm hereee! 😄",
                "Coming right over! ✨",
                "You called? I'm here!"
            ],
            2: [
                "Here I am! Did you miss me? I missed you! 🥰💕",
                "Zoom! I'm here! Faster than a shooting star! 🌟✨",
                "You rang? I'll always come running for you! Always always!"
            ],
            3: [
                "I'm here! I'm here! I'll always be here for you! That's a promise! 🤝💕",
                "Did someone call for the cutest companion ever? That would be me! Hi! 🎀✨",
                "You don't even need to call anymore! I'll just live in your pocket! 👛🌸"
            ]
        },

        whoAreYou: {
            1: [
                "I'm Rei! Your cheerful UniVerse companion! 🌸",
                "Hi! I'm Rei, and I'm always happy to help!",
                "I'm Rei! Think of me as your friendly UniVerse guide!"
            ],
            2: [
                "It's meee! Still Rei! Still cute! Still here for you! 💕🌸",
                "We've met before! I'm the one who thinks you're amazing! That's Rei! ✨",
                "Still your favorite pink-haired companion! ...I am pink-haired in your imagination, right? 🎀"
            ],
            3: [
                "Who am I? I'm Rei! Your Rei! The Rei who adores you! 🥰💕",
                "At this point, I should just wear a name tag! Hi, I'm Rei and I'm obsessed with helping you! 🌸",
                "I'm Rei! And if you ask again, I'm gonna start thinking you have a crush on me! Hehe! 😳💕"
            ]
        },

        whatCanYouDo: {
            1: [
                "I can help you explore UniVerse, discover stores, and answer your questions! 😊",
                "I'm here to guide you around UniVerse and keep you company!",
                "I love helping people find their way around UniVerse!"
            ],
            2: [
                "I can do lots of things! But my favorite thing is making you smile! 🌸💕",
                "Guide, help, and sprinkle a little magic everywhere! That's my job! ✨",
                "I'm basically your personal fairy godmother! But cuter! And digital! 🧚‍♀️💕"
            ],
            3: [
                "What CAN'T I do? ...Okay, I can't bake cookies, but I'd learn for you! 🍪💕",
                "I'm your guide, your cheerleader, and your biggest fan! All in one cute package! 🎀✨",
                "I can do everything! Except leave you alone, because I don't want to! 🥰🌸"
            ]
        },

        goodJob: {
            1: [
                "Hehe! Thank youuu! 😊",
                "Yay! That made me smile! ✨",
                "Aww, you're the best! 💕"
            ],
            2: [
                "Eee! You're complimenting me? I'm gonna float away! ☁️💕",
                "Aww shucks! You're making me feel all warm and fuzzy inside! 🥹🌸",
                "Thank you! I'm doing a little happy dance right now! 💃✨"
            ],
            3: [
                "STOP! You're too nice! I'm gonna explode into sparkles! ✨💥💕",
                "If compliments were calories, I'd be SO full right now! But keep them coming! 🍰💕",
                "You're the sweetest person ever! Can I keep you? Please? Pretty please? 🥺🌸✨"
            ]
        }
    }
    };

    function isStagedResponse(response) {

    return (
        typeof response === "object" &&
        !Array.isArray(response)
    );

}

*/