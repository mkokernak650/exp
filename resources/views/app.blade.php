<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title inertia>{{ config('app.name', 'Laravel') }}</title>
  @vite('resources/sass/app.scss')
  @routes
  @viteReactRefresh
  @vite('resources/js/app.jsx')
  @inertiaHead
</head>

<body>
  @inertia
  <div id="initial-app-loader" aria-busy="true" aria-label="Loading application"
    style="position:fixed;inset:0;z-index:10050;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;background:rgba(255,255,255,0.82);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);">
    <div
      style="width:52px;height:52px;border-radius:50%;border:3px solid #e2e8f0;border-top-color:#667eea;animation:initial-app-spin 0.8s linear infinite;">
    </div>
    <span style="font-family:Roboto,sans-serif;font-size:14px;font-weight:500;color:#64748b;letter-spacing:0.06em;">Loading</span>
  </div>
  <style>
    @keyframes initial-app-spin {
      to {
        transform: rotate(360deg);
      }
    }
  </style>
</body>

</html>
