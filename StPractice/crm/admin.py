from django.contrib import admin
from django.contrib.contenttypes.admin import GenericTabularInline

from .models import *


class RoleInline(GenericTabularInline):
    model = Role
    extra = 1
    ct_field = 'content_type'
    ct_fk_field = 'object_id'


class EventAdmin(admin.ModelAdmin):
    inlines = [RoleInline]


class DirectionAdmin(admin.ModelAdmin):
    inlines = [RoleInline]


admin.site.register(Event, EventAdmin)

admin.site.register(Status)
admin.site.register(Status_order)
admin.site.register(OrgChat)
admin.site.register(Contact)
admin.site.register(Specialization)
admin.site.register(Profile)
admin.site.register(Direction, DirectionAdmin)
admin.site.register(Role)
admin.site.register(Application)

admin.site.register(Robot)
admin.site.register(Trigger)
admin.site.register(FunctionOrder)
# admin.site.register(Test)
# admin.site.register(Question)
# admin.site.register(Answer)
# admin.site.register(True_Answer)
