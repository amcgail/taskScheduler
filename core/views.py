from django.http import HttpResponse

def getcurrenttime(request):
    import json, datetime
    from core.models import TimeTrack2
    import core
    from datetime import datetime

    nw = datetime.now()

    noend = TimeTrack2.objects.filter( end=None )
    if noend.count() > 1:
        for o in noend:
            o.end = nw
            o.save()
        return HttpResponse( "ERROR: MORE THAN ONE RUNNING")

    if noend.count() == 0:
        return HttpResponse("0")

    noend = noend.first()

    import datetime

    today_min = datetime.datetime.combine(datetime.date.today(), datetime.time.min)
    time_spent_today = 0
    for t in TimeTrack2.objects.filter(task=noend.task).filter(start__gt=today_min):
        time_spent_today += core.calc_time_spent( t )

    task = {
        "id": noend.task.id,
        "title": noend.task.title,
        "parents": core.getparents(noend.task),
        "used": time_spent_today
    }

    return HttpResponse( json.dumps( {
        "id": noend.id,
        "start": noend.start.isoformat(),
        "task": task,
        "now": datetime.datetime.now().isoformat()
    }))

def timerlog(request):
    from core.models import TimeTrack, Task

    t = Task( id=request.POST['task'] )
    newl = TimeTrack( task=t, amt=request.POST['diff'] )
    newl.save()

    return HttpResponse("1")

def timestart(request):
    from core.models import TimeTrack2
    import datetime
    import dateutil.parser
    myid = request.POST['id']
    if 'start' in request.POST:
        newstart = dateutil.parser.parse( request.POST['start'] )
    else:
        newstart = datetime.datetime.now()

    tochange = TimeTrack2.objects.get( id=myid )
    tochange.start = newstart
    tochange.save()
    return HttpResponse("1")

def timeend(request):
    from core.models import TimeTrack2
    import datetime
    import dateutil.parser
    myid = request.POST['id']
    if 'end' in request.POST:
        newend = dateutil.parser.parse( request.POST['end'] )
    else:
        newend = datetime.datetime.now()

    tochange = TimeTrack2.objects.get( id=myid )
    tochange.end = newend
    tochange.save()
    return HttpResponse("1")

def deletetime( request ):
    from core.models import TimeTrack2
    if 'id' not in request.GET:
        return HttpResponse("0")

    todelete = TimeTrack2.objects.get( id=request.GET['id'] )
    todelete.delete()
    return HttpResponse("1")

def gettimes(request):
    from core.models import TimeTrack2
    import dateutil.parser
    import json
    from django.db.models import Q

    times = TimeTrack2.objects

    if 'task' in request.POST:
        times = times.filter( task=request.POST['task'] )
    if 'start' in request.POST:
        start = dateutil.parser.parse(request.POST['start'])
        times = times.filter( start__gt=start )
    if 'end' in request.POST:
        end = dateutil.parser.parse(request.POST['end'])
        times = times.filter(Q(start__lt=end))


    toret = []
    for t in times:
        import datetime
        if t.end is None:
            t.end = datetime.datetime.now()

        toret.append( {
            "start":t.start.isoformat(),
            "end":t.end.isoformat(),
            "task":{
                "id":t.task.id,
                "title":t.task.title
            },
            "id":t.id
        } )

    return HttpResponse( json.dumps( toret ) )

def newtime(request):
    from core.models import TimeTrack2, Task
    from datetime import datetime

    mytask = Task( id=request.POST['task'] )
    mytime = TimeTrack2( task=mytask, start=datetime.now() )
    mytime.save()

    return HttpResponse( mytime.id )
