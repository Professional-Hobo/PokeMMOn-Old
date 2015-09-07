PokeMMOn
========

Fetch Assets
============
Make sure you run ./setup.sh first in order to download assets and setup web/game servers.

Database Setup
==============
Execute ./run and after it is finished initializing, quit the server.
Next, navigate to models/Users.js and models/Server.js and uncomment `migrate: 'safe'`.

The database should be properly set up now.

Running
=======
Verify that your settings.json are correct.
Run ./run from the root directory in order to run both the webserver and game server in a split tmux view.

Credits
=======
Pokemon Sprites are from http://www.pkparaiso.com/
