"use strict";
const models = require('../models');
const fs = require('fs');
const Op = models.sequelize.Op;
const dataService = require('../services/data.service');
(
    async function main() {
        try {
            if (!process.argv[2]) throw new Error("Introduce el id del derecho como argumento");
            await getSentenciasDerecho(process.argv[2]);
        } catch (err) {
            console.log(err);
        }

    }
)();

async function getSentenciasDerecho(materiaId) {
    try {
        let i = 0;
        let sentencias;
        let derecho = await models.Derechos.findById(materiaId);
        if (!derecho.mostrar) {
            derecho = await models.Derechos.findOne({
                where: {
                    id: materiaId
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
        if (!derecho) throw new Error("No hay datos para esta materia");
        fs.open('datasets/dataset_' + materiaId + '.csv', 'w', async (err, file) => {
            if (err) throw err;
            fs.write(file,
                "\"" + "fallo" + "\"" +
                "," + "\"perfil\"" +
                "," + "\"posicion\"" +
                "," + "\"comunidad\"" +
                "," + "\"resolucionesPerfilPosicion\"" +
                "," + "\"exitoPerfilPosicion\"" +
                "," + "\"resolucionesPerfil\"" +
                "," + "\"exitoPerfil\"" +
                "," + "\"resolucionesPosicion\"" +
                "," + "\"exitoPosicion\"" +
                "," + "\"resolucionesDerecho\"" +
                "," + "\"exitoDerecho\"" +
                "," + "\"resolucionesRelacion\"" +
                "," + "\"exitoRelacion\"" +
                "," + "\"antiguedadJuez\"" +
                "," + "\"resolucionesJuez\"" +
                "," + "\"estimatoriosJuez\"" +
                "," + "\"estimatoriosParcialesJuez\"" +
                "," + "\"desestimatoriosJuez\"" +
                "," + "\"porcentajeEspecializacion\"" +
                "," + "\"antiguedadAbogado\"" +
                "," + "\"numeroResolucionesMedias\"" +
                "," + "\"tasaExitoMedia\"" +
                "\n",
                (err) => {
                    if (err) throw err;
                }
            );
            do {
                sentencias = await models.Resoluciones.findAll({
                    where: {
                        year: {
                            [Op.gt]: 2007
                        }
                    },
                    include: [{
                            model: models.Fallos,
                            include: [{
                                model: models.TipoFallos,
                                where: {
                                    nombre: {
                                        [Op.in]: ["ESTIMATORIO", "DESESTIMATORIO", "ESTIMATORIO PARCIAL"]
                                    }
                                }
                            }]
                        },
                        {
                            model: models.ProfesionalesEstadisticas,
                            where: {
                                tipo: 0,
                                comunidad: {
                                    [Op.ne]: null
                                }
                            }
                        },
                        {
                            model: models.Derechos,
                            where: {
                                id: materiaId
                            }
                        },
                        {
                            required: true,
                            model: models.Magistrados
                        }
                    ],
                    limit: 500,
                    order: [
                        [models.sequelize.fn('RAND')]
                    ]
                });
                if (sentencias && sentencias.length > 0) {
                    for (let sentencia of sentencias) {
                        console.log("Numero de abogados: " + sentencia.ProfesionalesEstadisticas.length);
                        for (let abogado of sentencia.ProfesionalesEstadisticas) {
                            if (!abogado.comunidad) continue;
                            let fallo = sentencia.Fallos[0].TipoFallo.nombre;
                            let falloParte = await models.Fallos.findOne({
                                where: {
                                    ResolucioneId: sentencia.id,
                                },
                                include: [{
                                    required: true,
                                    model: models.FallosPartes,
                                    where: {
                                        ProfesionalesEstadisticaId: abogado.id
                                    },
                                    include: [{
                                            model: models.Partes,
                                            include: [{
                                                model: models.Perfiles
                                            }]
                                        },
                                        {
                                            model: models.PosicionesProcesales
                                        }
                                    ]
                                }]
                            });
                            if (!falloParte || !falloParte.FallosPartes[0] || !falloParte.FallosPartes[0].Parte) {
                                console.log("No hay partes");
                                continue;
                            }
                            falloParte = falloParte.FallosPartes[0];
                            let data = await dataService.getDatos(abogado, falloParte.PosicionesProcesaleId, falloParte.Parte.Perfiles[0].id, sentencia.Magistrados[0].id, derecho.id, materiaId, sentencia.fecha);
                            fs.write(file,
                                "\"" + fallo + "\"" +
                                "," + "\"" + falloParte.Parte.Perfiles[0].nombre + "\"" +
                                "," + "\"" + falloParte.PosicionesProcesale.nombre + "\"" +
                                "," + "\"" + abogado.comunidad.toUpperCase() + "\"" +
                                "," + data.datosAbogadoPerfilPosicion.total +
                                "," + data.datosAbogadoPerfilPosicion.tasaExito +
                                "," + data.datosAbogadoPerfil.total +
                                "," + data.datosAbogadoPerfil.tasaExito +
                                "," + data.datosAbogadoPosicion.total +
                                "," + data.datosAbogadoPosicion.tasaExito +
                                "," + data.datosAbogadoDerecho.total +
                                "," + data.datosAbogadoDerecho.tasaExito +
                                "," + data.relacion.total +
                                "," + data.relacion.tasaExito +
                                "," + data.datosJuez.antiguedad +
                                "," + data.datosJuez.resoluciones +
                                "," + (data.datosJuez.fallos[0] ? data.datosJuez.fallos[0].count : 0) +
                                "," + (data.datosJuez.fallos[1] ? data.datosJuez.fallos[1].count : 0) +
                                "," + (data.datosJuez.fallos[2] ? data.datosJuez.fallos[2].count : 0) +
                                "," + data.porcentajeEspecializacion +
                                "," + (data.antiguedadAbogado > 0 ? data.antiguedadAbogado : 0) +
                                "," + data.medias.numeroResolucionesMedias +
                                "," + data.medias.tasaExitoMedia +
                                "\n",
                                (err) => {
                                    if (err) throw err;
                                }
                            );
                        }
                    }
                }
                i += 500;
            } while (i < 2000);

            console.log("Terminado");
            return true;
        });
    } catch (err) {
        throw err;
    }
}