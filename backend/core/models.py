import mongoengine as me
from datetime import datetime


class UserProfile(me.Document):
    user_id = me.IntField(required=True, unique=True)
    username = me.StringField(required=True, max_length=150)
    email = me.EmailField(required=True)
    first_name = me.StringField(max_length=150, blank=True)
    last_name = me.StringField(max_length=150, blank=True)
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'user_profiles',
        'indexes': ['user_id', 'email', 'username'],
    }

    def __str__(self):
        return self.username
