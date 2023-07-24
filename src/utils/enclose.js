const enclose = (author, text) => {
    return {
        author,
        text,
        createdAt: new Date().getTime()
    };
}

module.exports = {
    enclose
};