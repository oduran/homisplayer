1- sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
2- echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
3- sudo apt-get update
4- sudo apt-get install -y mongodb-org=3.2.3 mongodb-org-server=3.2.3 mongodb-org-shell=3.2.3 mongodb-org-mongos=3.2.3 mongodb-org-tools=3.2.3
5- /etc/mongod.conf -> db için /datadrive/database/mongodb, log için /datadrive/database/mongodlog/mongod.log
6- sudo service mongod start