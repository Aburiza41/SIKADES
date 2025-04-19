<!DOCTYPE html>
<html>
<head>
    <title>{{ $title }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        h1 { text-align: center; color: #333; margin-bottom: 20px; }
        .header { margin-bottom: 20px; }
        .date { text-align: right; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f2f2f2; text-align: left; padding: 8px; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        .footer { margin-top: 20px; text-align: right; font-style: italic; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <div class="date">Dicetak pada: {{ $tanggal }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Jabatan</th>
                <th>NIK</th>
            </tr>
        </thead>
        <tbody>
            @foreach($officials as $key => $official)
            <tr>
                <td>{{ $key + 1 }}</td>
                <td>{{ $official->gelar_depan.' '.$official->nama_lengkap. ' '.$official->gelar_belakang }}</td>
                <td>
                    @if($official->position_current && $official->position_current->position)
                        {{ $official->position_current->position->name }}
                    @else
                        -
                    @endif
                </td>
                <td>{{ $official->nik ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Dokumen dihasilkan oleh Sistem {{ config('app.name') }}
    </div>
</body>
</html>
