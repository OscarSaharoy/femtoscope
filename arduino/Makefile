run:
	arduino-cli compile --fqbn arduino:avr:uno .
	arduino-cli upload -p /dev/ttyACM0 --fqbn arduino:avr:uno --verbose .

serial:
	arduino-cli compile --fqbn arduino:avr:uno .
	arduino-cli upload -p /dev/ttyACM0 --fqbn arduino:avr:uno --verbose .
	minicom -b 115200 -D /dev/ttyACM0

