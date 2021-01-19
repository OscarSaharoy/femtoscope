# femtoscope

Oscilloscope webapp using the Serial API in Chrome. Femtoscope is meant to be a free alternative to picoscope - all you need is a new verion of chrome and an arduino or similar microcontroller. There's a html document called `femtoscope.html` - this is meant to be opened with chrome, I'll also try to host it online somewhere. The other thing you need is to connect your arduino to your pc over a serial connection; this will normally be by plugging it into a usb port with a cable. There needs to be a realy simple program running on it - however often you like, it must output an 8-bit value onto the serial link. This value represents the measured voltage at that time, 0 for minimum measurable voltage and 255 for the maximum. You can then set the voltage range from within femtoscope, and the sampling rate will be accounted for by femtoscope.

![](https://github.com/OscarSaharoy/femtoscope/blob/main/screenshot.jpg)
