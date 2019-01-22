const controller = require('../../controller/index');
const handleError = require('../handleError');
module.exports = (router, app) => {
    router.get('/profiles', controller.getterController.getPerfiles);
    router.get('/positions', controller.getterController.getPosiciones);
    router.get('/rights', controller.getterController.getMaterias);
    router.get('/lawyers', controller.getterController.getLawyersByName);
    router.get('/judges', controller.getterController.getJudgesByName);
    router.post('/predict', controller.predictController.predict);
    app.use('/', router);
    app.use(handleError);

}