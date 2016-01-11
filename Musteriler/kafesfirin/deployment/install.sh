#!/bin/sh
sudo bash -c 'echo "bilimtek ALL=NOPASSWD: ALL" | (EDITOR="tee -a" visudo)'
echo "Updating packages..."
sudo apt-get update  # To get the latest package lists
echo "Update done!"
echo "Upgrading packages..."
sudo apt-get upgrade  # To get the latest package lists
echo "Upgrade done!"
echo "Installing imagemagick..."
sudo apt-get install imagemagick
echo "Installing ssh server..."
sudo apt-get install openssh-server 
echo "Installing unclutter..."
sudo apt-get install unclutter
echo "Installing ssh nodejs..."
sudo apt-get install nodejs
sudo apt-get install nodejs-legacy
echo "Installing npm - node package manager..."
sudo apt-get install npm
echo "Installing nw - node webkit ..."
sudo npm install nw -g
echo "Fixing libudev 64 bit problem..."
sudo ln -sf /lib/$(arch)-linux-gnu/libudev.so.1 /lib/$(arch)-linux-gnu/libudev.so.0
echo "Copying autostart file..."
sudo chmod 777 /etc/xdg/autostart/
sudo mv homisstartup.desktop /etc/xdg/autostart/homisstartup.desktop
echo "Finished autostart file copy!"
echo "Setting hw clock..."
sudo hwclock -w --localtime
echo "TODO:" 
echo "Add daily sleep wake up to sudo crontab -e." 
echo "Add get image every 5 minutes to daily user crontab."
echo "Install Nvidia driver."
echo "Do xinerama"
echo "Close auto updates"
echo "Close appcrash on screen"


