from django.contrib import admin

from crm.admin import RoleInline
from .models import *


class ProjectAdmin(admin.ModelAdmin):
    inlines = [RoleInline]


admin.site.register(Task)
admin.site.register(Result)
admin.site.register(Stage)
admin.site.register(Comment)
admin.site.register(Checklist)
admin.site.register(ChecklistItem)
admin.site.register(Team)
admin.site.register(Project, ProjectAdmin)
admin.site.register(Meeting)
# Register your models here.
