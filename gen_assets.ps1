Add-Type -AssemblyName System.Drawing

$assets = "d:\IEEE CIS UNI Ecovision\assets"
if (-not (Test-Path $assets)) {
    New-Item -ItemType Directory -Path $assets
}

# Icon
$bmp1 = New-Object System.Drawing.Bitmap 1024, 1024
$g1 = [System.Drawing.Graphics]::FromImage($bmp1)
$g1.Clear([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
$bmp1.Save("$assets\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g1.Dispose()
$bmp1.Dispose()

# Adaptive Icon
$bmp2 = New-Object System.Drawing.Bitmap 1024, 1024
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.Clear([System.Drawing.Color]::FromArgb(255, 16, 185, 129))
$bmp2.Save("$assets\adaptive-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g2.Dispose()
$bmp2.Dispose()

# Splash
$bmp3 = New-Object System.Drawing.Bitmap 2048, 2048
$g3 = [System.Drawing.Graphics]::FromImage($bmp3)
$g3.Clear([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
$bmp3.Save("$assets\splash.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g3.Dispose()
$bmp3.Dispose()

# Favicon
$bmp4 = New-Object System.Drawing.Bitmap 48, 48
$g4 = [System.Drawing.Graphics]::FromImage($bmp4)
$g4.Clear([System.Drawing.Color]::FromArgb(255, 16, 185, 129))
$bmp4.Save("$assets\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g4.Dispose()
$bmp4.Dispose()

Write-Host "PNG assets successfully created!"
