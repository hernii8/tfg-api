const fs = require('fs');
const models = require('../models');
const Op = models.sequelize.Op;

module.exports = {
    getPerfiles: (req, res, next) => {
        try {
            let perfiles = ['PERSONA FÍSICA', 'PERSONA JURÍDICA'];
            return res.status(200).send(perfiles);
        } catch (err) {
            return next(err);
        }
    },

    getPosiciones: (req, res, next) => {
        try {
            let posiciones = ['DEMANDANTE', 'DEMANDADO'];
            return res.status(200).send(posiciones);
        } catch (err) {
            return next(err);
        }
    },

    getMaterias: (req, res, next) => {
        try {
            let materias = [];
            fs.readdir(__dirname + '/../scripts/datasets/', async function (err, items) {
                if (err) throw err;
                materias = items.map((el) => {
                    return el.toUpperCase().replace(/_/g, ' ').split('.')[0];
                });
                let materiasSQL = [];
                for (let materia of materias) {
                    let materiaSQL = await models.Derechos.findOne({
                        attributes: ['id', 'nombre'],
                        where: {
                            nombre: materia
                        }
                    });
                    materiasSQL.push(materiaSQL);
                }
                return res.status(200).send(materiasSQL);
            });
        } catch (err) {
            return next(err);
        }
    },

    getJudgesByName: async (req, res, next) => {
        try {
            let jueces = await models.Magistrados.findAll({
                attributes: ['id', 'nombre'],
                where: {
                    nombre: {
                        [Op.like]: "%" + req.query.q + "%"
                    }
                },
                limit: 10
            })
            return res.status(200).send(jueces);
        } catch (err) {
            return next(err);
        }
    },

    getLawyersByName: async (req, res, next) => {
        try {
            let abogados = await models.ProfesionalesEstadisticas.findAll({
                attributes: ['id', 'nombre'],
                where: {
                    nombre: {
                        [Op.like]: "%" + req.query.q + "%"
                    },
                    comunidad: {
                        [Op.ne]: null
                    }
                },
                limit: 10
            });
            return res.status(200).send(abogados);
        } catch (err) {
            return next(err);
        }

    }
}