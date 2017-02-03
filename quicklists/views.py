from django.shortcuts import render

from django.http import response
from core.models import Task, QuickList, QuickListRelation
from django.http import HttpResponse

from core import get_info, getparents


def home(request):
    return HttpResponse( "<a href='tree'>Tree</a>" )

def addtotoday(request):

    id = request.POST['id']
    task = Task.objects.get(id=id)

    memberships = QuickListRelation.objects.filter(member=task, list=QuickList.objects.get(id=1))

    if len(memberships) > 0:
        [ x.delete() for x in memberships ];
    else:
        newr = QuickListRelation(member=task, list=QuickList.objects.get(id=1))
        newr.save()

    return HttpResponse("1")

# Create your views here.
def core(request):
    import json

    html = "<body></body>"

    info = []
    for ql in QuickList.objects.all():
        ql_info = {
            'title': ql.title,
            'children': []
        }
        for m in QuickListRelation.objects.filter(list=ql):
            ql_info['children'].append(get_info( m.member ))
        info.append(ql_info)


    info = json.dumps(info)

    html += "<script>info=%s;</script>" % (info)

    scripts = [
        "/static/cm.js",
        "/static/jquery.min.js",
        "/static/quicklists/core.js",
        "/static/timer.js",
    ]

    css = [
        "/static/quicklists/core.css",
        "/static/core.css",
        "/static/timer.css"
    ]

    for s in scripts:
        html += "<script type='text/javascript' src='%s'></script>" % s
    for s in css:
        html += "<link href='%s' rel='stylesheet'/>" % s

    return HttpResponse( html )