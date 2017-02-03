from django.shortcuts import render

# Create your views here.

from core.models import Task
from django.http import HttpResponse


def update(request):
    import json
    info = json.loads( request.POST['info'] )
    toupdate = Task.objects.get( id=info['id'] )

    if 'parent' in info:
        toupdate.parent_id = info['parent'];

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

def movetime(request):
    from core.models import TimeTrack, Task
    fromid = request.POST['from']
    toid = request.POST['to']

    fr = Task( id=fromid )
    to = Task( id=toid )

    for t in TimeTrack.objects.filter( task=fr ):
        t.task = to
        t.save()

    return HttpResponse( "1" )


def duplicate(request):
    from core.models import TimeTrack, Task

    # need to create new objects for me and all my children
    # they look the same, and the original is based where I am.

    def recurse(me, mytwin):
        # duplicate all my children,
        # and add them to my twin, and then do the same to their children.

        for mychild in Task.objects.filter( parent=me ):
            twinchild = Task(title=mychild.title, parent=mytwin, estimated_time=mychild.estimated_time)
            twinchild.save()

            recurse( mychild, twinchild )

    me = Task.objects.get( id=request.POST['id'] )
    mytwin = Task( title=me.title, parent=me.parent, estimated_time=me.estimated_time )
    mytwin.save()

    recurse( me, mytwin )

    return HttpResponse( "1" )