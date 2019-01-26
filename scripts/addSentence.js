"use strict";
const models = require('../models');
const Op = models.Sequelize.Op;
const diacritics = require('./utils/removeDiacritics');
const shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

let resolucion;
let proceso;
let caso;
let creado = 0;

module.exports = {
    addSentenceAPI: async (req, res, next) => {
        const t = await models.sequelize.transaction();
        try {
            req.body = req.body.response.docs[0];
            if (!req.body.id) throw new Error("idSolr no encontrado");
            if (!req.body.emerita_derecho) throw new Error("La sentencia no tiene derechos");

            // Comprobamos que no exista ya el idSolr en la base de datos
            let s = await models.Resoluciones.findOne({
                where: {
                    idSolr: req.body.id
                }
            });
            // Si existe, validamos que la sentencia esté correctamente creada
            if (s) {
                throw new Error("Repetida");
            }
            // Miramos si ya existe un proceso con el mismo numero
            let datosProceso = await getDatosProceso(req.body);
            proceso = await models.Procesos.findOne({
                where: {
                    numeroProceso: datosProceso.numeroProceso,
                    OrganosJudicialeId: datosProceso.OrganosJudicialeId,
                    numeroSeccion: datosProceso.numeroSeccion,
                    SalaId: datosProceso.SalaId
                }
            });
            // Si no existe, creamos el proceso y el caso
            if (!proceso) {
                creado = 1;
                caso = await models.Casos.create({
                    jurisdiccion: req.body.jurisdiccion
                });
                datosProceso.CasoId = caso.id;
                proceso = await models.Procesos.create(datosProceso);
            }
            // Si existe, ya tenemos el proceso y buscamos el caso asociado
            else {
                caso = await models.Casos.findById(proceso.CasoId);
                if (!caso) throw new Error("Caso no encontrado");
            }
            // Recogemos los datos de la resolucion
            let datosResolucion = await getDatosResolucion(req.body);
            datosResolucion.ProcesoId = proceso.id;
            // Una vez tenemos todos los datos, creamos la resolucion
            resolucion = await models.Resoluciones.create(
                datosResolucion
            );
            // Añadimos al caso los derechos que no esten (linea de derechos de 6 niveles separada por |)
            let arrayDerechos = [];
            let derechosSinDuplicados = [];
            let listaDerechosDB = [];
            for (let i = 0; i < req.body.emerita_derecho.length; i++) {
                // Si la fila entera no se repite, la añadimos
                if (derechosSinDuplicados.indexOf(req.body.emerita_derecho[i]) < 0) derechosSinDuplicados.push(req.body.emerita_derecho[i]);
            }
            // En cada posicion del array nos queda otro array con los derechos
            for (let i = 0; i < derechosSinDuplicados.length; i++) {
                arrayDerechos[i] = derechosSinDuplicados[i].split("|");
            }
            // Añadimos los derechos a la resolución
            for (let filaDerechos of arrayDerechos) {
                let filaDB = [];
                for (let derecho of filaDerechos) {
                    let derechoDB = await models.Derechos.findOne({
                        where: {
                            nombre: derecho
                        }
                    });
                    // Si no existe el derecho, es que ese nivel está vacío
                    if (!derechoDB) filaDB.push({
                        id: null
                    });
                    else {
                        // Si el nombre del derecho incluye la palabra "faltas", hay que cambiarlo por "delitos"
                        if (derechoDB.nombre.includes("FALTAS") && derechoDB.nivel == 1) {
                            derechoDB = await models.Derechos.findOne({
                                where: {
                                    nombre: derechoDB.nombre.replace("FALTAS", "DELITOS")
                                }
                            });
                        }
                        // Se añade el derecho que viene de la base de datos
                        filaDB.push(await derechoDB.get({
                            raw: true
                        }));
                        // Se crea la relación resolución-derecho
                        await models.ResolucionesDerechos.findOrCreate({
                            where: {
                                ResolucioneId: resolucion.id,
                                DerechoId: derechoDB.id
                            },
                            transaction: t
                        });
                    }
                }
                if (!filaDB[6]) throw new Error("La sentencia no tiene orden");
                // Se crea la relación caso-derechos con la fila entera de derechos
                await models.CasosDerechos.create({
                    CasoId: caso.id,
                    Derecho1Id: filaDB[0].id,
                    Derecho2Id: filaDB[1].id,
                    Derecho3Id: filaDB[2].id,
                    Materia1Id: filaDB[3].id,
                    Materia2Id: filaDB[4].id,
                    Materia3Id: filaDB[5].id,
                    OrdenId: filaDB[6].id
                }, {
                    transaction: t
                });
                // Se añade la fila a la lista de derechos de la resolución traidos de la DB
                listaDerechosDB.push(filaDB);
            }
            // Buscamos la atribución del tipo de fallo detectado
            let tipoFallo = await models.TipoFallos.findOne({
                where: {
                    nombre: req.body.annotator_fallo
                },
                include: [{
                        model: models.Resultados,
                        as: 'ResultadoActivo'
                    },
                    {
                        model: models.Resultados,
                        as: 'ResultadoPasivo'
                    }
                ]
            });
            if (!tipoFallo) throw new Error("Tipo de fallo no encontrado: " + req.body.annotator_fallo);
            // Creamos el fallo asociado a la resolucion
            let fallo = await models.Fallos.create({
                TipoFalloId: tipoFallo.id,
                ResolucioneId: resolucion.id
            }, {
                transaction: t
            });
            // Relaciones
            let profesionalesRelaciones = [];
            if (req.body.annotator_relaciones && req.body.annotator_relaciones.relations && req.body.annotator_relaciones.relations.length > 0) {
                for (let relation of req.body.annotator_relaciones.relations) {
                    for (let relacion of relation.relaciones) {
                        profesionalesRelaciones.push({
                            cliente: relacion.name,
                            profesionalId: relacion.lawyerId.replace(/ /g, "_"),
                            rol: relacion.role,
                            text: relacion.text
                        });
                    }
                }
            }
            // Partes
            // Personas
            if (req.body.annotator_personas && req.body.annotator_personas.length > 0) {
                for (let persona of req.body.annotator_personas) {
                    // Las personas físicas sólo se añaden si ya existían en la base de datos antes (lista cerrada)
                    let parte = await models.Partes.findOne({
                        where: {
                            nombre: persona
                        }
                    });
                    if (parte) {
                        // Añadimos a la parte el id de la base de datos correspondiente
                        profesionalesRelaciones.forEach((el) => {
                            if ((diacritics.removeDiacritics(el.cliente.toUpperCase()) == diacritics.removeDiacritics(persona.toUpperCase())) ||
                                (diacritics.removeDiacritics(el.text.toUpperCase()) == diacritics.removeDiacritics(persona.toUpperCase()))) el.clienteId = parte.id;
                        });
                        // Buscamos el perfil de persona física
                        let perfil = await models.Perfiles.findOne({
                            where: {
                                nombre: "PERSONA FISICA"
                            }
                        });
                        if (!perfil) throw new Error("El perfil no existe");
                        // Miramos si la parte ya tiene un perfil
                        let parteP = await models.Partes.findOne({
                            where: {
                                id: parte.id
                            },
                            include: [{
                                model: models.Perfiles,
                                where: {
                                    nivel: 0
                                }
                            }]
                        });
                        // Si no lo tiene, se lo creamos
                        if (!parteP) {
                            await models.PartesPerfiles.create({
                                ParteId: parte.id,
                                PerfileId: perfil.id
                            }, {
                                transaction: t
                            });
                        }
                        // Creamos la relación de la parte con el caso, si no existe ya
                        await models.PartesCasos.findOrCreate({
                            where: {
                                ParteId: parte.id,
                                CasoId: caso.id
                            },
                            transaction: t
                        });
                    }
                }
            }
            // Empresas
            if (req.body.annotator_empresas && req.body.annotator_empresas.length > 0) {
                for (let empresa of req.body.annotator_empresas) {
                    // Las empresas se crean aunque no estén previamente en la base de datos
                    let parte = await models.Partes.findOrCreate({
                        where: {
                            nombre: empresa
                        },
                        transaction: t
                    });
                    // Se añade la empresa a la relación si existe
                    profesionalesRelaciones.forEach((el) => {
                        if ((diacritics.removeDiacritics(el.cliente.toUpperCase()) == diacritics.removeDiacritics(empresa.toUpperCase())) ||
                            (diacritics.removeDiacritics(el.text.toUpperCase()) == diacritics.removeDiacritics(empresa.toUpperCase()))) el.clienteId = parte[0].id;
                    });
                    // Se busca el perfil de persona jurídica
                    let perfil = await models.Perfiles.findOne({
                        where: {
                            nombre: "PERSONA JURIDICA"
                        }
                    });
                    if (!perfil) throw new Error("El perfil no existe");
                    // Se busca si la parte tiene ya un perfil
                    let parteP = await models.Partes.findOne({
                        where: {
                            id: parte[0].id
                        },
                        include: [{
                            model: models.Perfiles,
                            where: {
                                nivel: 0
                            }
                        }]
                    });
                    // Si no lo tiene, se crea con este
                    if (!parteP) {
                        await models.PartesPerfiles.create({
                            ParteId: parte[0].id,
                            PerfileId: perfil.id
                        }, {
                            transaction: t
                        });
                    }
                    // Se crea la relación entre parte y casos
                    await models.PartesCasos.findOrCreate({
                        where: {
                            ParteId: parte[0].id,
                            CasoId: caso.id
                        },
                        transaction: t
                    });
                }
            }
            // Se buscan las posiciones procesales correspondientes en la DB
            let posicionProcesalActiva = await models.PosicionesProcesales.findOne({
                where: {
                    nombre: 'DEMANDANTE'
                }
            });
            let posicionProcesalPasiva = await models.PosicionesProcesales.findOne({
                where: {
                    nombre: 'DEMANDADO'
                }
            });
            if (!posicionProcesalActiva || !posicionProcesalPasiva) throw new Error("No se encuentran las posiciones procesales");
            // Abogados con posicion activa
            if (req.body.annotator_abogadoFiscalId && req.body.annotator_abogadoFiscalId.length > 0) {
                let abogadosFiscales = req.body.annotator_abogadoFiscalId.map((id, index) => {
                    return {
                        id: id.replace(/ /g, "_"),
                        nombre: req.body.annotator_abogadoFiscalName[index]
                    };
                });
                await insertDatosProfesional(abogadosFiscales, "PROSECUTOR", 0, resolucion.id, profesionalesRelaciones, tipoFallo, fallo.id, tipoFallo.ResultadoActivoId, t, listaDerechosDB, posicionProcesalActiva.id, req.body.calcular);
            }
            // Abogados con posicion pasiva
            if (req.body.annotator_abogadoDefensorId && req.body.annotator_abogadoDefensorId.length > 0) {
                let abogadosDefensores = req.body.annotator_abogadoDefensorId.map((id, index) => {
                    return {
                        id: id.replace(/ /g, "_"),
                        nombre: req.body.annotator_abogadoDefensorName[index]
                    };
                });
                await insertDatosProfesional(abogadosDefensores, "DEFENDER", 0, resolucion.id, profesionalesRelaciones, tipoFallo, fallo.id, tipoFallo.ResultadoPasivoId, t, listaDerechosDB, posicionProcesalPasiva.id, req.body.calcular);
            }
            // Procuradores con posicion activa
            if (req.body.annotator_procuradorFiscalId && req.body.annotator_procuradorFiscalId.length > 0) {
                let procuradoresFiscales = req.body.annotator_procuradorFiscalId.map((id, index) => {
                    return {
                        id: id.replace(/ /g, "_"),
                        nombre: req.body.annotator_procuradorFiscalName[index]
                    };
                });
                await insertDatosProfesional(procuradoresFiscales, "PROSECUTOR", 1, resolucion.id, profesionalesRelaciones, tipoFallo, fallo.id, tipoFallo.ResultadoActivoId, t, listaDerechosDB, posicionProcesalActiva.id, req.body.calcular);
            }
            // Procuradores con posicion pasiva
            if (req.body.annotator_procuradorDefensorId && req.body.annotator_procuradorDefensorId.length > 0) {

                let procuradoresDefensores = req.body.annotator_procuradorDefensorId.map((id, index) => {
                    return {
                        id: id.replace(/ /g, "_"),
                        nombre: req.body.annotator_procuradorDefensorName[index]
                    };
                });
                await insertDatosProfesional(procuradoresDefensores, "DEFENDER", 1, resolucion.id, profesionalesRelaciones, tipoFallo, fallo.id, tipoFallo.ResultadoPasivoId, t, listaDerechosDB, posicionProcesalPasiva.id, req.body.calcular);
            }
            // Magistrados
            if (req.body.annotator_magistradoId && req.body.annotator_magistradoId.length > 0) {

                let magistrados = req.body.annotator_magistradoId.map((id, index) => {
                    return {
                        id: id,
                        nombre: req.body.annotator_magistradoName[index],
                        ponente: req.body.annotator_magistradoName[index] == req.body.ponente ? 1 : 0
                    };
                });
                // Se añaden los jueces
                for (let magistrado of magistrados) {
                    let magistradoDB = await models.Magistrados.findOrCreate({
                        where: {
                            idSolr: magistrado.id
                        },
                        defaults: {
                            nombre: magistrado.nombre
                        },
                        transaction: t
                    });
                    magistradoDB = magistradoDB[0];
                    await models.MagistradosResoluciones.create({
                        MagistradoId: magistradoDB.id,
                        ResolucioneId: resolucion.id,
                        ponente: magistrado.ponente
                    }, {
                        transaction: t
                    });
                }
            }
            t.commit();
            return res.status(200).send({
                status: "ok"
            });
        } catch (err) {
            try {
                if (t) await t.rollback();
                if (caso && creado) await caso.destroy();
                if (resolucion) await resolucion.destroy();
                if (proceso && creado) await proceso.destroy();
            } catch (err) {
                return next({
                    status: 400,
                    error: err,
                    message: {
                        status: "error",
                        error: err.message
                    }
                });
            }
            return next({
                status: 400,
                error: err,
                message: {
                    status: "error",
                    error: err.message
                }
            });
        }
    },
    calcularEstadisticasAbogado: async (req, res, next) => {
        try {
            if (!req.params.idSolr) throw new Error("Faltan argumentos");
            await calcularEstadisticas(req.params.idSolr.replace(/ /g, "_"), 0);
            return res.status(200).send({
                status: "ok"
            });
        } catch (err) {
            return next({
                status: 400,
                error: err,
                message: {
                    status: "error",
                    error: err.message
                }
            });
        }
    },
    calcularEstadisticasProcurador: async (req, res, next) => {
        try {
            if (!req.params.idSolr) throw new Error("Faltan argumentos");
            await calcularEstadisticas(req.params.idSolr.replace(/ /g, "_"), 1);
            return res.status(200).send({
                status: "ok"
            });
        } catch (err) {
            return next({
                status: 400,
                error: err,
                message: {
                    status: "error",
                    error: err.message
                }
            });
        }
    },
    calcularEstadisticas
};

