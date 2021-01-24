
void setup() {
  
  // set adc prescaler to 16 rather than 128
  _SFR_BYTE(ADCSRA) |= 0x04;
  _SFR_BYTE(ADCSRA) &= 0xfb;
  
  Serial.begin(500000);
}

void loop() {
  Serial.write( (analogRead(A0) >> 2) & 0xff );
}
