# Builds ASSET-MANIFEST.md and public/credits.html from public/assets/manifest.json.
# Usage: powershell -ExecutionPolicy Bypass -File tools\build-docs.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$photos = Get-Content (Join-Path $root 'public\assets\manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
function Enc([string]$s) { [System.Net.WebUtility]::HtmlEncode($s) }

$brand = @(
  @{ f='assets/brand/jokerz-logo-horizontal.svg'; use='Header logo'; src='Vector paths extracted from "JOKERZ LOGO_FINAL 1 (1) 1.pdf" (official guideline)'; dims='viewBox 884x258 (vector)' },
  @{ f='assets/brand/jokerz-logo-stacked.svg'; use='Footer logo'; src='Vector paths extracted from the official logo guideline PDF'; dims='viewBox 592x468 (vector)' },
  @{ f='assets/brand/jokerz-mark.svg'; use='Favicon, badge, visit card'; src='Jester-cupcake mark extracted from the official logo guideline PDF'; dims='viewBox 192x254 (vector)' },
  @{ f='assets/brand/jokerz-logo-guideline.pdf'; use='Reference copy of the supplied guideline'; src='Supplied by Jokerz'; dims='1440x2268 pt' }
)
$fonts = @(
  @{ f='assets/fonts/Fraunces-*.woff2'; use='Display headlines'; lic='SIL Open Font License 1.1 (Google Fonts)' },
  @{ f='assets/fonts/DMSans-*.woff2'; use='Body copy'; lic='SIL Open Font License 1.1 (Google Fonts)' },
  @{ f='assets/fonts/BarlowCondensed-*.woff2'; use='Labels (stand-in for the logo font Swis721 BlkCn BT)'; lic='SIL Open Font License 1.1 (Google Fonts)' }
)

