#!/bin/sh
sudo bash -c 'echo "bilimtek ALL=NOPASSWD: ALL" | (EDITOR="tee -a" visudo)'
echo "Updating packages..."
sudo apt-get update -y  # To get the latest package lists
echo "Update done!"
echo "Upgrading packages..."
sudo apt-get upgrade -y  # To get the latest package lists
echo "Upgrade done!"
echo "Installing imagemagick..."
sudo apt-get install -y imagemagick
echo "Installing ssh server..."
sudo apt-get install -y openssh-server 
echo "Installing unclutter..."
sudo apt-get install -y unclutter
echo "Installing ssh nodejs..."
sudo apt-get install -y nodejs
sudo apt-get install -y nodejs-legacy
echo "Installing npm - node package manager..."
sudo apt-get install -y npm
echo "Installing nw - node webkit ..."
sudo npm install -y nw -g
echo "Fixing libudev 64 bit problem..."
sudo ln -sf /lib/$(arch)-linux-gnu/libudev.so.1 /lib/$(arch)-linux-gnu/libudev.so.0
echo "Copying autostart file..."
sudo chmod 777 /etc/xdg/autostart/
sudo mv homisstartup.desktop /etc/xdg/autostart/homisstartup.desktop
echo "Finished autostart file copy!"
echo "Setting hw clock..."
sudo hwclock -w --localtime
echo "giving write read permissions"
sudo chmod 777 /home/
sudo chmod 777 /home/homis/log/
sudo chmod 777 /home/homis/deployment/
sudo chmod +x /home/homis/deployment/*.sh
echo "adding wireless options"
sudo tee /etc/modprobe.d/iwlwifi-opt.conf <<< "options iwlwifi 11n_disable=1 power_save=0 swcrypto=1"
sudo tee /etc/modprobe.d/iwlwifi.conf <<< "options iwlwifi 11n_disable=1 power_save=0 swcrypto=1"
echo "TODO:" 
echo "Add daily sleep wake up to sudo crontab -e." 
echo "Add get image every 5 minutes to daily user crontab."
echo "Add internet reconnector 5 minute for network manager restart, 30 min for full restart"
echo "Install Nvidia driver."
echo "Do xinerama"
echo "Close auto updates"
echo "Close appcrash on screen"


