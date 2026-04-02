module.exports = {
    credits: {
        name: "Fred",
        phone: "+39 392 748 3420",
    },
    displayCredits: function() {
        console.log(`Credits for ${this.credits.name}: ${this.credits.phone}`);
    }
};