# ---- Markdown manifest ----
$md = New-Object Text.StringBuilder
[void]$md.AppendLine('# Jokerz website demo - asset manifest')
[void]$md.AppendLine('')
[void]$md.AppendLine("Generated $(Get-Date -Format 'yyyy-MM-dd') by ``tools/build-docs.ps1`` from ``public/assets/manifest.json``.")
[void]$md.AppendLine('')
[void]$md.AppendLine('**Image generation:** none used by us. No image-generation tool or service was available in the build environment. Photography is Unsplash stock plus client-supplied images from jokerzbakery.com (some of which may themselves be stock or generated imagery chosen by the client).')
[void]$md.AppendLine('')
[void]$md.AppendLine('**Licence:** all photographs are from Unsplash under the [Unsplash License](https://unsplash.com/license): free for commercial and non-commercial use, no permission or attribution required (credit given voluntarily below). Restrictions: images may not be sold unaltered, and may not be compiled to replicate a similar or competing service. Unsplash+ (premium) images were deliberately excluded. Downloading and hosting locally is permitted.')
[void]$md.AppendLine('')
[void]$md.AppendLine('**Important:** the photos are stand-ins for presentation. They do not show actual Jokerz products, staff or locations and should be replaced with commissioned photography before launch.')
[void]$md.AppendLine('')
[void]$md.AppendLine('## Photography')
[void]$md.AppendLine('')
[void]$md.AppendLine('| File (full / small) | Intended use | Type | Source | Photographer / attribution | Licence | Dimensions | Optimisation |')
[void]$md.AppendLine('|---|---|---|---|---|---|---|---|')
foreach ($p in $photos) {
  $full = $p.files[0]; $sm = $p.files[1]
  $files = "``$($full.path)`` ($([int]($full.bytes/1KB)) KB)<br>``$($sm.path)`` ($([int]($sm.bytes/1KB)) KB)"
  $dims = "$($full.width)x$($full.height) / $($sm.width)x$($sm.height)"
  [void]$md.AppendLine("| $files | $($p.use) | $($p.type) | [Unsplash]($($p.source)) | Photo by $($p.photographer) on Unsplash | Unsplash License | $dims | $($p.optimization) |")
}
[void]$md.AppendLine('')
$jkPath = Join-Path $root 'public\assets\jokerz\manifest.json'
$jk = @()
if (Test-Path $jkPath) {
  $jk = Get-Content $jkPath -Raw -Encoding UTF8 | ConvertFrom-Json
  [void]$md.AppendLine('## Client-supplied images (from jokerzbakery.com)')
  [void]$md.AppendLine('')
  [void]$md.AppendLine('Downloaded from the live Jokerz website at the client''s request and converted to WebP by `homepage/scripts/import-jokerz-assets.mjs` (cut-outs keep transparency). We have not verified where each of these images originally came from; Jokerz should confirm it holds the rights to them. **Excluded:** `Honey cake-hgtUQtSi.png` on the live site is an unlicensed Vecteezy preview with a visible watermark, so it should be removed or replaced there as well. **Derived:** `assets/jokerz/classic-milk-tea-tinted(-sm).webp` is the client''s taro milk tea image recoloured to milk-tea beige (`homepage/scripts/derive-classic-milk-tea.mjs`), because the site has no separate Classic Milk Tea photo. Replace it with a real photo when one is available.')
  [void]$md.AppendLine('')
  [void]$md.AppendLine('| File (full / small) | Intended use | Kind | Source | Original | Sizes |')
  [void]$md.AppendLine('|---|---|---|---|---|---|')
  foreach ($p in $jk) {
    $full = $p.files[0]; $sm = $p.files[1]
    [void]$md.AppendLine("| ``$($full.path)`` ($([int]($full.bytes/1KB)) KB)<br>``$($sm.path)`` ($([int]($sm.bytes/1KB)) KB) | $($p.use) | $($p.kind) | [jokerzbakery.com]($($p.source)) | $($p.original) | $($full.width)x$($full.height) / $($sm.width)x$($sm.height) |")
  }
  [void]$md.AppendLine('')
}
[void]$md.AppendLine('## Client-supplied cake renders (Chapter 03)')
[void]$md.AppendLine('')
[void]$md.AppendLine('Supplied directly by the client (originals in `source-images/client/`). They were cut out from their white backgrounds by `homepage/scripts/process-cake-assets.mjs`, which uses a border flood-fill so the cream is preserved. The cocoa and golden layers are sponge-only recolours of the chocolate and vanilla renders. The toppings sheet was split into individual cherries, rosettes and chocolate pieces, and only clean pieces are used. Output: `public/assets/cake/` (`layer-chocolate/vanilla/cocoa/golden`, `topping-*`, `black-forest-layered`, `black-forest-frosted`; index in `cake-assets.json`). The frosted Black Forest render is the after-the-magic cake: a plain-topped version (`black-forest-frosted-plain`, toppings smoothed away by the script) is revealed by the cream wave, and the toppings then land and cross-fade into the original render.')
[void]$md.AppendLine('')
[void]$md.AppendLine('## Brand assets')
[void]$md.AppendLine('')
[void]$md.AppendLine('| File | Intended use | Source | Dimensions |')
[void]$md.AppendLine('|---|---|---|---|')
foreach ($b in $brand) { [void]$md.AppendLine("| ``$($b.f)`` | $($b.use) | $($b.src) | $($b.dims) |") }
[void]$md.AppendLine('')
[void]$md.AppendLine('Brand colours (from the guideline): #59296E purple, #FECC00 yellow, #0BA8BE teal, #E85222 orange, #1AA74F green, #EA5699 pink. Logo fonts named in the guideline: Swis721 BlkCn BT and Chalet NewYorkNineteenEighty (the logo itself is used as vector artwork, so these fonts are not needed on the site).')
[void]$md.AppendLine('')
[void]$md.AppendLine('## Fonts (self-hosted)')
[void]$md.AppendLine('')
[void]$md.AppendLine('| Files | Use | Licence |')
[void]$md.AppendLine('|---|---|---|')
foreach ($f in $fonts) { [void]$md.AppendLine("| ``$($f.f)`` | $($f.use) | $($f.lic) |") }
[IO.File]::WriteAllText((Join-Path $root 'ASSET-MANIFEST.md'), $md.ToString(), (New-Object Text.UTF8Encoding $false))

