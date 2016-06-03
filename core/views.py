from django.http import HttpResponse

def timerlog(request):
    from core.models import TimeTrack, Task

    t = Task( id=request.POST['task'] )
    newl = TimeTrack( task=t, amt=request.POST['diff'] )
    newl.save()

    return HttpResponse("1")