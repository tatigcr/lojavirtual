module.exports = {
    secret: process.env.NODE_ENV === "production" ? process.env.SECRET : "ASJKFD536KL6JKLN7LFSJTH989THAHA0RT895KLASRF23LKBGV12JK345F",
    api: process.env.NODE_ENV === "production" ? "https://api.loja-teste.com" : "http://localhost:3000",
    loja: process.env.NODE_ENV === "production" ? "https://loja-teste.tati.com" : "http://localhost:8000"
};