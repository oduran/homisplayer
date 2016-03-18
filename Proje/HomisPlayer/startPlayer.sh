#!/bin/bash
unclutter -idle 0.01 -root &
xset -dpms &
xset s noblank &
xset s off &
cd /usr/local/lib/node_modules/nodewebkitarm/;./nw /home/pi/bilimtek/HomisPlayer/