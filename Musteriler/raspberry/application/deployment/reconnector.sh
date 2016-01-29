if ! [ "$(ping -c4 google.com)"]; then
	/sbin/ifdown 'wlan0'
	sleep 5
	/sbin/ifup -- force 'wlan0'
fi
