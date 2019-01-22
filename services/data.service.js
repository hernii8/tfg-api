const models = require('../models');
const Op = models.sequelize.Op;

module.exports = {
    getDatos: async ({abogado, posicionId, perfilId, juezId, derechoId, materiaId, fecha}) => {
        try{
        let porcentajeEspecializacion = await models.sequelize.query(
            `
                    SELECT porcentajeEspecializacion from ProfesionalesDerechos where ProfesionalesEstadisticaId = :id and DerechoId = :derechoId;
                    `, {
                replacements: {
                    id: abogado.id,
                    derechoId: materiaId
                },
                type: models.sequelize.QueryTypes.SELECT
            }
        );
        if (!porcentajeEspecializacion[0]) porcentajeEspecializacion = 0;
        else porcentajeEspecializacion = Math.round(porcentajeEspecializacion[0].porcentajeEspecializacion * 1000) / 1000;
        let year = new Date(fecha).getFullYear();
        let antiguedadAbogado = year - new Date(abogado.alta_colegiacion).getFullYear();
        let antiguedadLow = 0;
        let antiguedadUp = 5;
        if(antiguedadAbogado > 5 && antiguedadAbogado <= 10){ antiguedadLow = 5; antiguedadUp = 10;}
        else if(antiguedadAbogado > 10 && antiguedadAbogado <= 15){ antiguedadLow = 10; antiguedadUp = 15;}
        else if(antiguedadAbogado > 15){ antiguedadLow = 15; antiguedadUp = null;}
        let medias = await module.exports.getMedias(derechoId, posicionId, perfilId, abogado.comunidad, antiguedadUp, antiguedadLow, year);
        let datosAbogadoPerfilPosicion = await getDatosResolucionesAbogado(abogado.id, materiaId, perfilId, posicionId, fecha);
        let datosAbogadoPerfil = await getDatosResolucionesAbogado(abogado.id, materiaId, perfilId, null, fecha);
        let datosAbogadoPosicion = await getDatosResolucionesAbogado(abogado.id, materiaId, null, posicionId, fecha);
        let datosAbogadoDerecho = await getDatosResolucionesAbogado(abogado.id, materiaId, null, null, fecha);
        let relacion = await getRelacionAbogadoJuez(abogado.id, juezId, fecha);
        let datosJuez = await getDatosJuez(juezId, materiaId, fecha);
        return {
            porcentajeEspecializacion,
            antiguedadAbogado,
            medias,
            datosAbogadoPerfilPosicion,
            datosAbogadoPerfil,
            datosAbogadoPosicion,
            datosAbogadoDerecho,
            relacion,
            datosJuez
        }
        }
        catch(err){
            throw err;
        }
    },
    getMedias: async function (DerechoId, PosicioneProcesaleId, PerfileId, comunidad, antiguedadUp, antiguedadLow, year) {
        try {
           /* Se pasan los argumentos a un array */
           var args = Array.prototype.slice.call(arguments, 0);
           console.log(args);

           /* Si el argumento es null, se busca por is null, si es true, se busca por is not null */
           for (let i = 0; i < args.length; i++) {
              if (args[i] === null) {
                 args[i] = {
                    [Op.eq]: null
                 };
              }
              if (args[i] === true) {
                 args[i] = {
                    [Op.ne]: null
                 };
              }
           }
           let medias = await models.Medias.findAll({
              where: {
                 DerechoId: args[0],
                 PosicionesProcesaleId: args[1],
                 PerfileId: args[2],
                 comunidad: args[3],
                 antiguedadUp: args[4],
                 antiguedadLow: args[5],
                 year: args[6]
              }
           }).map(el => el.get({
              plain: true
           }));
           /* Si solo hay una media, se pasa como un objeto, sino, se pasa como un array */
           if (!medias || medias.length == 0) throw {
              error: new Error("No hay medias para este derecho"),
              message: "No hay medias en el derecho",
              status: 404
           };
           else if (medias.length == 1) return medias[0];
           else return medias;
        } catch (err) {
           throw err;
        }
     }  
}

async function getDatosJuez(juezId, derechoId, fecha) {
    let firstYear = await models.sequelize.query(`
    select min(year) as year from Resoluciones R join MagistradosResoluciones MR on MR.ResolucioneId = R.id join Magistrados M on M.id = MR.MagistradoId 
    where M.id = :juezId;
    `, {
        replacements: {
            juezId: juezId
        },
        type: models.sequelize.QueryTypes.SELECT
    });
    firstYear = firstYear[0].year;
    let antiguedad = new Date(fecha).getFullYear() - firstYear;
    let resoluciones = await models.sequelize.query(`
    select count(*) as count from Resoluciones R join MagistradosResoluciones MR on MR.ResolucioneId = R.id join Magistrados M on M.id = MR.MagistradoId  
    join ResolucionesDerechos RD on RD.ResolucioneId = R.id where M.id = :juezId and R.fecha < :fecha and RD.DerechoId = :derechoId;
    `, {
        replacements: {
            juezId: juezId,
            fecha: fecha,
            derechoId: derechoId
        },
        type: models.sequelize.QueryTypes.SELECT
    });
    resoluciones = resoluciones[0].count;
    let fallos = await models.sequelize.query(`
    select TF.nombre, count(*) as count from Resoluciones R join Fallos F on F.ResolucioneId = R.id join TipoFallos TF on TF.id = F.TipoFalloId 
    join MagistradosResoluciones MR on MR.ResolucioneId = R.id join Magistrados M on M.id = MR.MagistradoId join ResolucionesDerechos RD on RD.ResolucioneId = R.id
    where M.id = :juezId and R.fecha < :fecha and RD.DerechoId = :derechoId and TF.nombre in ('ESTIMATORIO PARCIAL', 'ESTIMATORIO', 'DESESTIMATORIO') group by TF.nombre;
    `, {
        replacements: {
            juezId: juezId,
            fecha: fecha,
            derechoId: derechoId
        },
        type: models.sequelize.QueryTypes.SELECT
    });
    
    return {
        antiguedad: antiguedad,
        resoluciones: resoluciones,
        fallos: fallos
    }
}

