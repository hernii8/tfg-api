const models = require('../models');
const dataService = require('../services/data.service');
const Op = models.sequelize.Op;
const fs = require('fs');
var exec = require('child_process').exec;

module.exports = {
    predict: async (req, res, next) => {
        try {
            if (!req.body.posicion || !req.body.perfil || !req.body.materiaId || !req.body.abogadoId || !req.body.juezId) throw new Error("Argumentos no encontrados");
            let abogado = await models.ProfesionalesEstadisticas.findById(req.body.abogadoId);
            let derecho = await models.Derechos.findById(req.body.materiaId);
            let nombreMateria = derecho.nombre;
            if (!derecho) throw new Error("Materia no encontrada");
            if (!derecho.mostrar) {
                derecho = await models.Derechos.findOne({
                    where: {
                        id: req.body.materiaId
                    },
                    include: [{
                        model: models.Derechos,
                        as: 'Padre',
                        where: {
                            mostrar: 1
                        },
                        order: [
                            ['nivel'],
                            ['DESC']
                        ]
                    }]
                });
                derecho = derecho.Padre[0];
            }
            let perfil = await models.Perfiles.findOne({
                where: {
                    nombre: req.body.perfil
                }
            });
            let posicion = await models.PosicionesProcesales.findOne({
                where: {
                    nombre: req.body.posicion
                }
            });

            let reqData = {
                abogado: abogado,
                perfilId: perfil.id,
                posicionId: posicion.id,
                juezId: req.body.juezId,
                materiaId: req.body.materiaId,
                derechoId: derecho.id,
                fecha: new Date("12-31-2018 00:00:00")
            }
            let lawyerData = await dataService.getDatos(reqData);
            console.log("Datos obtenidos");
            let formattedData = await formatData(lawyerData, abogado, req.body.perfil, req.body.posicion, nombreMateria);
            console.log("Datos formateados");
            let prediction = makePrediction(formattedData, nombreMateria, (prediccion, err) => {
                try {
                    if (err) throw err;
                    console.log("Prediccion hecha");
                    return res.status(200).send({
                        prediccion: prediccion,
                        perfilNombre: req.body.perfil,
                        posicionNombre: req.body.posicion,
                        abogadoNombre: abogado.nombre,
                        abogadoURL: abogado.rating >= 70 ? "https://emerita.legal/abogado/" + abogado.nombre.replace(/ /g, "-").normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() + "-" + abogado.id : null,
                        perfilPosicionResoluciones: lawyerData.datosAbogadoPerfilPosicion.total,
                        perfilPosicionExito: lawyerData.datosAbogadoPerfilPosicion.tasaExito,
                        relacionTotal: lawyerData.relacion.total,
                        relacionExito: lawyerData.relacion.tasaExito,
                        juezAntiguedad: lawyerData.datosJuez.antiguedad,
                        juezResoluciones: lawyerData.datosJuez.resoluciones,
                        juezDesestimatorios: (lawyerData.datosJuez.fallos[0] ? lawyerData.datosJuez.fallos[0].count : 0),
                        juezEstimatorios: (lawyerData.datosJuez.fallos[1] ? lawyerData.datosJuez.fallos[1].count : 0),
                        juezParciales: (lawyerData.datosJuez.fallos[2] ? lawyerData.datosJuez.fallos[2].count : 0),
                        resolucionesMedias: lawyerData.medias.numeroResolucionesMedias,
                        exitoMedio: lawyerData.medias.tasaExitoMedia
                    });
                }
                catch(err){
                    next(err);
                }
            });
        } catch (err) {
            next(err);
        }
    }
}

async function formatData(data, abogado, perfil, posicion, nombreMateria) {
    let formattedData = [];
    if (perfil === "PERSONA FÍSICA") formattedData.push(1, 0);
    else if (perfil === "PERSONA JURÍDICA") formattedData.push(0, 1);
    else throw Error("Perfil no encontrado");
    if (posicion === "DEMANDANTE") formattedData.push(1, 0);
    else if (posicion === "DEMANDADO") formattedData.push(0, 1);
    else throw Error("Posición no encontrada");

    let comunidades = await models.ProfesionalesEstadisticas.findAll({
        attributes: [
            [models.sequelize.fn('DISTINCT', models.sequelize.col('comunidad')), 'comunidad']
        ],
        where: {
            comunidad: {
                [Op.ne]: null
            }
        },
        order: [
            ['comunidad', 'ASC']
        ]
    });
    comunidades = comunidades.map((el) => {
        return el.comunidad;
    });
    for (let comunidad of comunidades) {
        if (comunidad === abogado.comunidad) formattedData.push(1);
        else formattedData.push(0);
    }

    let salida = [data.datosAbogadoPerfilPosicion.total,
        data.datosAbogadoPerfilPosicion.tasaExito,
        data.datosAbogadoPerfil.total,
        data.datosAbogadoPerfil.tasaExito,
        data.datosAbogadoPosicion.total,
        data.datosAbogadoPosicion.tasaExito,
        data.datosAbogadoDerecho.total,
        data.datosAbogadoDerecho.tasaExito,
        data.relacion.total,
        data.relacion.tasaExito,
        data.datosJuez.antiguedad,
        data.datosJuez.resoluciones,
        (data.datosJuez.fallos[0] ? data.datosJuez.fallos[0].count : 0),
        (data.datosJuez.fallos[1] ? data.datosJuez.fallos[1].count : 0),
        (data.datosJuez.fallos[2] ? data.datosJuez.fallos[2].count : 0),
        data.porcentajeEspecializacion,
        (data.antiguedadAbogado > 0 ? data.antiguedadAbogado : 0),
        data.medias.numeroResolucionesMedias,
        data.medias.tasaExitoMedia
    ]
    let fileMeanstd = fs.readFileSync(__dirname + '/../scripts/svm/data/' + nombreMateria.replace(/ /g, "_").toLowerCase() + '/mean_std.dat', 'utf-8');
    let fileMeanstdArray = fileMeanstd.split("\n");
    let meanstdArray = [];
    fileMeanstdArray = fileMeanstdArray.slice(1);
    for (let mean of fileMeanstdArray) {
        if (!mean.includes("indicator")) {
            mean = mean.replace(/ +/g, ' ');
            if (mean !== "" && mean !== " ") {
                let splitted = mean.split(" ");
                splitted = splitted.slice(1);
                meanstdArray.push({
                    mean: parseFloat(splitted[1]),
                    std: parseFloat(splitted[2])
                });
            }
        }
    }
    for (let i = 0; i < salida.length; i++) {
        salida[i] = (salida[i] - meanstdArray[i].mean) / meanstdArray[i].std;
    }
    formattedData = formattedData.concat(salida);
    return formattedData;
}

function makePrediction(data, nombreMateria, cb) {
    let dataString = data.toString().replace(/,/g, " ");
    exec(__dirname + "/../scripts/svm/programs/execution/execution " + nombreMateria.replace(/ /g, "_").toLowerCase() + " " + dataString, function (err, stdout, stderr) {
        if (err) {
            cb(null, err);
        } else {
            switch (stdout) {
                case "0":
                    cb("DESESTIMATORIO");
                    break;
                case "1":
                    cb("ESTIMATORIO PARCIAL");
                    break;
                case "2":
                    cb("ESTIMATORIO");
                    break;
                default:
                    throw new Error("Ha habido un error");
            }
        }
    });
}