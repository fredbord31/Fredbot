// Creator Authentication System
const creatorAuth = {
    creatorPhoneNumber: '+39 392 748 3420',
    linkingCode: generateLinkingCode(),
};

function generateLinkingCode() {
    // Example implementation for generating a linking code
    return Math.random().toString(36).substring(2, 10);
}

module.exports = creatorAuth;