async function getRelacionAbogadoJuez(abogadoId, juezId, fecha) {
    let ganadas = await models.sequelize.query(`
    select sum(c2) as sum from (SELECT PES.id, scoringTasaExito as c2 FROM Resoluciones R join Fallos F on F.ResolucioneId = R.id
    join FallosPartes FP on FP.FalloId = F.id join ProfesionalesEstadisticas PES 
       on PES.id = FP.ProfesionalesEstadisticaId join Resultados RE on RE.id = FP.ResultadoId join MagistradosResoluciones MR on MR.ResolucioneId = R.id 
       join Magistrados M on M.id = MR.MagistradoId 
       where M.id = :juezId and PES.id = :abogadoId 
       and RE.scoringTasaExito is not null  and R.fecha < :fecha group by PES.id, scoringTasaExito, F.id) as a;
    `, {
        replacements: {
            juezId: juezId,
            abogadoId: abogadoId,
            fecha: fecha
        },
        type: models.sequelize.QueryTypes.SELECT
    });
    let resoluciones = await models.sequelize.query(`
    select count(*) as count from Resoluciones R join ProfesionalesResoluciones PR on PR.ResolucioneId = R.id join ProfesionalesEstadisticas PES 
    on PES.id = PR.ProfesionalesEstadisticaId join MagistradosResoluciones MR on MR.ResolucioneId = R.id join Magistrados M on M.id = MR.MagistradoId 
    where M.id = :juezId and PES.id = :abogadoId and R.fecha < :fecha;
    `, {
        replacements: {
            juezId: juezId,
            abogadoId: abogadoId,
            fecha: fecha
        },
        type: models.sequelize.QueryTypes.SELECT
    });

    ganadas = ganadas[0];
    resoluciones = resoluciones[0];
    return {
        total: resoluciones.count,
        tasaExito: resoluciones.count ? Math.round((ganadas.sum / resoluciones.count) * 1000) / 1000 : 0
    };
}

async function getDatosResolucionesAbogado(abogadoId, derechoId, perfilId, posicionId, fecha) {
    let q = "";
    if (perfilId) {
        q = q + ` and PE.id = "` + perfilId + `" `;
    }
    if (posicionId) q = q + ` and PP.id = "` + posicionId + `" `;
    let ganadas = await models.sequelize.query(`
    select sum(c2) as sum from (SELECT PES.id, scoringTasaExito as c2 FROM Resoluciones R join Fallos F on F.ResolucioneId = R.id
    join FallosPartes FP on FP.FalloId = F.id join ProfesionalesEstadisticas PES 
       on PES.id = FP.ProfesionalesEstadisticaId left join Partes P on P.id = 
       FP.ParteId join PosicionesProcesales PP on FP.PosicionesProcesaleId = PP.id join Resultados RE on RE.id = FP.ResultadoId
       left join PartesPerfiles PAP on PAP.ParteId = P.id left join Perfiles PE on PAP.PerfileId = 
       PE.id join ResolucionesDerechos RD on RD.ResolucioneId = R.id join ProfesionalesDerechos PD 
       on PD.ProfesionalesEstadisticaId = PES.id and RD.DerechoId = PD.DerechoId where RD.DerechoId = :derechoId and PES.id = :abogadoId 
       and RE.scoringTasaExito is not null  and R.fecha < :fecha ` + q + ` group by PES.id, scoringTasaExito, F.id) as a;
    `, {
        replacements: {
            derechoId: derechoId,
            abogadoId: abogadoId,
            fecha: fecha
        },
        type: models.sequelize.QueryTypes.SELECT
    });
    let resoluciones = await models.sequelize.query(`
    select count(*) as count from (SELECT PES.id, scoringTasaExito FROM Resoluciones R join Fallos F on F.ResolucioneId = R.id
    join FallosPartes FP on FP.FalloId = F.id join ProfesionalesEstadisticas PES 
       on PES.id = FP.ProfesionalesEstadisticaId left join Partes P on P.id = 
       FP.ParteId join PosicionesProcesales PP on FP.PosicionesProcesaleId = PP.id join Resultados RE on RE.id = FP.ResultadoId
       left join PartesPerfiles PAP on PAP.ParteId = P.id left join Perfiles PE on PAP.PerfileId = 
       PE.id join ResolucionesDerechos RD on RD.ResolucioneId = R.id join ProfesionalesDerechos PD 
       on PD.ProfesionalesEstadisticaId = PES.id and RD.DerechoId = PD.DerechoId where RD.DerechoId = :derechoId and PES.id = :abogadoId
        and RE.scoringTasaExito is not null  and R.fecha < :fecha ` + q + ` group by PES.id, scoringTasaExito, F.id) as a;
    `, {
        replacements: {
            derechoId: derechoId,
            abogadoId: abogadoId,
            fecha: fecha
        },
        type: models.sequelize.QueryTypes.SELECT
    });

    ganadas = ganadas[0];
    resoluciones = resoluciones[0];
    return {
        total: resoluciones.count,
        tasaExito: resoluciones.count ? Math.round((ganadas.sum / resoluciones.count) * 1000) / 1000 : 0
    };
}