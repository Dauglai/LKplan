from django.contrib import admin

from .models import *

admin.site.register(Task)
admin.site.register(Grade)
admin.site.register(Status)
admin.site.register(Comment)
admin.site.register(Result)
admin.site.register(Tag)
admin.site.register(Customization)
admin.site.register(ChecklistItem)

# Register your models here.
