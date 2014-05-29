from django.db import models

# Create your models here.
class Author(models.Model):
    first_name = models.CharField(max_length=128, blank=True)
    last_name = models.CharField(max_length=128, blank=True)
    surname = models.CharField(max_length=128, blank=True)

    def __str__(self):
        return self.__unicode__()

    def __unicode__(self):
        if len(self.surname) > 0:
            return self.surname
        else:
            return self.first_name + " " + self.last_name

class SourceMetadata(models.Model):
    name = models.CharField(max_length=64)

class SourceInfos(models.Model):
    metadata = models.ForeignKey(SourceMetadata)
    value = models.CharField(max_length=64, blank=True)

class Source(models.Model):
    title = models.CharField(max_length=128)
    authors = models.ManyToManyField(Author)
    metadatas = models.ManyToManyField(SourceInfos)

    def __unicode__(self):
        author = self.main_author()
        if self.authors.count() > 1:
            author = author + " et al."
        return self.title + " (" + author.upper() + ")"

    def main_author(self):
        num_author = self.authors.count()
        if (num_author > 0):
            return str(self.authors.all()[0])
        else:
            return "Anonymous"

class Tag(models.Model):
    name= models.CharField(max_length=64)

    def __unicode__(self):
        return self.name

class Quote(models.Model):
    content = models.TextField()
    authority = models.ManyToManyField(Author)
    source = models.ForeignKey(Source, blank=True)
    tags = models.ManyToManyField(Tag, blank=True, null=True)
    page = models.CharField(max_length=32, blank=True)
    comment = models.TextField(default='')

class Template(models.Model):
    name = models.CharField(max_length=32, blank=True)
    expected_metadatas = models.ManyToManyField(SourceMetadata)
