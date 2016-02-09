1- node modellerini yükleme kerberos sıkıntısı için : 
sudo apt-get install libkrb5-dev
2- mongodb install:

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927

echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list

sudo apt-get update

sudo apt-get install -y mongodb-org

bunlardan sonra veritabanı yeri değiştirmek için : /etc/mongod.conf
şu an kullanılan veritabanı:
 /datadrive/database/mongodb
log file için : 
 /datadrive/database/mongodlog/mongod.log

3- proje klasörü:
/datadrive/homis/homismanagement
içinde application.js olmalı.

4- windows bcrypt install problemi için:
python 2.7 yükle
npm install -g node-gyp
npm config set msvs_version 2013 --global

5- homismanagement klasörü üzerine:
npm install express -> web servisler için
npm install mongodb -> mongo connect işi için
npm install bcrypt -> password encryption için
