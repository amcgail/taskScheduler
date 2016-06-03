from django.shortcuts import render

from django.http import response
from core.models import Task
from django.http import HttpResponse


def home(request):
    return HttpResponse( "<a href='tree'>Tree</a>" )


def get_info( me ):
    children = Task.objects.filter( parent=me )

    jc = []
    for c in children:
        jc.append( get_info(c) )

    return {
        "id": me.id,
        "title": me.title,
        "amt": me.estimated_time,
        "children": jc
    }


def getparents( obj ):
    me = {
        "id": obj.id,
        "title": obj.title
    }
    if obj.parent_id is None:
        return [me]

    mydad = Task.objects.get( id=obj.parent_id )
    return [me] + getparents(mydad)


# Create your views here.
def core(request, id):
    import json

    html = "<body></body>"

    if id == "":
        id = 1

    info = json.dumps( get_info( Task.objects.get( id=int(id) ) ) )
    parents = json.dumps( getparents( Task.objects.get( id=int(id) ) ) )

    html += "<script>info=%s;parents=%s;</script>" % (info,parents)

    scripts = [
        "/static/jquery.min.js",
        "/static/tree/core.js",
    ]
    for s in scripts:
        html += "<script type='text/javascript' src='%s'></script>" % s

    html += "<link href='/static/tree/core.css' rel='stylesheet'/>"

    return HttpResponse( html )