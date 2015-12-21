#!/bin/bash
#start=21:00
#end=07:00
start=23:00
end=23:05

checkIfWithinRange() {
  current=$(date +%H:%M)
  startinseconds=`date +%s -d "$start"`
  endinseconds=`date +%s -d "$end"`
  currentinseconds=`date +%s -d "$current"`
  if [ "$endinseconds" -lt "$currentinseconds" ]; then
    endinseconds=$((`date +%s -d "$end"` + 24*60*60))
  fi
  [[ ($startinsecond -eq $currentinseconds || $startinseconds -lt $currentinseconds) && ($currentinseconds -eq $endinseconds || $currentinseconds -lt $endinseconds) ]] 
}

if checkIfWithinRange; then
  echo "going back to sleep"
  bash /home/suspenduntil.sh "$end"
fi

unclutter -idle 0.01 -root &
xset -dpms &
xset s noblank &
xset s off &
node /usr/local/lib/node_modules/nodewebkit/bin/nodewebkit /home/kafesfirin/ 
