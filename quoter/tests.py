from django.test import TestCase, Client
from quoter.models import Author, Source, SourceMetadata, SourceInfos

# Create your tests here.

class AuthorTest(TestCase):
    def setUp(self):
        Author.objects.create(first_name="", last_name="", surname="Homer")
        Author.objects.create(first_name="Henry", last_name="James", surname="")

    def test_authors_display(self):
        homer = Author.objects.get(surname="Homer")
        henry_james = Author.objects.get(first_name ="Henry", last_name="James")
        self.assertEqual(unicode(homer), "Homer")
        self.assertEqual(unicode(henry_james), "Henry James")

    def test_can_retrieve_pk(self):
        homer = Author.objects.get(surname="Homer")
        self.assertTrue(homer.pk > 0)

class TestSource(TestCase):
    def setUp(self):
        Source.objects.create(title = "Odyssey")

    def test_attach_author_to_source(self):
        """Attaching one author to the source works."""
        odyssey = Source.objects.get(title = "Odyssey")
        homer = Author(first_name="", last_name="", surname="Homer")
        homer.save()
        odyssey.authors.add(homer)
        self.assertEqual(unicode(odyssey), "Odyssey (HOMER)")
        self.assertEqual(odyssey.authors.count(), 1)

    def test_attach_authors_to_source(self):
        """Attaching many authors is recognized."""
        odyssey = Source.objects.get(title = "Odyssey")
        homer = Author(first_name="", last_name="", surname="Homer")
        virgil = Author(first_name="", last_name="", surname="Virgil")
        homer.save()
        virgil.save()
        odyssey.authors.add(homer, virgil)
        self.assertEqual(unicode(odyssey), "Odyssey (HOMER ET AL.)")
        self.assertEqual(odyssey.authors.count(), 2)

    def test_detach_author_from_source(self):
        """Removing an author from a source doesn't delete the author from the
        database."""
        odyssey = Source.objects.get(title = "Odyssey")
        homer = Author(first_name="", last_name="", surname="Homer")
        homer.save()
        odyssey.authors.add(homer)
        odyssey.authors.remove(homer)
        self.assertEqual(unicode(odyssey), "Odyssey (ANONYMOUS)")
        self.assertEqual(odyssey.authors.count(), 0)
        reHomer = Author.objects.get(surname="Homer")
        self.assertEqual(reHomer, homer)

    def test_metadata(self):
        metaTrad = SourceMetadata(name="Traductor")
        metaTrad.save()
        metaInfo = SourceInfos(metadata = metaTrad, value = "Thomas Hobbes")
        metaInfo.save()
        odyssey = Source.objects.get(title = "Odyssey")
        odyssey.metadatas.add(metaInfo)
        self.assertEqual(odyssey.metadatas.count(), 1)

    def test_add_source(self):
        c = Client()
        henryTest = Author(first_name="Henry", last_name="Test", surname = "")
        henryTest.save()
        response = c.post('/source/new/',
                    {'title': 'A test source',
                    'authors' : henryTest.pk,
                    'metadatas' : 'Editeur###Flammarion@@@Collection###collec'
                    })
        self.assertEqual(response.status_code, 200)

    def test_not_colliding_metadatas(self):
        c = Client()
        henryTest = Author(first_name="Henry", last_name="Test", surname = "")
        henryTest.save()
        metadata = SourceMetadata(name='Editeur')
        # Metadata entered with initial lowercase ("editeur")
        # should be recognized as the uppercase initial ("Editeur")
        response = c.post('/source/new/',
                    {'title': 'A test source',
                    'authors' : henryTest.pk,
                    'metadatas' : 'editeur###Flammarion@@@Collection###collec'
                    })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(SourceMetadata.objects.filter(name__icontains =
                    "editeur").count(), 1)
