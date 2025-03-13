from django.contrib import admin

from .models import *

admin.site.register(Task)
admin.site.register(Result)
admin.site.register(Stage)
admin.site.register(Comment)
admin.site.register(Checklist)
admin.site.register(ChecklistItem)
admin.site.register(Team)
admin.site.register(Project)
# Register your models here.