async function calcularEstadisticas(id, tipo) {
    try {
        let profesional = await models.ProfesionalesEstadisticas.findOne({
            where: {
                idSolr: id,
                tipo: tipo
            }
        });
        if (!profesional) throw {
            error: new Error("Profesional no encontrado. Id: " + id),
            message: "Profesional no encontrado",
            status: 404
        };
        // Globales
        profesional.numeroResoluciones = await models.ProfesionalesResoluciones.count({
            where: {
                ProfesionalesEstadisticaId: profesional.id
            }
        });
        let resolucionesTasaExito = await models.Resoluciones.findAll({
            attributes: ['id'],
            include: [{
                    required: true,
                    model: models.Fallos,
                    attributes: ['id'],
                    include: [{
                        required: true,
                        model: models.FallosPartes,
                        attributes: ['FalloId', 'ResultadoId'],
                        where: {
                            ProfesionalesEstadisticaId: profesional.id
                        },
                        include: [{
                            required: true,
                            model: models.Resultados,
                            attributes: ['id', 'scoringTasaExito'],
                            where: {
                                scoringTasaExito: {
                                    $ne: null
                                }
                            }
                        }]
                    }]
                },
                {
                    required: true,
                    model: models.ProfesionalesEstadisticas,
                    attributes: ['id'],
                    where: {
                        id: profesional.id
                    }
                }
            ]
        });
        if (resolucionesTasaExito.length > 0) {
            let ganadas = 0;
            for (let resolucion of resolucionesTasaExito) {
                ganadas += resolucion.Fallos[0].FallosPartes[0].Resultado.scoringTasaExito;
            }
            profesional.resolucionesTasaExito = resolucionesTasaExito.length;
            profesional.tasaExito = ganadas / resolucionesTasaExito.length;
        } else {
            profesional.resolucionesTasaExito = 0;
            profesional.tasaExito = 0;
        }

        await profesional.save();

        // Por derecho
        let pDerechos = await models.ProfesionalesDerechos.findAll({
            where: {
                ProfesionalesEstadisticaId: profesional.id
            }
        });
        for (let pDerecho of pDerechos) {
            let resolucionesTasaExitoDerecho = await models.Resoluciones.findAll({
                attributes: ['id'],
                include: [{
                        required: true,
                        model: models.Fallos,
                        attributes: ['id'],
                        include: [{
                            required: true,
                            model: models.FallosPartes,
                            attributes: ['FalloId', 'ResultadoId'],
                            where: {
                                ProfesionalesEstadisticaId: profesional.id
                            },
                            include: [{
                                required: true,
                                model: models.Resultados,
                                attributes: ['id', 'scoringTasaExito'],
                                where: {
                                    scoringTasaExito: {
                                        $ne: null
                                    }
                                }
                            }]
                        }]
                    },
                    {
                        required: true,
                        model: models.Derechos,
                        attributes: ['id'],
                        where: {
                            id: pDerecho.DerechoId
                        }
                    },
                    {
                        required: true,
                        model: models.ProfesionalesEstadisticas,
                        attributes: ['id'],
                        where: {
                            id: profesional.id
                        }
                    }
                ]
            });
            if (resolucionesTasaExitoDerecho.length > 0) {
                let ganadas = 0;
                for (let resolucion of resolucionesTasaExitoDerecho) {
                    ganadas += resolucion.Fallos[0].FallosPartes[0].Resultado.scoringTasaExito;
                }
                pDerecho.resolucionesTasaExito = resolucionesTasaExitoDerecho.length;
                pDerecho.tasaExito = ganadas / resolucionesTasaExitoDerecho.length;
            } else {
                pDerecho.resolucionesTasaExito = 0;
                pDerecho.tasaExito = 0;
            }
            pDerecho.numeroResoluciones = await models.Resoluciones.count({
                include: [{
                        required: true,
                        model: models.Derechos,
                        where: {
                            id: pDerecho.DerechoId
                        }
                    },
                    {
                        required: true,
                        model: models.ProfesionalesEstadisticas,
                        where: {
                            id: profesional.id
                        }

                    }
                ]
            });
            if (pDerecho.numeroResoluciones == 0) {
                await pDerecho.destroy();
            } else {
                let derechoDB = await models.Derechos.findById(pDerecho.DerechoId);
                let resolucionesNivel = await models.Resoluciones.count({
                    include: [{
                            required: true,
                            model: models.Derechos,
                            where: {
                                nivel: derechoDB.nivel
                            }
                        },
                        {
                            required: true,
                            model: models.ProfesionalesEstadisticas,
                            where: {
                                id: profesional.id
                            }

                        }
                    ]
                });
                pDerecho.porcentajeEspecializacion = pDerecho.numeroResoluciones / resolucionesNivel;
                await pDerecho.save();
            }
        }
    } catch (err) {
        throw err;
    }
}

