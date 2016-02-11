1- install mongodb
2- add to windows path (environmental variables) -> C:\Program Files\MongoDB\Server\3.2\bin
3- create folders: /data -> /data/db -> /data/log
4- create cfg file -> mongod.cfg
systemLog:
    destination: file
    path: c:\data\log\mongod.log
storage:
    dbPath: c:\data\db
5- run this:
mongod --config "C:\mongodb\mongod.cfg" --install
6- 
net stop MongoDB

To uninstall service:
mongod --remove