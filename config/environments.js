let env = process.env.NODE_ENV;
let port = 3000;
let url_front = 'http://localhost:4200';
if (env === 'test') {
    port = 3000;
    url_front = 'http://localhost:4200';
} else if (env === 'production') {
    port = 3000;
    url_front = 'http://localhost:4200';
}
module.exports = {
    port: port,
    url_front: url_front
};