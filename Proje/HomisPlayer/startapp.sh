#!/bin/bash
export DISPLAY=':0.0';
start=21:10
end=06:50
unclutter -idle 0.01 -root &
xset -dpms &
xset s noblank &
xset s off &
#cd /home/bilimtek/Documents/Eyelogic/EyelogicServiceSoftware/Release/; ./EyelogicServiceSoftware_1.1 &
sudo nw /home/homisplayer/ 


