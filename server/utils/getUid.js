

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const uid = () => {
    return Date.now().toString() + getRandomInt(1, 1000).toString();
}

module.exports = uid;