from django.shortcuts import render

# Create your views here.

from core.models import Task
from django.http import HttpResponse


def update(request):
    import json
    info = json.loads( request.POST['info'] )
    toupdate = Task.objects.get( id=info['id'] )
    toupdate.title = info['title']
    toupdate.estimated_time = info['amt']
    toupdate.save()
    return HttpResponse("1")

def delete(request):
    todelete = Task.objects.get( id=request.POST['id'] )
    todelete.delete()
    return HttpResponse( "1" )


def addchild(request):
    import json
    from core.models import Task

    info = json.loads(request.POST['info'])
    parent = request.POST['parent']

    newChild = Task(
        title=info['title'],
        parent=Task.objects.get( id=parent )
    )
    newChild.save()
    return HttpResponse( newChild.id )
