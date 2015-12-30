#!/bin/bash
NODE_VERSION=4.2.4
echo "Elevating permissions to root"
sudo echo "Permissions elevated to root"
sudo apt-get update
sudo apt-get install redis-server build-essential openssl libssl-dev curl libtool git tmux mongodb libkrb5-dev -y;
wget http://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION.tar.gz;
tar xfv node-v$NODE_VERSION.tar.gz;
cd node-v$NODE_VERSION;
./configure;
make;
sudo make install;
cd ..;
rm -r node-v$NODE_VERSION;
rm node-v$NODE_VERSION.tar.gz;
mongo < mongoSetup.txt
rm mongoSetup.txt
./setup.sh
./run
