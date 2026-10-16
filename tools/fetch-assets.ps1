# Re-downloads the Unsplash photography used by the demo as optimized WebP (two widths each)
# and regenerates public/assets/manifest.json. Requires only curl.exe (bundled with Windows 10+).
# Usage: powershell -ExecutionPolicy Bypass -File tools\fetch-assets.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$assets = Join-Path $root 'public\assets'

# name, folder, unsplash photo id, photo page, photographer, width, height, alt, use
$list = @(
  @('hero-signature-cake','hero','1604413191066-4dd20bedf486','https://unsplash.com/photos/pink-and-white-floral-cake-g5bgYkKa8y0','David Holifield',1200,1500,'Mint-iced celebration cake crowned with blush-pink buttercream rosettes','Hero, main image'),
  @('pink-drip-celebration-cake','food','1621303837174-89787a7d4729','https://unsplash.com/photos/pink-and-white-cake-on-white-ceramic-plate-QNyRp21hb5I','Katie Rosario',1100,1375,'Pink drip cake topped with meringue kisses on a white stand','Celebrations feature'),
  @('four-tier-rose-cake','food','1535254973040-607b474cb50d','https://unsplash.com/photos/4-layered-fondant-cake-on-table-fXAuCMEYGY4','Jason Leung',1600,2000,'Four-tier white celebration cake dressed with soft pink and peach roses','Homepage celebrate chapter - full-screen zoom-out hero'),
  @('lavender-butterfly-cake','food','1700958533634-63e8aea5986b','https://unsplash.com/photos/l9EtbJ9r8Q0','Fernando Dantas',1920,1200,'Lavender buttercream cake decorated with violet butterflies and pearls, surrounded by chocolate truffles','Homepage celebrate chapter - full-screen zoom-out hero'),
  @('rainbow-layer-cake','food','1600653155864-88227b5b64b0','https://unsplash.com/photos/white-pink-and-yellow-cake-GQvNc4bDRYw','Anirban Sengupta',1000,1000,'Slice of rainbow layer cake showing bright sponge layers','Menu card - cakes'),
  @('chocolate-cherry-layer-cake','food','1606890737304-57a1ca8a5b62','https://unsplash.com/photos/chocolate-cake-with-cherries-and-cream-6jHpcBPw7i8','Jacob Thomas',1000,1000,'Three-layer chocolate cake with cream and glossy dark cherries','Menu card - cakes'),
  @('strawberry-cream-cake','food','1615735487485-e52b9af610c1','https://unsplash.com/photos/strawberry-cake-on-white-ceramic-plate-Rj1IWO8IozE','Aneta Voborilova',1000,1000,'Strawberry and cream sponge slice on a white plate','Menu card - cakes'),
  @('floral-birthday-cake','food','1747576660180-f3b789cb0f7a','https://unsplash.com/photos/a-birthday-cake-decorated-with-flowers-KU4aJwiI_Ek','Nataliya Melnychuk',900,1125,'Cream birthday cake decorated with fresh flowers and a Happy Birthday topper','Celebrations feature'),
  @('three-tier-floral-cake','food','1559373098-e1caaccae791','https://unsplash.com/photos/three-tier-cake-with-pink-fresh-flowers-on-table-beside-two-champagne-flute-glasses-53nLF9woXE0','Frank Zhang',900,1125,'Three-tier white cake with pink fresh flowers beside champagne flutes','Celebrations feature'),
  @('teal-cupcakes','food','1486427944299-d1955d23e34d','https://unsplash.com/photos/pGM4sjt_BdQ','Brooke Lark',1000,1000,'Row of cupcakes with soft teal icing and sprinkles','Menu card - sweets'),
  @('lemon-cupcake','food','1576618148400-f54bed99fcfd','https://unsplash.com/photos/Ltv7a5m8i4c','Cristina Matos-Albers',900,1125,'Cupcake with swirled cream in a butter-yellow holder on yellow','Boba / colour story accent'),
  @('pastel-macarons','food','1597895139322-0a1ef77b3c30','https://unsplash.com/photos/i5BQNYI0jIU','Divani',1000,1000,'Stack of yellow, pink and green macarons','Menu card - sweets'),
  @('macarons-on-blush','food','1702745572427-c7c772b45ff3','https://unsplash.com/photos/j06IIAmm5mQ','Serghey Savchuk',900,900,'Pastel macarons scattered on a blush-pink surface','Hero floating card'),
  @('artisan-croissants','food','1623334044303-241021148842','https://unsplash.com/photos/a-bunch-of-croissants-that-are-on-a-table-sqkXyyj4WdE','Conor Brown',1000,1000,'Golden laminated croissants piled together','Menu card - pastries'),
  @('croissant-on-plate','food','1501721358449-1505ca840822','https://unsplash.com/photos/baked-pastry-on-white-ceramic-saucer-E5Yb_0jua2U','Kaley Dykstra',1200,900,'A single flaky croissant on a white saucer','Three counters - bakery'),
  @('chocolate-chip-cookies','food','1499636136210-6f4ee915583e','https://unsplash.com/photos/close-up-photo-of-baked-cookies-OfdDiqx8Cz8','Jennifer Pallian',1000,1000,'Close-up of chewy chocolate chip cookies','Menu card - sweets'),
  @('brown-sugar-boba','food','1558857563-b371033873b8','https://unsplash.com/photos/clear-plastic-container-dHQQv-BKTjo','Orimi Protograph',1000,1000,'Brown-sugar milk tea with tapioca pearls in a tall clear cup','Menu card - boba; hero floating card'),
  @('boba-in-bloom','food','1745883949374-baeba0ed57c3','https://unsplash.com/photos/hand-holding-a-refreshing-bubble-tea-OFPGkd2swUM','Malcolm Broström',1000,1250,'Hand holding a milky bubble tea against spring blossoms','Boba bar feature'),
  @('milk-tea-jars','food','1525803377221-4f6ccdaa5133','https://unsplash.com/photos/two-clear-glass-jars-with-straws-P_wPicZYoPI','Rosalind Chang',1200,900,'Two glass jars of pearl milk tea with straws on a pale wood counter','Three counters - boba'),
  @('iced-latte-pour','food','1562447457-579fc34967fb','https://unsplash.com/photos/02O1bXB_fgk','Empreinte',900,1125,'Milk pouring into a glass of iced coffee','Boba bar feature secondary'),
  @('pastry-display-tarts','cafe','1583338917451-face2751d8d5','https://unsplash.com/photos/bakery-display-with-fruit-tarts-1WmlAiYgnoI','Ulysse Pointcheval',1400,1050,'Glass display of fruit tarts and chocolate cakes','Cafe atmosphere gallery'),
  @('modern-cafe-interior','cafe','1600353565737-2427a1ba3d3a','https://unsplash.com/photos/green-potted-plants-on-white-table-pIO8zFpgL_s','Jonathan Borba',1600,1000,'Bright white cafe interior with plants and pale wood tables','Cafe atmosphere lead'),
  @('cafe-counter-bright','cafe','1567880905822-56f8e06fe630','https://unsplash.com/photos/modern-coffee-shop-interior-with-curved-counter-ZZxmc66SjfM','Keghan Crossland',1200,900,'Airy café with arched windows, pendant lights and a curved wooden counter','Three counters - cafe'),
  @('cafe-warm-lights','cafe','1511081692775-05d0f180a065','https://unsplash.com/photos/cafe-interior-with-hanging-bulbs-and-table-VobvKmG-StA','Clifford',900,1125,'Cosy cafe corner under warm hanging bulbs','Cafe atmosphere gallery'),
  @('cake-decoration-process','story','1649773289945-93a96051fd18','https://unsplash.com/photos/a-chef-decorating-a-cake-with-pink-icing-eR3LPfuDzGk','Mick Haupt',1000,1250,'Pastry chef smoothing pink icing on a layer cake','Craft story lead'),
  @('teal-cake-finishing','story','1574936423169-82494c75f01f','https://unsplash.com/photos/round-blue-cake-ttY5ZD2O3h8','Holly Stratton',900,1125,'Teal buttercream cake being finished with sugar decorations','Craft story'),
  @('piping-buttercream','story','1586985289688-ca3cf47d3e6e','https://unsplash.com/photos/person-holding-white-ice-cream-cone-with-brown-and-white-round-cake-5K5Nc3AGF1w','American Heritage Chocolate',900,1125,'Piping bag adding buttercream rosettes to a chocolate cake','Craft story'),
  @('pastry-dough-prep','story','1517686469429-8bdb88b9f907','https://unsplash.com/photos/tOYiQxF9-Ys','Nadya Spetnitskaya',1000,1250,'Hands kneading dough beside a rolling pin','Craft story'),
  @('birthday-candles','story','1545696563-af8f6ec2295a','https://unsplash.com/photos/birthday-cake-with-lit-candles-d8s13D29QiE','Aneta Pawlik',1200,900,'Hand lighting candles on a berry-topped birthday cake','Celebrations / order steps'),
  @('party-table','story','1571926422939-1abb99c50fd8','https://unsplash.com/photos/white-and-pink-carousel-table-decor-XbWsnr1pwrQ','Toa Heftiba',1400,1050,'Pastel party table with carousel cake and bunting','Final call to action'),
  @('pink-frosting-texture','brand','1581016327131-6cf17ab1f2c1','https://unsplash.com/photos/pink-frosting-swirls-with-shadows-5djh4Yb-2zI','Alexander Grey',1600,900,'Swirls of smooth pink frosting','Decorative texture band')
)

