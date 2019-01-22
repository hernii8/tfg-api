
module.exports = (err, req, res, next) => {
   if (err instanceof Error) {
      const errAux = err;
      err = {};
      err.error = errAux;
   } else if (typeof err.error === 'string' || !err.error) {
      err.error = new Error(err.error);
   }
   const code = err.error.code;
   const status = ((err.status >= 100 && err.status < 600)) ? err.status : 500;
   console.log(err.error.stack);
   const msg = status >= 500 ? 'Ha habido un error' : err.message || err.error.message || 'Ha habido un error';
   return res.status(status).send(msg);
};
