#!/bin/sh
now=$(date +"%Y_%m_%d.%H_%M_%S")
filenamedate="screen.$now.jpg"
filenameuniqueid=$(sudo cat /sys/class/dmi/id/product_uuid)
sudo DISPLAY=:0 /usr/bin/import -window root -resize 600 /home/homis/log/${filenameuniqueid}_${filenamedate} >> /home/homis/log/ssoutput.txt 2>&1
echo ${filenameuniqueid}_${filenamedate}