/**
 * Devuelve un objeto tipo sequelize con los datos del proceso
 * @param {any} body 
 * @returns {Promise<{numeroSeccion: number, numeroProceso: number, SalaId: number, OrganosJudicialeId: number, InstanciaId: number}>}
 */
async function getDatosProceso(body) {
    let datosProceso = {};
    datosProceso.numeroSeccion = body.tipo_organo_seccion;
    datosProceso.numeroProceso = body.numero_recurso;
    if (body.annotator_tipo_organo_sala) {
        let sala = await models.Salas.findOne({
            where: {
                nombre: body.annotator_tipo_organo_sala
            }
        });
        if (sala) {
            datosProceso.SalaId = sala.id;
        } else throw new Error("Sala no encontrada " + body.annotator_tipo_organo_sala);
    }
    if (body.annotator_tipo_organo && body.annotator_tipo_organo_municipio) {

        let partido = await models.OrganosJudiciales.findOne({
            where: {
                nombre: body.annotator_tipo_organo,
                localizacion: body.annotator_tipo_organo_municipio,
                provincia: body.annotator_tipo_organo_provincia,
                comunidad: body.annotator_tipo_organo_region
            }
        });
        if (partido) {
            datosProceso.OrganosJudicialeId = partido.id;
        } else throw new Error("Partido no encontrado");

        if (body.instancia && body.instancia != null) {
            let instancia = await models.Instancias.findOne({
                where: {
                    nombre: body.instancia
                }
            });
            if (instancia) {
                datosProceso.InstanciaId = instancia.id;
            } else throw new Error("Instancia no encontrada");
        }
    }
    return datosProceso;
}


