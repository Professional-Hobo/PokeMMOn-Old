PokeMMOn
========

Fetch Assets
============
Make sure you run ./setup.sh first in order to download assets and setup web/game servers.

Database Setup
==============
Comment the following in models/Users.js and models/World.js and then ./run      

```
migrate: 'safe'      
```

After running successfully, terminate your server and uncomment the lines you just commented.

Running
=======
Verify that your settings.json are correct.
Run ./run from the root directory in order to run both the webserver and game server in a split tmux view.

Credits
=======
Pokemon Sprites are from http://www.pkparaiso.com/
