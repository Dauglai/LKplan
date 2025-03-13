from django.contrib import admin
from .models import *


admin.site.register(Event)

admin.site.register(Status)
admin.site.register(Status_order)
admin.site.register(OrgChat)
admin.site.register(Contact)
admin.site.register(Specialization)
admin.site.register(Profile)
admin.site.register(Direction)
admin.site.register(Role)
admin.site.register(Application)

admin.site.register(Robot)
admin.site.register(Trigger)
admin.site.register(FunctionOrder)
# admin.site.register(Test)
# admin.site.register(Question)
# admin.site.register(Answer)
# admin.site.register(True_Answer)