/**
 * Devuelve un objeto tipo sequelize con los datos de la resolucion
 * @param {any} body 
 * @returns {Promise<{idSolr: string, fecha: string, year: string, numeroResolucion: string, tipoResolucion: string}>}
 */
async function getDatosResolucion(body) {

    let resolucion = {};
    /* idSolr */
    resolucion.idSolr = body.id;
    /* Fecha */
    resolucion.fecha = body.fecha_resolucion;
    /* Año */
    resolucion.year = body.ano_resolucion;
    /* Número de resolución */
    resolucion.numeroResolucion = body.numero_resolucion;
    /* Tipo de resolución */
    resolucion.tipoResolucion = body.tipo_resolucion;

    return resolucion;
}

async function actualizarEstadisticasBasicas(profesional, listaDerechos, resultado, t, calcular) {
    try {
        if (calcular == 1) profesional.numeroResoluciones++;
        if (resultado.scoringTasaExito != null && calcular == 1) calcularTasaExito(profesional, resultado, t);
        for (let fila of listaDerechos) {
            for (let derecho of fila) {
                if (derecho.id) {
                    let profesionalDerecho = await models.ProfesionalesDerechos.findOrCreate({
                        where: {
                            DerechoId: derecho.id,
                            ProfesionalesEstadisticaId: profesional.id
                        },
                        transaction: t
                    });
                    profesionalDerecho = profesionalDerecho[0];
                    if (calcular == 1) profesionalDerecho.numeroResoluciones++;
                    if (resultado.scoringTasaExito != null && calcular == 1) calcularTasaExito(profesionalDerecho, resultado, t);
                }
            }
        }
    } catch (err) {
        throw err;
    }
}

