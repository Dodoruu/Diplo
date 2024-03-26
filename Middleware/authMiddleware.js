const jwt = require('jsonwebtoken');
const secretKey = 'dein_geheimer_schluessel';


module.exports = function (req, res, next) {
    console.log (req.cookies);
    if (!req.cookies?.jwt){
      return res.status(401).send({ success: false, error: 'No Token Provided' });
    }
    jwt.verify(req.cookies.jwt, secretKey, (err, user)=> {
      if (err){
        console.log(err)
        return res.status(401).send({ success: false, error: 'Token Invalid' });
        
      }
      req.jwt = user;
      next()
    })
  }