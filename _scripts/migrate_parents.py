from core.models import Task, Link

for o in Task.objects.all():
    if o.parent_id is None:
        continue
    r = Link(fr=o, to=Task.objects.get(id=o.parent_id), type='child')
    r.save()