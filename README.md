[![Stories in Ready](https://badge.waffle.io/Professional-Hobo/PokeMMOn.png?label=ready&title=Ready)](https://waffle.io/Professional-Hobo/PokeMMOn)
PokeMMOn
========

Install
=======
Run ./install if you are on a fresh Linux box running Ubuntu and want to have everything setup and ready to go out of the box.

This script will install the necessary packages using apt-get, install the latest version of nodejs, and setup a Mongo PokeMMOn database and user.

It'll then execute the setup script to download assets as well as the run script which actually launches the web and game servers.

Setup
=====
Setup will fetch the necessary PokeMMOn assets and run npm install for the web and game server.

Run
===
Run launches the web and game servers in a tmux session. Make sure that you have run install (if needed) and setup first before attempting to launch the game!

Config
======
If you are running PokeMMOn behind a reverse proxy such as NGINX, make sure to include an extra header called `uri` that contains the `$request_uri`.

```
proxy_set_header uri $request_uri;
```

Also, make sure to change the `behindReverseProxy` setting to true in `settings.json`.
This is required in order for Express to know all of the proper relative paths. If you are however just running off of localhost or an IP, you shouldn't have to change anything.

Credits
=======
Pokemon Sprites are from http://www.pkparaiso.com/