# ---- Credits page ----
$rows = foreach ($p in $photos) {
  $full = $p.files[0]
  "<li><img src=`"$($p.files[1].path)`" width=`"$($p.files[1].width)`" height=`"$($p.files[1].height)`" alt=`"$(Enc $p.alt)`" loading=`"lazy`"><div><strong>$(Enc $p.name)</strong><span>$(Enc $p.use)</span><span>Photo by $(Enc $p.photographer) on <a href=`"$($p.source)`" rel=`"noopener`">Unsplash</a></span><span class=`"meta`">$($full.width)&times;$($full.height) WebP &middot; Unsplash License</span></div></li>"
}
$html = @"
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Photo credits — Jokerz</title>
<link rel="icon" href="assets/brand/jokerz-mark.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/fonts/fonts.css">
<link rel="stylesheet" href="css/styles.css">
<style>
  .credits { padding-block: 56px 96px; }
  .credits h1 { font-size: clamp(40px, 6vw, 72px); margin: 8px 0 18px; }
  .credits .intro { max-width: 760px; color: var(--ink-soft); }
  .credit-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-top: 40px; }
  .credit-list li { display: flex; gap: 14px; align-items: center; background: #fff; border-radius: 18px; padding: 10px; }
  .credit-list img { width: 84px; height: 84px; object-fit: cover; border-radius: 12px; flex: none; }
  .credit-list div { display: flex; flex-direction: column; font-size: 14px; line-height: 1.4; min-width: 0; }
  .credit-list span { color: var(--ink-soft); }
  .credit-list .meta { font-size: 12px; opacity: .8; }
</style>
</head>
<body>
<header class="site-header is-scrolled"><div class="wrap header-inner"><a class="brand" href="index.html"><img src="assets/brand/jokerz-logo-horizontal.svg" alt="Jokerz home" width="176" height="51"></a><a class="btn btn-small" href="index.html">Back to site</a></div></header>
<main class="credits wrap">
  <p class="eyebrow">Asset manifest</p>
  <h1>Photo <em>credits</em></h1>
  <p class="intro">$($photos.Count) stock photographs are from <a href="https://unsplash.com/license">Unsplash</a> (free commercial use; attribution not required but given here). We generated no AI imagery. These photos are presentation stand-ins and do not depict actual Jokerz products, staff or locations. The Jokerz logo is vector artwork taken directly from the official guideline. Full details: <code>ASSET-MANIFEST.md</code> in the project root and <a href="assets/manifest.json">assets/manifest.json</a>.</p>
  <ul class="credit-list" role="list">
$($rows -join "`n")
  </ul>
  <h2 style="font-size:clamp(30px,4vw,48px);margin:70px 0 14px">Client-supplied images</h2>
  <p class="intro">$($jk.Count) product, boba, ice-cream, crepe and catering images taken from jokerzbakery.com at the client's request. We have not verified their original sources. One live-site image (Honey cake) was excluded because it carries a Vecteezy watermark.</p>
  <ul class="credit-list" role="list">
$(($jk | ForEach-Object { "<li><img src=`"$($_.files[1].path)`" width=`"$($_.files[1].width)`" height=`"$($_.files[1].height)`" alt=`"$(Enc $_.alt)`" loading=`"lazy`" style=`"object-fit:contain;background:#FBF6EE`"><div><strong>$(Enc $_.name)</strong><span>$(Enc $_.use)</span><span>Source: jokerzbakery.com</span><span class=`"meta`">$($_.files[0].width)&times;$($_.files[0].height) WebP</span></div></li>" }) -join "`n")
  </ul>
</main>
</body>
</html>
"@
[IO.File]::WriteAllText((Join-Path $root 'public\credits.html'), $html, (New-Object Text.UTF8Encoding $false))
Write-Host "Wrote ASSET-MANIFEST.md and public/credits.html ($($photos.Count) photos)"
