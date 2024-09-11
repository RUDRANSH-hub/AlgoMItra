from django import forms

EXCHANGE_CHOICES = [
    ('NSE', 'NSE'),
]

class CSVUploadForm(forms.Form):
    exchange = forms.ChoiceField(choices=EXCHANGE_CHOICES, required=True, label="Stock Exchange")
    csv_file = forms.FileField(label="Select CSV file")

    def clean_csv_file(self):
        csv_file = self.cleaned_data.get('csv_file')
        if not csv_file.name.endswith('.csv'):
            raise forms.ValidationError("Only CSV files are allowed.")
        return csv_file
