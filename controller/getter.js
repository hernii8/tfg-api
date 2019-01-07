module.exports = {
    getPerfiles: (req, res, next) => {
        let perfiles = ['PERSONA FÍSICA', 'PERSONA JURÍDICA'];
        return res.status(200).send(perfiles);
    },

    getPosiciones: (req, res, next) => {
        let posiciones = ['DEMANDANTE', 'DEMANDADO'];
        return res.status(200).send(posiciones);
    },

    getMaterias: (req, res, next) => {
        let materias = ['DIVORCIO'];
        return res.status(200).send(materias);
    }
}