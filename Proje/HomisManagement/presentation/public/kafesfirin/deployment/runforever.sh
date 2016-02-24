#!/bin/bash

# Check if node webkit is running
if pgrep "nw" > /dev/null
then
  echo "application is running.."
else
  echo "application is not running.."
  sudo /home/homis/deployment/startapp.sh
fi
