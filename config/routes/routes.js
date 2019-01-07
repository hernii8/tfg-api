const controller = require('../../controller/index');

module.exports = (router, app) => {
    router.get('/profiles', controller.getterController.getPerfiles);
    router.get('/positions', controller.getterController.getPerfiles);
    // app.use(handleError);
    app.use('/', router);
}