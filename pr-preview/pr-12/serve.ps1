$port = if ($env:PORT) { $env:PORT } else { 3000 }
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:${port}/")
$listener.Start()
[Console]::Out.WriteLine("Serving ${root} on http://localhost:${port}")
[Console]::Out.Flush()
$mimeTypes = @{
    '.html'='text/html'; '.css'='text/css'; '.js'='application/javascript'
    '.json'='application/json'; '.svg'='image/svg+xml'; '.png'='image/png'
    '.jpg'='image/jpeg'; '.webp'='image/webp'; '.ico'='image/x-icon'
    '.woff2'='font/woff2'; '.woff'='font/woff'; '.ttf'='font/ttf'
}
try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()
        $localPath = $ctx.Request.Url.LocalPath
        if ($localPath -eq '/') { $localPath = '/index.html' }
        $filePath = Join-Path $root $localPath.Replace('/', '\')
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath)
            if ($mimeTypes.ContainsKey($ext)) {
                $ctx.Response.ContentType = $mimeTypes[$ext]
            } else {
                $ctx.Response.ContentType = 'application/octet-stream'
            }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ctx.Response.ContentLength64 = $bytes.Length
            $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $ctx.Response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
            $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $ctx.Response.Close()
    }
} finally {
    $listener.Stop()
}
