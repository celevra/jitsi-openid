simple Script to integrate openid with jisti, the flow is as follow:
1. you open and join a jitsi meeting
2. jitsi tells you that you have to wait for a moderator
3. you click i'm a moderator
4. jitsi redirectsyou to this script, it authenticates you and sends you back to jitsi
5. you directly join back as moderator

# installation
create a client in keycloak

<img width="413" alt="image" src="https://github.com/celevra/jitsi-openid/assets/232437/d9eafdcd-8293-450d-a420-0843ea0de347">

copy the secret under credentials

```
git clone https://github.com/celevra/jitsi-openid.git && cd jitsi-openid
```
change the variables in jitsi-openid.js

```
npm install express express-openid-connect cors jsonwebtoken
npm install -g pm2
pm2 start jitsi-openid.js
pm2 save
pm2 startup
```

create a nginx reverse proxy with ssl
```
server {
       listen         80;
       listen         [::]:80;
       server_name    auth.meet.xxx.net;

        root /var/www/html;

        include /etc/nginx/snippets/letsencrypt-acme-challenge.conf;

       location / {
               return         301 https://auth.meet.xxx.net$request_uri;
       }
}
server {
    listen  443 ssl http2;
    listen  [::]:443 ssl http2;
    server_name         auth.meet.xxx.net;
    server_tokens off;
    keepalive_timeout   70;

    modsecurity on;
    modsecurity_rules_file /etc/nginx/modsec/main.conf;
    ssl_certificate /etc/letsencrypt/live/auth.meet.xxx.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/auth.meet.xxx.net/privkey.pem;
    ssl_dhparam /etc/ssl/certs/dhparam.pem;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';

  ##
  # disallow access to . directories
  ##

  location ~ /\.  { return 403; }

  location / {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Real-IP  $remote_addr;
    proxy_set_header Host $host;
    proxy_http_version 1.1;
    proxy_pass http://localhost:3000;
  }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /var/www/status;
    }
}
```

change following vars in jtisi env
```
# Select authentication type: internal, jwt or ldap
AUTH_TYPE=jwt

# Application identifier
JWT_APP_ID=jitsi
# Application secret known only to your token
JWT_APP_SECRET=superSecureSecret
TOKEN_AUTH_URL=https://auth.meet.xxx.net/{room}
```
