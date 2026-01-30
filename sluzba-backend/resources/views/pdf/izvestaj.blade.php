<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Izveštaj o ispitima</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 5px; text-align: left; }
        h2 { margin-bottom: 5px; }
    </style>
</head>
<body>

    <h2>Izveštaj o ispitima</h2>

    <strong>Student:</strong> {{ $student->ime }} {{ $student->prezime }}<br>
    <strong>Broj indeksa:</strong> {{ $student->broj_indeksa }}<br>
    <strong>Smer:</strong> {{ $student->smer }}<br>
    <strong>Godina studija:</strong> {{ $student->godina_studija }}<br><br>

    <strong>Ukupno prijava:</strong> {{ $prijave->count() }}<br>
    <strong>Polozenih ispita:</strong> {{ $polozeni }}<br>
    <strong>Prosečna ocena:</strong> {{ round($prosek, 2) }}<br>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Predmet</th>
                <th>Rok</th>
                <th>Broj prijave</th>
                <th>Status</th>
                <th>Ocena</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($prijave as $i => $prijava)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $prijava->predmet->naziv }}</td>
                    <td>{{ $prijava->rok }}</td>
                    <td>{{ $prijava->broj_prijave }}</td>
                    <td>{{ ucfirst($prijava->status) }}</td>
                    <td>{{ $prijava->ocena ?? '-' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

</body>
</html>
