// =====================================================
// SESSION MEMORY
// =====================================================

const sessionMemory = {

    // Greetings
    greeted: false,
    greetingCount: 0,

    // User interactions
    thanksCount: 0,
    apologyCount: 0,

    // identity questions asked by the companion
    identityQuestions: 0,

    // Companion activity
    companionSwitches: 0,
    idleMessagesSeen: 0,

    // Context
    lastCommand: null,
    lastPage: null,
    lastCompanion: null

};

// =====================================================
// MEMORY FUNCTIONS
// =====================================================

function rememberCommand(command) {
    sessionMemory.lastCommand = command;
}

function rememberPage(page) {
    sessionMemory.lastPage = page;
}

function rememberCompanion(name) {
    sessionMemory.lastCompanion = name;
}

function incrementGreetingCount() {
    sessionMemory.greetingCount++;
}

function incrementThanksCount() {
    sessionMemory.thanksCount++;
}

function incrementApologyCount() {
    sessionMemory.apologyCount++;
}

function incrementCompanionSwitches() {
    sessionMemory.companionSwitches++;
}

function incrementIdleMessagesSeen() {
    sessionMemory.idleMessagesSeen++;
}

function incrementIdentityQuestions() {
    sessionMemory.identityQuestions++;
}

function getIdentityStage() {
    if (sessionMemory.identityQuestions === 1) {
        return 1;
    }
    if (sessionMemory.identityQuestions <= 3) {
        return 2;
    }
    return 3;
}

function resetSessionMemory() {
    sessionMemory.greeted = false;
    sessionMemory.greetingCount = 0;
    sessionMemory.thanksCount = 0;
    sessionMemory.apologyCount = 0;
    sessionMemory.companionSwitches = 0;
    sessionMemory.idleMessagesSeen = 0;
    sessionMemory.lastCommand = null;
    sessionMemory.lastPage = null;
    sessionMemory.lastCompanion = null;
}

