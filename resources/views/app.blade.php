<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- Judul Halaman -->
        <title inertia>{{ config('app.name', 'SIKADES') }}</title>

        <!-- Deskripsi Halaman -->
        <meta name="description" content="Sistem Informasi Kades (SIKADES) adalah platform untuk mengelola informasi kepala desa secara efisien dan transparan.">

        <!-- Kata Kunci untuk SEO -->
        <meta name="keywords" content="SIKADES, Sistem Informasi Kades, kepala desa, informasi desa, administrasi desa">

        <!-- Author -->
        <meta name="author" content="Tim Pengembang SIKADES">

        <!-- Canonical URL (jika diperlukan) -->
        <link rel="canonical" href="{{ url()->current() }}" />

        <!-- Icon -->
        <link rel="icon" href="{{ asset('assets/images/KalBar.svg') }}" type="image/x-icon" />

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=poppins:400,500,600,700&display=swap" rel="stylesheet" />

        <!-- CSRF Token -->
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- Open Graph Tags (untuk media sosial) -->
        <meta property="og:title" content="{{ config('app.name', 'SIKADES') }}">
        <meta property="og:description" content="Sistem Informasi Kades (SIKADES) adalah platform untuk mengelola informasi kepala desa secara efisien dan transparan.">
        <meta property="og:image" content="{{ asset('assets/images/KalBar.svg') }}">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:type" content="website">

        <!-- Twitter Card Tags (opsional, untuk Twitter) -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ config('app.name', 'SIKADES') }}">
        <meta name="twitter:description" content="Sistem Informasi Kades (SIKADES) adalah platform untuk mengelola informasi kepala desa secara efisien dan transparan.">
        <meta name="twitter:image" content="{{ asset('assets/images/KalBar.svg') }}">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-poppins antialiased">
        @inertia
    </body>
</html>