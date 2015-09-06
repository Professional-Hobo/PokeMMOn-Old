#!/bin/bash
NODE_VERSION=0.12.7
echo "Elevating permissions to root"
sudo echo "Permissions elevated to root"
sudo apt-get update
sudo apt-get install postgresql redis-server build-essential openssl libssl-dev curl libtool git tmux -y;
wget http://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION.tar.gz;
tar xfv node-v$NODE_VERSION.tar.gz;
cd node-v$NODE_VERSION;
./configure;
make;
sudo make install;
cd ..;
rm -rf node-v$NODE_VERSION;
git clone https://github.com/keitharm/PokeMMOn;
sudo su - postgres -c "psql -c \"CREATE USER pokemmon WITH PASSWORD 'pokemmon'\"";
sudo su - postgres -c "psql -c \"CREATE DATABASE pokemmon\"";
sudo su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE pokemmon to pokemmon\"";
cd PokeMMOn;
./setup.sh
./run
