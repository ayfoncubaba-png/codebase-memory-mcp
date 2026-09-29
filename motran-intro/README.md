# MOTRAN intro animasyonu

8 saniyelik, 9:16 (1080×1920) tanıtım videosu. Yapay zekâ modeli kullanılmadan,
tamamen kodla (HTML canvas) çizilir ve `motran-intro.mp4` olarak dışa aktarılır.

| Süre | Sahne |
| --- | --- |
| 0–3 sn | Kaos: kâğıtlar uçuşur, yapışkan notlar kopar, telefon çalar, hesap makinesi yanıp söner, motosiklet ikonları titrer, soru işaretleri ve rakamlar döner. |
| 3–5 sn | Laptop masaya kayar ve açılır; ekrandan çıkan turuncu ışık her şeyi girdap gibi içine çeker, masa temizlenir. |
| 5–7 sn | Kamera ekrana dalar; turuncu ışık lekeleri kartlara dönüşüp ızgaraya oturur ve `final-frame.png` belirir. |
| 7–8 sn | Son kare sabit bekler. |

## Önizleme

`index.html` dosyasını tarayıcıda açın (aynı klasördeki `final-frame.png` ve
`poppins-800.woff2` dosyalarını kullanır); animasyon döngüde oynar.

## Video üretme

```sh
node render.mjs                      # motran-intro.mp4
node render.mjs --fps 60             # 60 fps
node render.mjs --stills 1.2,4.1     # belirli saniyelerin PNG kareleri
```

Playwright (Chromium) ve libx264 destekli ffmpeg gerekir. ffmpeg PATH'te değilse
`FFMPEG=/yol/ffmpeg node render.mjs` şeklinde verin.

Son kareyi değiştirmek için `final-frame.png` dosyasını 1080×1920 boyutunda yeni
görselle değiştirip tekrar render edin. Kartların uçup yerleştiği konumlar
`index.html` içindeki `CARDS`, `PILLS` ve CTA bandı koordinatlarıdır.
