#!/bin/bash
export DISPLAY=':0.0';
start=21:10
end=06:50

checkIfWithinRange() {
  current=$(date +%H:%M)
  startinseconds=`date +%s -d "$start"`
  endinseconds=`date +%s -d "$end"`
  currentinseconds=`date +%s -d "$current"`
  if [ "$endinseconds" -lt "$startinseconds" ]; then
    endinseconds=$((`date +%s -d "$end"` + 24*60*60))
  fi
  if [ "$currentinseconds" -lt "$startinseconds" ]; then
    currentinseconds=$((`date +%s -d "$current"` + 24*60*60))
  fi
  [[ ($startinsecond -eq $currentinseconds || $startinseconds -lt $currentinseconds) && ($currentinseconds -eq $endinseconds || $currentinseconds -lt $endinseconds) ]] 
}

if checkIfWithinRange; then
  echo "going back to sleep"
  bash /home/homis/deployment/suspenduntil.sh "$end"
fi

unclutter -idle 0.01 -root &
xset -dpms &
xset s noblank &
xset s off &
#cd /home/bilimtek/Documents/Eyelogic/EyelogicServiceSoftware/Release/; ./EyelogicServiceSoftware_1.1 &
sudo nw /home/homis/