$manifest = @()
foreach ($a in $list) {
  $name,$folder,$id,$page,$by,$w,$h,$alt,$use = $a
  $dir = Join-Path $assets $folder
  New-Item -ItemType Directory -Force $dir | Out-Null
  $sizes = @(@{ suffix=''; w=$w; h=$h }, @{ suffix='-sm'; w=[int]($w/2); h=[int]($h/2) })
  $files = @()
  foreach ($s in $sizes) {
    $out = Join-Path $dir "$name$($s.suffix).webp"
    $url = "https://images.unsplash.com/photo-$id`?w=$($s.w)&h=$($s.h)&fit=crop&crop=focalpoint,entropy&fm=webp&q=74"
    curl.exe -s -L --fail -o $out $url
    if ($LASTEXITCODE -ne 0) { throw "Download failed: $name ($url)" }
    $files += [ordered]@{ path = "assets/$folder/$name$($s.suffix).webp"; width = $s.w; height = $s.h; bytes = (Get-Item $out).Length }
  }
  $manifest += [ordered]@{
    name = $name; folder = $folder; use = $use; alt = $alt; type = 'Sourced photography'
    source = $page; photographer = $by; license = 'Unsplash License (https://unsplash.com/license)'
    attribution = "Photo by $by on Unsplash (not required by licence; credited voluntarily)"
    optimization = 'Cropped server-side to target aspect, WebP q74, 1x + half-size variants'
    files = $files
  }
  Write-Host "ok $name"
}
$manifest | ConvertTo-Json -Depth 5 | Out-File (Join-Path $assets 'manifest.json') -Encoding utf8