async function calcularTasaExito(profesional, resultado, t) {
    let ganadas = profesional.tasaExito * profesional.resolucionesTasaExito;
    profesional.resolucionesTasaExito++;
    profesional.tasaExito = (ganadas + resultado.scoringTasaExito) / profesional.resolucionesTasaExito;
    profesional.tasaExito = (Math.round(profesional.tasaExito * 1000) / 1000);
    await profesional.save({
        transaction: t
    });
}

async function insertDatosProfesional(profesionales, rolAnotador, tipo, resolucionId, profesionalesRelaciones, tipoFallo, falloId, resultadoId, t, listaDerechosDB, posicionProcesalId, calcular) {
    for (let profesional of profesionales) {
        profesional.id = profesional.id.replace(/ /g, "_");
        let profesionalDB = await models.ProfesionalesEstadisticas.findOrCreate({
            where: {
                idSolr: profesional.id
            },
            defaults: {
                nombre: profesional.nombre,
                anonymous_id: shortid.generate(),
                tipo: tipo
            },
            transaction: t
        });
        profesionalDB = profesionalDB[0];
        await models.ProfesionalesResoluciones.create({
            ProfesionalesEstadisticaId: profesionalDB.id,
            ResolucioneId: resolucionId
        }, {
            transaction: t
        });
        // Si en las relaciones está el id del profesional se traen sus relaciones
        // Si no está el id, se comprueba si hay partes con la misma posición procesal (sólo si hay un único abogado en esta posición procesal)
        let profesionalRelaciones = profesionalesRelaciones.filter((el) => {
            return el.profesionalId == profesional.id || (el.rol == rolAnotador && profesionales.length == 1);
        });
        // Se crea la relación en la base de datos
        if (profesionalRelaciones.length > 0) {
            for (let relacion of profesionalRelaciones) {
                if (falloId && resultadoId && profesionalDB.id) {
                    await models.FallosPartes.create({
                        FalloId: falloId,
                        ResultadoId: resultadoId,
                        ProfesionalesEstadisticaId: profesionalDB.id,
                        PosicionesProcesaleId: posicionProcesalId,
                        ParteId: relacion.clienteId || null
                    }, {
                        transaction: t
                    });
                }
            }
        } else {
            await models.FallosPartes.create({
                FalloId: falloId,
                ResultadoId: resultadoId,
                ProfesionalesEstadisticaId: profesionalDB.id,
                PosicionesProcesaleId: posicionProcesalId
            }, {
                transaction: t
            });
        }
        await actualizarEstadisticasBasicas(profesionalDB, listaDerechosDB, tipoFallo.ResultadoActivo, t, calcular);
    }
}