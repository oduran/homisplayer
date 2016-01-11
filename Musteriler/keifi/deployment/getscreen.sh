#!/bin/bash
now=$(date +"%Y.%m.%d.%H.%M.%S");
filenamedate="screen.$now.jpg";
filenameuniqueid="$(cat /proc/cpuinfo | grep Serial | cut -d ':' -f 2 | cut -d ' ' -f 2)"
filename="$filenameuniqueid.$filenamedate";
DISPLAY=:0.0; export DISPLAY; import -window root -resize 600 /home/homis/log/"$filename"
