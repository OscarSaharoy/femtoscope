# femtoscope

Oscilloscope webapp using the Serial API in Chrome. Femtoscope is meant to be a free alternative to picoscope - all you need is a new verion of chrome and an arduino or similar microcontroller. There's a html document called `femtoscope.html` - this is meant to be opened with chrome. In the `arduino code` folder there's an arduino file called `femtoscope.ino` that you should be able to get onto your arduino. The other thing you need is to connect your arduino to your pc over a serial connection; this will normally be by plugging it into a usb port with a cable.

The serial communication protocol is really simple - however often you like, the arduino must output a byte onto the serial link. This value represents the measured voltage at that time, 0 for minimum measurable voltage and 255 for the maximum (so 0 to 5 volts for arduino uno). You can then set the voltage range from within femtoscope, and the sampling rate will be accounted for automatically, so you can change the frequency of the `loop()` function in the arduino code to change the sampling rate.

![](https://github.com/OscarSaharoy/femtoscope/blob/main/assets/femtoscope.gif)
