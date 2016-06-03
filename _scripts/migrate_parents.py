from core.models import Task, Relationship

for o in Task.objects.all():
    if o.parent_id is None:
        continue
    r = Relationship(child=o, parent=Task.objects.get(id=o.parent_id))
    r.save()