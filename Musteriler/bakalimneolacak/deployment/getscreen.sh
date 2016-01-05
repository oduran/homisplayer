#!/bin/bash
now=$(date +"%Y_%m_%d.%H_%M_%S") filenamedate="screen.$now.jpg" 
filenameuniqueid="$(cat /proc/cpuinfo | grep Serial | cut -d ':' -f 2)"
DISPLAY=:0.0 import -window root -resize 600 /home/homis/log/${filenameuniqueid}_${filenamedate}
