+Ekran karti driver => mailde var
wireless driver?

node, npm ve node webkit kurulumları:
sudo apt-get update
sudo apt-get install openssh-server 
install unclutter -> sudo apt-get install unclutter = rasberry'de de var
sudo apt-get install nodejs
sudo apt-get install nodejs-legacy
sudo apt-get install npm
sudo npm install nwjs -g
sudo npm install nodewebkit -g
node webkit libudev problemi için ->sudo ln -sf /lib/$(arch)-linux-gnu/libudev.so.1 /lib/$(arch)-linux-gnu/libudev.so.0
homisstartup.desktop -> /etc/xdg/autostart/
power management'ı kapatmak için -> xset s off -> statapp.sh scriptine yazıldı.
deployment folder: /home/homis
----------Rasberry pi
rasbian isletim sistemi icin => noobs programi araciligiyla isletim sistemi kurulabilir.
rasberry pi clone => raspi clone
su an yuklu isletim sistemi username = pi pass= raspberry

Raspberry Pi 2 Model B 
wget https://nodejs.org/dist/v4.0.0/node-v4.0.0-linux-armv7l.tar.gz 
tar -xvf node-v4.0.0-linux-armv7l.tar.gz 
cd node-v4.0.0-linux-armv7l

Copy to /usr/local
sudo cp -R * /usr/local/

/**/
raspberry pi log flood problem:
sudo nano /etc/rsyslog.conf 
comment yap şunları:
#daemon.*;mail.*;\
#       news.err;\
#       *.=debug;*.=info;\
#       *.=notice;*.=warn       |/dev/xconsole

sonra da servis reset:
sudo service rsyslog restart
/**/

/**/
ısıya bakma raspi:
/opt/vc/bin/vcgencmd measure_temp
/**/

/**/
5 dakikada bir ekran görüntüsü alma raspi:
user ile girilecek (pi) crontab -e => */5 * * * * /home/homis/deployment/getscreen.sh

/**/
raspi deploymenttan önce wifi ayarlaması için /etc/wpa_supplicant/ dizinine wpa_supplicant.conf değiştirilerek eklenecek.
/**/
raspi ekranı kapatma açma (gece 1.30 da kapansın sabah 9 da açılsın), 5 dakikada bir ekran görüntüsü:
crontab -e ile giriş yapılacak
*/5 * * * * /home/homis/deployment/getscreen.sh
30 01 * * * /home/homis/deployment/closescreen.sh
00 09 * * * sudo reboot