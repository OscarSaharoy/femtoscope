
void setup() {
  Serial.begin(115200);
}

void loop() {
  Serial.write( (analogRead(A0) >> 2) & 0xff );
}
