from django.contrib import admin

from crm.models import Review
from .models import *

admin.site.register(Task)
admin.site.register(Grade)
admin.site.register(Status)
admin.site.register(Comment)
admin.site.register(Result)
admin.site.register(Tag)
admin.site.register(Customization)
admin.site.register(Review)
admin.site.register(ChecklistItem)

# Register your models here.
