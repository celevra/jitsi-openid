"use strict";
const fs = require('fs');
const path = require('path');
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const jwt = require('jsonwebtoken');
const app = express();
const server = require('http').createServer(app);

const cors = require('cors');
app.use(cors({
    origin: '*'
}));

//------------------ openId Connect --------------------------

app.use(
  auth({
    issuerBaseURL: 'https://login.xxx.net/realms/z',
    baseURL: 'https://auth.meet.xxx.net',
    clientID: 'meet',
    secret: 'internal super secure secret',
    clientSecret: 'copied from keycloak',
    idpLogout: true,
    authRequired: false
  })
);

//------------------ openId Connect --------------------------


const jwtSecret = 'bQm57pORfMwozJLiKe3zGD8CSS0Zo9Aq'
const jitsiURL = 'meet.xxx.net'

//------------------ don't change below this line ------------

app.get('/:room', requiresAuth(), function(req,res) {
    if(req.oidc.isAuthenticated())
    {

      let json = {
        aud: 'jitsi',
        context: {
          user: {
            name: req.oidc.user.name,
            email: req.oidc.user.email
          }
        },
        moderator: true,
        nbf: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000)+8*60*60,
        room: '*',
        iss: 'jitsi',
        sub: jitsiURL
      }
      let token = jwt.sign(json, jwtSecret)


      res.redirect('https://'+jitsiURL+'/'+encodeURI(req.params.room)+'?jwt='+token+'&#config.prejoinConfig.enabled=false')

    }
    res.send('error')
})

const port = 3000;
server.listen(port, function() {
    console.log("listening on port " + port);
});
