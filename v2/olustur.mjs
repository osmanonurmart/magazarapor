// Tek dosyalık sürümü üretir: v2/tek-dosya.html
// Bütün modülleri ve stili tek HTML içine gömer, böylece dosya çift tıklanarak
// (file:// ile) açılabilir; yerel sunucu gerekmez.
//
// Çalıştırma:  npx esbuild --version >/dev/null && node olustur.mjs
import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';

const paket = await build({
  entryPoints: ['js/app.js'],
  bundle: true,
  format: 'iife',
  target: ['chrome100','firefox100','safari15'],
  charset: 'utf8',
  write: false
});
const js = paket.outputFiles[0].text;
const css = await readFile('css/app.css', 'utf8');
const ikon = await readFile('icon.svg', 'utf8');

const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#1d1d1f">
<title>Mağaza Performans Takip</title>
<link rel="icon" href="data:image/svg+xml;base64,${Buffer.from(ikon).toString('base64')}">
<style>
${css}
</style>
</head>
<body>
<div id="kok"><div class="acilis">Yükleniyor…</div></div>
<script>
${js}
</script>
</body>
</html>
`;
await writeFile('tek-dosya.html', html, 'utf8');
console.log('tek-dosya.html yazıldı — ' + Math.round(html.length/1024) + ' KB');
