import csv
import io

from celbridge import cel

SPREADSHEET = "config/gameplay.xlsx"

SHEETS = ["Enemies","Defenders","Energy","Stronghold","Waves"]


def read_settings(sheet_name):
    sheet = cel.spreadsheet.read_sheet(resource=SPREADSHEET,sheet=sheet_name)

    rows = sheet["rows"]
    headers = list(rows[0])

    while headers and headers[-1] is None:
        headers.pop()

    settings = []

    for row_number, row in enumerate(rows[1:], start=2):
        values = (list(row) + [None] * len(headers))[:len(headers)]

        if all(value is None for value in values):
            continue

        name = values[0]

        if not isinstance(name, str) or not name.strip():
            raise ValueError(
                f"{sheet_name}, row {row_number}: missing name."
            )

        values[0] = name.strip()

        for i in range(1, len(values)):
            value = values[i]

            if isinstance(value, bool) or not isinstance(value, (int, float)):
                raise ValueError(f"{sheet_name}, row {row_number}: "f"{headers[i]} should be a number.")

            if isinstance(value, float) and value.is_integer():
                values[i] = int(value)

        settings.append(values)

    return headers, settings


def write_csv(sheet_name, headers, settings):

    text = io.StringIO()
    writer = csv.writer(text, lineterminator="\n")

    writer.writerow(headers)
    writer.writerows(settings)

    csv_file = "config/" + sheet_name.lower() + ".csv"

    cel.file.write(
        file_resource=csv_file,
        content=text.getvalue()
    )

    print(f"Wrote {len(settings)} settings to {csv_file}.")


def export_gameplay():
    settings = []

    for sheet_name in SHEETS:
        headers, rows = read_settings(sheet_name)
        write_csv(sheet_name, headers, rows)

        if sheet_name in ("Enemies", "Defenders"):
            for row in rows:
                unit_name = row[0]

                for column, value in zip(headers[1:], row[1:]):
                    name = (sheet_name.lower()+ "." + unit_name+ "." + column)
                    settings.append((name, value))

        else:
            for row in rows:
                name = sheet_name.lower() + "." + row[0]
                settings.append((name, row[1]))

    text = io.StringIO()
    writer = csv.writer(text, lineterminator="\n")
    writer.writerow(["setting", "value"])
    writer.writerows(settings)

    cel.file.write(file_resource="config/gameplay.csv",content=text.getvalue())

    print(f"Wrote {len(settings)} settings to config/gameplay.csv.")

export_gameplay()
print("SURGE spreadsheet export complete.")
