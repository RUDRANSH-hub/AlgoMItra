import csv
from io import StringIO
from django.contrib import admin, messages
from django.shortcuts import render, redirect
from django.urls import path
from .models import Stock
from .forms import CSVUploadForm

class StockAdmin(admin.ModelAdmin):
    change_list_template = "admin/stock_changelist.html"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('upload-csv/', self.admin_site.admin_view(self.upload_csv), name='upload-csv'),
        ]
        return custom_urls + urls

    def upload_csv(self, request):
        if request.method == "POST":
            form = CSVUploadForm(request.POST, request.FILES)
            if form.is_valid():
                csv_file = request.FILES['csv_file'].read().decode('utf-8')
                csv_reader = csv.reader(StringIO(csv_file))
                next(csv_reader)  # Skip the header row

                for row in csv_reader:
                    
                    Stock.objects.update_or_create(
                        symbol=row[3],
                        defaults={
                            'name_of_company': row[8],  
                            'token': row[1],            
                        }
                    )
                messages.success(request, "CSV file uploaded successfully.")
                return redirect("..")
        else:
            form = CSVUploadForm()

        return render(request, "admin/csv_upload.html", {"form": form})

admin.site.register(Stock, StockAdmin)
