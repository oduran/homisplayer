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

4- homismanagement klasörü üzerine:
npm install express -> web servisler için
npm install mongodb -> mongo connect işi için
npm install bcrypt -> password encryption için

=======================
  Web Servisler
=======================
/* Save user */
var data = { accesstoken:"5", user: {name:"ali",surname:"veli", type:"admin"} };
$.ajax({
  type: "POST",
  url: "http://192.168.2.99:8080/service/saveuser",
  data: data,
  success: function(data){debugger;},
  error: function(error){debugger;}
});


/* Save Workspace*/
var data = { accesstoken:"5", workspace: {workspaceId: "bir", falan:"falan", filan:"filan"}};
$.ajax({
  type: "POST",
  url: "http://192.168.2.99:8080/service/saveworkspace",
  data: data,
  success: function(data){debugger;},
  error: function(error){debugger;}
});


var data = { accesstoken:"5", workspaceId: "bir"};
$.ajax({
  type: "POST",
  url: "http://192.168.2.99:8080/service/getworkspace",
  data: data,
  success: function(data){debugger;},
  error: function(error){debugger;}
});

