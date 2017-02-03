from core.models import TimeTrack, TimeTrack2

#start combining in either direction
def combine_left( tt ):
    print tt.start, tt.end
    import datetime
    onesec = datetime.timedelta(seconds=3)
    left = TimeTrack2.objects.filter(
        end__range=(
            tt.start - onesec,
            tt.start
        ),
        task=tt.task
    ).first()
    tt.start = left.start
    tt.save()
    left.delete()
    print tt.start, tt.end

def combine_right( tt ):
    print tt.start, tt.end
    import datetime
    onesec = datetime.timedelta(seconds=3)
    right = TimeTrack2.objects.filter(
        start__range=(
            tt.end,
            tt.end + onesec
        ),
        task=tt.task
    ).first()
    tt.end = right.end
    tt.save()
    right.delete()
    print tt.start, tt.end

import time

while 1:
    #choose a random guy
    start = TimeTrack2.objects.order_by('?').first()

    #and combine the shit out of him
    while 1:
        try:
            combine_left( start )
        except:
            break
    while 1:
        try:
            combine_right( start )
        except:
            break

    time.sleep( .5 )