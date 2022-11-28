//const expressJwt = require ('express-jwt') // OLD method. Given in code
var { expressjwt: jwt } = require("express-jwt"); //New method found in express-jwt documentation

function authJwt() {
  //Declare secret for passing in JWT as a function
  const secret = process.env.secret_for_jwt;
  //Declare API URL for path exclusions
  const api = process.env.API_URL;
  //return secret
  return (
    jwt({
      secret,
      algorithms: ["HS256"],
      isRevoked: isRevoked,
    })
      //For excluding 'api/v1/users/login' path from authentication, as we need it for token

      //OLD METHOD, which has an issue.
      // .unless ({
      //     path: [
      //         {url:`${api}/products`, methods:['GET', 'OPTIONS']}, // THis will exclude Products API GET and OPTIONS methods as a non registered user can only view the products
      //         `${api}/users/login`,
      //         `${api}/users/register`
      //     ]
      // })

      //New Method using Regular Expressions or REGEX
      .unless({
        path: [
          //Allow Access only to Admin

          { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
          { url: /\api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
          { url: /\api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
          { url: /\/api\/v1\/orders(.*)/, methods: ["GET", "OPTIONS", "POST"] },
          {
            url: /\/api\/v1\/sendemail(.*)/,
            methods: ["GET", "OPTIONS", "POST"],
          },
          { url: /\/api\/v1\/users(.*)/, methods: ["GET", "OPTIONS", "POST"] },
          `${api}/users/login`,
          `${api}/users/register`,

          //ALLOW ALL
          // { url: /(.*)/ }
        ],
      })
  );
}

//Define Userrole. Refer manual day 6

//Code in lecture 52 is incorrect. Refer to the code below
//token contains payload, and we reject the token is user is not admin

async function isRevoked(req, token) {
  //console.log(token);

  //If user is not admin
  if (!token.payload.isAdmin) {
    return true; //Reject the token
  }
  return false; // Else accept the token
}

// async function isRevoked (res, token) {
//     if(!token.payload.isAdmin) {
//         return res.status(401).json({ message: "User authentication failed. Token Rejected"} )
//     }

//     return token();
// }

//Export the module for using in app.js middleware
module.exports = authJwt;
