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
rtcwake'in bilimtek kullanıcısı tarafından sudo olmadan kullanması icin:
visudo => %sudo altına bilimtek ALL=NOPASSWD: ALL satırı eklenerek sudo komutlarının password istememesi sağlanmalı.
-----

Eyelogic kurulumu

sudo hwclock -w --localtime

Windows’la dual boot ise /etc/default/rcS dosyasinda UTC=on olacak ( sudo hwclock’a bak)
sudo chmod u+s /usr/sbin/rtcwake
sudo crontab -e
biostan standby mode s3 olarak ayarlanacak (write to memory).
=> 00 21 * * *  sudo rtcwake -l -m mem -s 36000
bazı bilgisayarlarda memory suspend çalışmıyor.
00 21 * * *  sudo rtcwake -u -s 36000 -> kafes fırında olan şey


############## Ekran karti ##################

sudo ubuntu-drivers devices

== /sys/devices/pci0000:00/0000:00:01.0/0000:01:00.0 ==

vendor   : NVIDIA Corporation
modalias : pci:v000010DEd00000DDAsv000017AAsd000021D1bc03sc00i00
model    : GF106GLM [Quadro 2000M]
driver   : xserver-xorg-video-nouveau - distro free builtin
driver   : nvidia-304-updates - distro non-free
driver   : nvidia-304 - distro non-free
driver   : nvidia-331 - distro non-free recommended
driver   : nvidia-331-updates - distro non-free

## recommended olani yukle
sudo apt-get install nvidia-331
sudo nvidia-xconfig
sudo nano /etc/X11/xorg.conf
	Section “ServerLayout” altinda => Option         "Xinerama" "on"

#########################################

git ve bitbucket command line

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