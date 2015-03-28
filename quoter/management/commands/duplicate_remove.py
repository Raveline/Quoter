from django.core.management.base import BaseCommand
from quoter.models import Tag, Folder, Quote


class Command(BaseCommand):
    help = 'Remove all duplicates in tags (legacy issue)'

    def _detect_duplicates_in(self, tags):
        result = []  # What we will return
        handled = []  # Already handled tags so we don't deal with duplicates
        for tag in tags:
            if tag.name not in handled:
                duplicates = [t for t in tags if t.pk != tag.pk and
                              t.name == tag.name]
                if duplicates:
                    result.append((tag, duplicates))
                    handled.append(tag.name)
        return result

    def _update(self, original, duplicate):
        for q in Quote.objects.filter(tags__id__contains=duplicate.pk):
            # There is an improbable but potential case where two identical tags
            # were put on the same quote - then we just remove the duplicate
            new_tags = [t for t in q.tags.all() if t.pk != duplicate.pk]
            if original not in q.tags.all():
                # More likely situation where we replace the duplicate
                # by the original
                new_tags.append(original)
            q.tags = new_tags
            q.save()

    def handle(self, *args, **options):
        for folder in Folder.objects.all():
            all_tags = Tag.objects.filter(folder_id=folder.pk)
            duplicates = self._detect_duplicates_in(all_tags)
            for original, duplicate in duplicates:
                self.stdout.write('Handling duplicates of %s' % original)
                for dup in duplicate:
                    self._update(original, dup)
                    dup.delete()
                self.stdout.write('Handled duplicates of %s' % original)
