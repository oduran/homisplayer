#!/bin/bash
now=$(date +"%Y_%m_%d.%H_%M_%S")
nowlowprec=$(date +"%Y_%m_%d")
filenamedate="connection.$nowlowprec.txt"
filenameuniqueid=$(sudo cat /sys/class/dmi/id/product_uuid)
if ! [ "$(ping -c 1 google.com)" ]; then
	echo "network problem, will restart internet connection_$now" >> /home/homis/log/${filenameuniqueid}_${filenamedate};
	sudo reboot;
else
	echo "everything seems fine_$now">>/home/homis/log/${filenameuniqueid}_${filenamedate} ;
fi
